'use server';

import { revalidateTag } from 'next/cache';

function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag);
  } catch {
    // No-op when executed inside standalone Vitest test runner outside Next.js request store
  }
}
import {
  createCarHireBookingSchema,
  createCheckoutSessionSchema,
  createFibrexEnquirySchema,
  createLogisticsShipmentSchema,
  createMtnDistributionRequestSchema,
  createPropertyManagementRequestSchema,
  createReturnRequestSchema,
  createStayBookingSchema,
  upsertCartItemSchema,
  type ActionResponse,
  type CheckoutPaymentProvider,
} from '@/lib/validations/contracts';
import {
  SEED_FLEET_VEHICLES,
  SEED_PRODUCTS_ALL,
  SEED_STAY_PROPERTIES,
} from '@/lib/db/seed-data';
import { readCmsStoreAsync } from '@/server/services/cms-store';
import {
  calculateOrderTotalKobo,
  calculateStayQuoteKobo,
  formatKoboToNaira,
} from '@/lib/money';
import {
  evaluateCarHireLeadTime,
  evaluateReturnWindow24h,
  generateReferenceCode,
} from '@/lib/utils';
import { WhatsAppTemplates } from '@/lib/whatsapp';
import { checkRateLimit } from '@/server/services/rate-limit';

export interface UpsertCartItemData {
  cartId: string;
  itemCount: number;
  subtotalKobo: number;
}

export async function upsertCartItemAction(
  rawInput: unknown
): Promise<ActionResponse<UpsertCartItemData>> {
  const parsed = upsertCartItemSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Invalid cart item payload.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const { variantId, quantity } = parsed.data;
  const store = await readCmsStoreAsync();
  const variant =
    store.products.flatMap((p) => p.variants).find((v) => v.id === variantId) ??
    SEED_PRODUCTS_ALL.flatMap((p) => p.variants).find((v) => v.id === variantId);

  if (!variant) {
    return {
      data: null,
      error: {
        code: 'ERR_NOT_FOUND',
        message: 'Selected product variant does not exist.',
      },
    };
  }

  if (quantity > variant.availableStock) {
    return {
      data: null,
      error: {
        code: 'ERR_INSUFFICIENT_STOCK',
        message: `Only ${variant.availableStock} unit(s) currently available in stock.`,
      },
    };
  }

  const cartId = 'cart-session-active';
  const subtotalKobo = variant.priceKobo * quantity;
  safeRevalidateTag(`cart-${cartId}`);

  return {
    data: {
      cartId,
      itemCount: quantity,
      subtotalKobo,
    },
    error: null,
  };
}

export type CheckoutVerifyMethod =
  | 'BANK_TRANSFER'
  | 'SANDBOX'
  | 'PAYSTACK_SANDBOX'
  | 'FLUTTERWAVE_SANDBOX'
  | 'PAYSTACK'
  | 'FLUTTERWAVE';

export interface InitializeCheckoutData {
  orderNumber: string;
  authorizationUrl: string;
  reference: string;
  whatsappFallbackUrl: string;
  paymentMethod: CheckoutPaymentProvider;
  paymentMode: 'MANUAL' | 'SANDBOX' | 'LIVE';
  subtotalKobo: number;
  deliveryFeeKobo: number;
  totalAmountKobo: number;
}

function isLiveGatewayConfigured(provider: 'PAYSTACK' | 'FLUTTERWAVE'): boolean {
  const configuredMode = process.env.NEXT_PUBLIC_PAYMENT_MODE?.trim().toLowerCase();
  if (configuredMode === 'sandbox' || configuredMode === 'manual') {
    return false;
  }
  if (provider === 'PAYSTACK') {
    const key = process.env.PAYSTACK_SECRET_KEY?.trim() ?? '';
    return key.startsWith('sk_live_') && !key.toLowerCase().includes('placeholder');
  }
  const flwKey = process.env.FLUTTERWAVE_SECRET_KEY?.trim() ?? '';
  return (
    flwKey.length >= 16 &&
    !flwKey.startsWith('FLWSECK_TEST') &&
    !flwKey.toLowerCase().includes('placeholder')
  );
}

function getFulfillmentDisplayLabel(
  fulfillmentType: 'ABUJA_DOORSTEP_DELIVERY' | 'INTER_STATE_DELIVERY' | 'WUYE_IN_STORE_PICKUP'
): string {
  if (fulfillmentType === 'WUYE_IN_STORE_PICKUP') {
    return 'In-Store Pickup (Suite 83 / Block B70, H&A Plaza, Wuye, Abuja)';
  }
  if (fulfillmentType === 'INTER_STATE_DELIVERY') {
    return 'Inter-State Courier Delivery';
  }
  return 'Abuja Doorstep Delivery';
}

export async function initializeCheckoutAction(
  rawInput: unknown,
  cartItemsInput: ReadonlyArray<{ variantId: string; quantity: number }> = []
): Promise<ActionResponse<InitializeCheckoutData>> {
  const rate = checkRateLimit({
    bucketKey: 'initializeCheckoutAction',
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
  });

  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: 'ERR_RATE_LIMITED',
        message: 'Too many checkout attempts. Please wait a few minutes.',
      },
    };
  }

  const parsed = createCheckoutSessionSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please check your checkout details.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  if (!Array.isArray(cartItemsInput) || cartItemsInput.length === 0) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          'Your shopping bag is empty. Add at least one item before checking out.',
      },
    };
  }

  const aggregatedQuantities = new Map<string, number>();
  for (const item of cartItemsInput) {
    if (
      !item.variantId ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.quantity > 20
    ) {
      return {
        data: null,
        error: {
          code: 'ERR_VALIDATION_FAILED',
          message: 'One or more bag items have an invalid quantity.',
        },
      };
    }
    const nextQty = (aggregatedQuantities.get(item.variantId) ?? 0) + item.quantity;
    aggregatedQuantities.set(item.variantId, nextQty);
  }

  const store = await readCmsStoreAsync();
  const resolvedItems: { unitPriceKobo: number; quantity: number }[] = [];
  let totalItemCount = 0;

  for (const [variantId, quantity] of aggregatedQuantities.entries()) {
    const variant =
      store.products
        .flatMap((p) => p.variants)
        .find((v) => v.id === variantId) ??
      SEED_PRODUCTS_ALL.flatMap((p) => p.variants).find(
        (v) => v.id === variantId
      );
    if (!variant) {
      return {
        data: null,
        error: {
          code: 'ERR_NOT_FOUND',
          message:
            'One of the items in your bag is no longer available. Please refresh your bag.',
        },
      };
    }
    if (variant.availableStock < quantity) {
      return {
        data: null,
        error: {
          code: 'ERR_INSUFFICIENT_STOCK',
          message: `Insufficient stock for SKU ${variant.sku} (${variant.availableStock} left).`,
        },
      };
    }
    resolvedItems.push({
      unitPriceKobo: variant.priceKobo,
      quantity,
    });
    totalItemCount += quantity;
  }

  const totals = calculateOrderTotalKobo({
    items: resolvedItems,
    fulfillmentType: parsed.data.fulfillmentType,
  });

  const orderNumber = generateReferenceCode('ORD');
  const requestedProvider = parsed.data.paymentProvider;
  const forceSandbox = parsed.data.sandboxMode === true;

  let paymentMode: 'MANUAL' | 'SANDBOX' | 'LIVE' = 'SANDBOX';
  let verifyMethod: CheckoutVerifyMethod = 'SANDBOX';
  let reference = `SANDBOX_${orderNumber}`;

  if (requestedProvider === 'BANK_TRANSFER') {
    paymentMode = 'MANUAL';
    verifyMethod = 'BANK_TRANSFER';
    reference = `MANUAL_${orderNumber}`;
  } else if (requestedProvider === 'SANDBOX' || forceSandbox) {
    paymentMode = 'SANDBOX';
    verifyMethod =
      requestedProvider === 'PAYSTACK'
        ? 'PAYSTACK_SANDBOX'
        : requestedProvider === 'FLUTTERWAVE'
          ? 'FLUTTERWAVE_SANDBOX'
          : 'SANDBOX';
    reference =
      requestedProvider === 'FLUTTERWAVE'
        ? `FLW_SANDBOX_${orderNumber}`
        : requestedProvider === 'PAYSTACK'
          ? `PSTK_SANDBOX_${orderNumber}`
          : `SANDBOX_${orderNumber}`;
  } else if (
    (requestedProvider === 'PAYSTACK' || requestedProvider === 'FLUTTERWAVE') &&
    isLiveGatewayConfigured(requestedProvider)
  ) {
    // Live key present: prepare gateway-scoped verification reference
    paymentMode = 'LIVE';
    verifyMethod = requestedProvider;
    reference =
      requestedProvider === 'FLUTTERWAVE'
        ? `FLW_${orderNumber}`
        : `PSTK_${orderNumber}`;
  } else {
    // Graceful sandbox fallback when Paystack/Flutterwave live keys are unset
    paymentMode = 'SANDBOX';
    verifyMethod =
      requestedProvider === 'FLUTTERWAVE'
        ? 'FLUTTERWAVE_SANDBOX'
        : 'PAYSTACK_SANDBOX';
    reference =
      requestedProvider === 'FLUTTERWAVE'
        ? `FLW_SANDBOX_${orderNumber}`
        : `PSTK_SANDBOX_${orderNumber}`;
  }

  const verifyParams = new URLSearchParams({
    reference,
    order: orderNumber,
    totalKobo: String(totals.totalAmountKobo),
    subtotalKobo: String(totals.subtotalKobo),
    deliveryKobo: String(totals.deliveryFeeKobo),
    fulfillment: parsed.data.fulfillmentType,
    method: verifyMethod,
    items: String(totalItemCount),
    customer: parsed.data.customerName,
  });

  const authorizationUrl = `/checkout/verify?${verifyParams.toString()}`;

  const paymentSummaryNote =
    paymentMode === 'MANUAL'
      ? 'Bank Transfer / Wuye POS (Awaiting Transfer Receipt)'
      : paymentMode === 'SANDBOX'
        ? 'Sandbox Test Verification'
        : requestedProvider;

  const whatsappFallbackUrl = WhatsAppTemplates.fashionOrderEnquiry({
    orderNumber: `${orderNumber} (${paymentSummaryNote})`,
    fulfillment: getFulfillmentDisplayLabel(parsed.data.fulfillmentType),
    totalFormatted: formatKoboToNaira(totals.totalAmountKobo),
  });

  safeRevalidateTag('inventory');
  safeRevalidateTag('orders');

  return {
    data: {
      orderNumber,
      authorizationUrl,
      reference,
      whatsappFallbackUrl,
      paymentMethod: requestedProvider,
      paymentMode,
      subtotalKobo: totals.subtotalKobo,
      deliveryFeeKobo: totals.deliveryFeeKobo,
      totalAmountKobo: totals.totalAmountKobo,
    },
    error: null,
  };
}

export interface SubmitReturnRequestData {
  returnId: string;
  status: 'PENDING_INSPECTION';
  remainingHoursWhenFiled: number;
  whatsappConciergeUrl: string;
}

export async function submitReturnRequestAction(
  rawInput: unknown,
  orderReceiptTimestamp: Date = new Date(Date.now() - 4 * 60 * 60 * 1000)
): Promise<ActionResponse<SubmitReturnRequestData>> {
  const parsed = createReturnRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please complete all required return fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const windowEval = evaluateReturnWindow24h(orderReceiptTimestamp);
  if (!windowEval.eligible) {
    return {
      data: null,
      error: {
        code: windowEval.errorCode ?? 'ERR_RETURN_WINDOW_EXPIRED',
        message: windowEval.message,
      },
    };
  }

  const returnId = generateReferenceCode('RET');
  const whatsappConciergeUrl = WhatsAppTemplates.fashionOrderEnquiry({
    orderNumber: `${parsed.data.orderNumber} (24h Return Ref: ${returnId})`,
    fulfillment: 'Wuye Boutique Return Inspection (Suite 83, H&A Plaza, Wuye)',
    totalFormatted: parsed.data.reason,
  });

  safeRevalidateTag('orders');

  return {
    data: {
      returnId,
      status: 'PENDING_INSPECTION',
      remainingHoursWhenFiled: windowEval.remainingHours,
      whatsappConciergeUrl,
    },
    error: null,
  };
}

export interface SubmitStayBookingData {
  bookingReference: string;
  totalAmountKobo: number;
  whatsappConfirmUrl: string;
}

export async function submitStayBookingAction(
  rawInput: unknown
): Promise<ActionResponse<SubmitStayBookingData>> {
  const rate = checkRateLimit({
    bucketKey: 'submitStayBookingAction',
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: 'ERR_RATE_LIMITED',
        message: 'Too many reservation requests. Please wait a few minutes.',
      },
    };
  }

  const parsed = createStayBookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ?? 'Invalid stay reservation inputs.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const store = await readCmsStoreAsync();
  const property =
    store.stayProperties.find((p) => p.id === parsed.data.propertyId) ??
    SEED_STAY_PROPERTIES.find((p) => p.id === parsed.data.propertyId) ??
    store.stayProperties[0] ??
    SEED_STAY_PROPERTIES[0];

  if (!property) {
    return {
      data: null,
      error: {
        code: 'ERR_NOT_FOUND',
        message: 'Selected short-let property was not found.',
      },
    };
  }

  const reqStart = new Date(parsed.data.checkInDate).getTime();
  const reqEnd = new Date(parsed.data.checkOutDate).getTime();

  const hasOverlap = property.blockedDates.some((b) => {
    const bStart = new Date(b.startDate).getTime();
    const bEnd = new Date(b.endDate).getTime();
    return bStart < reqEnd && bEnd > reqStart;
  });

  if (hasOverlap) {
    return {
      data: null,
      error: {
        code: 'ERR_STAY_DATES_UNAVAILABLE',
        message:
          'Selected dates overlap with an existing reservation. Please choose alternative dates.',
      },
    };
  }

  const selectedRoom = parsed.data.roomId
    ? property.rooms.find((r) => r.id === parsed.data.roomId) ?? null
    : null;

  const maxGuestsAllowed = selectedRoom
    ? selectedRoom.occupancy
    : property.maxGuests;

  if (parsed.data.guestsCount > maxGuestsAllowed) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: `Maximum capacity for ${
          selectedRoom ? selectedRoom.name : property.title
        } is ${maxGuestsAllowed} guest(s).`,
      },
    };
  }

  const nightlyRateKobo = selectedRoom
    ? selectedRoom.nightlyRateKobo
    : property.nightlyRateKobo;
  const weeklyRateKobo = selectedRoom
    ? selectedRoom.nightlyRateKobo * 7
    : property.weeklyRateKobo;
  const monthlyRateKobo = selectedRoom
    ? selectedRoom.nightlyRateKobo * 28
    : property.monthlyRateKobo;

  const quote = calculateStayQuoteKobo({
    checkInDate: parsed.data.checkInDate,
    checkOutDate: parsed.data.checkOutDate,
    bookingMode: parsed.data.bookingMode,
    nightlyRateKobo,
    weeklyRateKobo,
    monthlyRateKobo,
    cautionDepositKobo: property.cautionDepositKobo,
  });

  const bookingReference = generateReferenceCode('STAY');
  const propertyDescriptor = selectedRoom
    ? `${property.title} — ${selectedRoom.name} (${property.estateName}, ${property.district})`
    : `${property.title} (${property.estateName}, ${property.district})`;

  const whatsappConfirmUrl = WhatsAppTemplates.stayReservation({
    ref: bookingReference,
    property: propertyDescriptor,
    mode:
      parsed.data.bookingMode === 'FURNISHED_ACCOMMODATION'
        ? `Extended Furnished Stay (${quote.appliedTier})`
        : `Short-Let Stay (${quote.nightsCount} nights)`,
    checkIn: parsed.data.checkInDate,
    checkOut: parsed.data.checkOutDate,
    guests: parsed.data.guestsCount,
    totalFormatted: formatKoboToNaira(quote.totalAmountKobo),
  });

  safeRevalidateTag('stays-availability');

  return {
    data: {
      bookingReference,
      totalAmountKobo: quote.totalAmountKobo,
      whatsappConfirmUrl,
    },
    error: null,
  };
}

export interface SubmitPropertyMgmtData {
  referenceCode: string;
  whatsappPartnerUrl: string;
}

export async function submitPropertyMgmtAction(
  rawInput: unknown
): Promise<ActionResponse<SubmitPropertyMgmtData>> {
  const parsed = createPropertyManagementRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please check your property onboarding details.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const referenceCode = generateReferenceCode('PM');
  const whatsappPartnerUrl = WhatsAppTemplates.propertyManagement({
    ref: referenceCode,
    owner: parsed.data.ownerName,
    propertyType: parsed.data.propertyType,
    bedrooms: parsed.data.bedrooms,
    district: parsed.data.district,
  });

  safeRevalidateTag('admin-property-mgmt');

  return {
    data: {
      referenceCode,
      whatsappPartnerUrl,
    },
    error: null,
  };
}

export interface SubmitCarHireBookingData {
  bookingReference: string;
  isUnderTwoHoursNotice: boolean;
  whatsappBookUrl: string;
}

export async function submitCarHireBookingAction(
  rawInput: unknown
): Promise<ActionResponse<SubmitCarHireBookingData>> {
  const rate = checkRateLimit({
    bucketKey: 'submitCarHireBookingAction',
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: 'ERR_RATE_LIMITED',
        message: 'Too many car hire booking requests. Please wait a moment.',
      },
    };
  }

  const parsed = createCarHireBookingSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please complete all required car hire booking fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const store = await readCmsStoreAsync();
  const vehicle =
    store.fleetVehicles.find((v) => v.id === parsed.data.vehicleId) ??
    SEED_FLEET_VEHICLES.find((v) => v.id === parsed.data.vehicleId) ??
    store.fleetVehicles[0] ??
    SEED_FLEET_VEHICLES[0];

  const leadEval = evaluateCarHireLeadTime(parsed.data.pickupTimestamp);
  const bookingReference = generateReferenceCode('CAR');
  const pickupDateObj = new Date(parsed.data.pickupTimestamp);

  const whatsappBookUrl = WhatsAppTemplates.carHireBooking({
    ref: bookingReference,
    name: parsed.data.customerName,
    phone: parsed.data.customerPhone,
    serviceType: parsed.data.serviceType,
    vehicle: vehicle?.name ?? 'Executive Vehicle',
    pickup: parsed.data.pickupLocation,
    destination: `${parsed.data.destinationLocation} (${parsed.data.destinationState})`,
    date: pickupDateObj.toISOString().slice(0, 10),
    time: pickupDateObj.toISOString().slice(11, 16),
    flightNumber: parsed.data.flightNumber,
  });

  safeRevalidateTag('admin-car-hire');

  return {
    data: {
      bookingReference,
      isUnderTwoHoursNotice: leadEval.isUnderTwoHoursNotice,
      whatsappBookUrl,
    },
    error: null,
  };
}

export interface SubmitLogisticsShipmentData {
  waybillNumber: string;
  whatsappDispatchUrl: string;
}

export async function submitLogisticsShipmentAction(
  rawInput: unknown
): Promise<ActionResponse<SubmitLogisticsShipmentData>> {
  const rate = checkRateLimit({
    bucketKey: 'submitLogisticsShipmentAction',
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: 'ERR_RATE_LIMITED',
        message: 'Too many shipment booking requests. Please wait a moment.',
      },
    };
  }

  const parsed = createLogisticsShipmentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please check your cargo/dispatch shipment fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const waybillNumber = generateReferenceCode('WB');
  const whatsappDispatchUrl = WhatsAppTemplates.logisticsShipment({
    waybill: waybillNumber,
    type: parsed.data.shipmentType,
    pickup: parsed.data.pickupAddress,
    delivery: `${parsed.data.deliveryAddress} (${parsed.data.destinationState})`,
    weightKg: parsed.data.estimatedWeightKg,
  });

  safeRevalidateTag('admin-logistics');

  return {
    data: {
      waybillNumber,
      whatsappDispatchUrl,
    },
    error: null,
  };
}

export interface SubmitFibrexEnquiryData {
  referenceCode: string;
  whatsappAvailabilityUrl: string;
}

export async function submitFibrexEnquiryAction(
  rawInput: unknown
): Promise<ActionResponse<SubmitFibrexEnquiryData>> {
  const rate = checkRateLimit({
    bucketKey: 'submitFibrexEnquiryAction',
    maxRequests: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!rate.allowed) {
    return {
      data: null,
      error: {
        code: 'ERR_RATE_LIMITED',
        message: 'Too many FibreX enquiries. Please wait a few minutes.',
      },
    };
  }

  const parsed = createFibrexEnquirySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please complete all required MTN FibreX verification fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const referenceCode = generateReferenceCode('FX');
  const whatsappAvailabilityUrl = WhatsAppTemplates.mtnFibrexAvailability({
    ref: referenceCode,
    name: parsed.data.customerName,
    phone: parsed.data.customerPhone,
    estate: `${parsed.data.estateName}, ${parsed.data.abujaDistrict}`,
    address: parsed.data.streetAddress,
    requestType: parsed.data.requestType,
  });

  safeRevalidateTag('admin-fibrex');

  return {
    data: {
      referenceCode,
      whatsappAvailabilityUrl,
    },
    error: null,
  };
}

export interface SubmitMtnDistributionData {
  referenceCode: string;
  whatsappB2bUrl: string;
}

export async function submitMtnDistributionAction(
  rawInput: unknown
): Promise<ActionResponse<SubmitMtnDistributionData>> {
  const parsed = createMtnDistributionRequestSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please check your MTN B2B distribution enquiry fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const referenceCode = generateReferenceCode('MTNB2B');
  const whatsappB2bUrl = WhatsAppTemplates.mtnB2bDistribution({
    ref: referenceCode,
    company: parsed.data.companyName,
    category: parsed.data.distributionCategory,
    units: parsed.data.estimatedUnits,
    location: parsed.data.deliveryLocation,
  });

  safeRevalidateTag('admin-mtn-b2b');

  return {
    data: {
      referenceCode,
      whatsappB2bUrl,
    },
    error: null,
  };
}
