import { z } from 'zod';

export type ActionErrorCode =
  | 'ERR_VALIDATION_FAILED'
  | 'ERR_UNAUTHORIZED'
  | 'ERR_FORBIDDEN'
  | 'ERR_RATE_LIMITED'
  | 'ERR_INSUFFICIENT_STOCK'
  | 'ERR_STAY_DATES_UNAVAILABLE'
  | 'ERR_RETURN_WINDOW_EXPIRED'
  | 'ERR_PAYMENT_INIT_FAILED'
  | 'ERR_NOT_FOUND'
  | 'ERR_DUPLICATE_CATEGORY'
  | 'ERR_INTERNAL_SERVER';

export type ActionResponse<T> =
  | { data: T; error: null }
  | {
      data: null;
      error: {
        code: ActionErrorCode;
        message: string;
        fieldErrors?: Record<string, string[]>;
      };
    };

export const nigerianPhoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+?234|0)[789][01]\d{8}$/,
    'Enter a valid Nigerian phone number (e.g. +2348064912969 or 08064912969)'
  );

export const koboAmountSchema = z
  .number()
  .int('Monetary values must be integer kobo (100 kobo = ₦1.00)')
  .nonnegative();

export const fulfillmentTypeSchema = z.enum([
  'ABUJA_DOORSTEP_DELIVERY',
  'INTER_STATE_DELIVERY',
  'WUYE_IN_STORE_PICKUP',
]);

export const upsertCartItemSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(0).max(20),
  fulfillmentType: fulfillmentTypeSchema.optional(),
});

export const paymentProviderSchema = z.enum([
  'BANK_TRANSFER',
  'SANDBOX',
  'PAYSTACK',
  'FLUTTERWAVE',
]);

export type CheckoutPaymentProvider = z.infer<typeof paymentProviderSchema>;

export const createCheckoutSessionSchema = z
  .object({
    customerName: z.string().trim().min(2, 'Please enter your full name.').max(120),
    customerEmail: z.string().trim().email('Please enter a valid email address.'),
    customerPhone: nigerianPhoneSchema,
    fulfillmentType: fulfillmentTypeSchema,
    shippingAddress: z
      .object({
        streetAddress: z
          .string()
          .trim()
          .min(5, 'Please enter your delivery street address (at least 5 characters).'),
        districtOrCity: z
          .string()
          .trim()
          .min(2, 'Please enter your district or city.'),
        state: z.string().trim().min(2).default('FCT - Abuja'),
        landmark: z.string().trim().optional(),
      })
      .optional(),
    paymentProvider: paymentProviderSchema.default('PAYSTACK'),
    sandboxMode: z.boolean().optional(),
    returnPolicyAcknowledged: z.literal(true, {
      errorMap: () => ({
        message: 'You must acknowledge the 24-hour return policy from receipt.',
      }),
    }),
  })
  .refine(
    (data) =>
      data.fulfillmentType === 'WUYE_IN_STORE_PICKUP' ||
      Boolean(data.shippingAddress),
    {
      message: 'Shipping address is required for doorstep and inter-state delivery.',
      path: ['shippingAddress'],
    }
  );

export const createReturnRequestSchema = z.object({
  orderNumber: z.string().min(5),
  customerEmail: z.string().email(),
  reason: z.enum([
    'SIZE_EXCHANGE',
    'DEFECTIVE_OR_DAMAGED',
    'WRONG_ITEM_RECEIVED',
    'OTHER_ELIGIBLE_REASON',
  ]),
  conditionNotes: z.string().min(10).max(1000),
  unwornConditionConfirmed: z.literal(true),
  evidenceUrls: z.array(z.string().url()).max(4).optional(),
});

export const createStayBookingSchema = z
  .object({
    propertyId: z.string().uuid(),
    roomId: z.string().trim().min(1).optional(),
    guestName: z.string().trim().min(2, 'Please enter your full name.').max(120),
    guestEmail: z.string().trim().email('Please enter a valid email address.'),
    guestPhone: nigerianPhoneSchema,
    bookingMode: z.enum(['SHORT_LET', 'FURNISHED_ACCOMMODATION']),
    checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    guestsCount: z.number().int().min(1).max(8),
    specialRequests: z.string().max(500).optional(),
  })
  .refine((d) => new Date(d.checkOutDate) > new Date(d.checkInDate), {
    message: 'Check-out date must be after check-in date.',
    path: ['checkOutDate'],
  });

export const createPropertyManagementRequestSchema = z.object({
  ownerName: z.string().min(2).max(120),
  ownerEmail: z.string().email(),
  ownerPhone: nigerianPhoneSchema,
  propertyType: z.enum([
    'DUPLEX',
    'TERRACE',
    'APARTMENT',
    'PENTHOUSE',
    'COMMERCIAL_BLOCK',
  ]),
  district: z.string().min(2).max(100),
  estateName: z.string().max(120).optional(),
  bedrooms: z.number().int().min(1).max(20),
  unitsCount: z.number().int().min(1).max(100).default(1),
  furnishingStatus: z.enum([
    'FULLY_FURNISHED',
    'SEMI_FURNISHED',
    'UNFURNISHED',
  ]),
  targetManagementModel: z.enum([
    'SHORT_LET_MANAGEMENT',
    'CORPORATE_FURNISHED_LEASE',
    'FULL_FACILITY_MANAGEMENT',
  ]),
  notes: z.string().max(1000).optional(),
});

export const createCarHireBookingSchema = z
  .object({
    vehicleId: z.string().uuid(),
    customerName: z.string().min(2).max(120),
    customerPhone: nigerianPhoneSchema,
    customerEmail: z.string().email().optional(),
    serviceType: z.enum([
      'INTRA_CITY_HIRE',
      'AIRPORT_TRANSFER',
      'INTER_STATE_CHARTER',
    ]),
    durationMode: z.enum(['HOURLY', 'DAILY', 'FIXED_TRANSFER']),
    hoursOrDays: z.number().int().min(1).max(60).default(1),
    pickupLocation: z.string().min(3).max(200),
    destinationLocation: z.string().min(3).max(200),
    destinationState: z.string().min(2).default('FCT - Abuja'),
    pickupTimestamp: z.string().datetime(),
    flightNumber: z.string().max(20).optional(),
    notes: z.string().max(500).optional(),
  })
  .refine(
    (d) =>
      d.serviceType !== 'AIRPORT_TRANSFER' ||
      Boolean(d.flightNumber && d.flightNumber.trim().length >= 3),
    {
      message: 'Flight number is required for Airport Transfers (ABV).',
      path: ['flightNumber'],
    }
  );

export const createLogisticsShipmentSchema = z.object({
  senderName: z.string().min(2).max(120),
  senderPhone: nigerianPhoneSchema,
  recipientName: z.string().min(2).max(120),
  recipientPhone: nigerianPhoneSchema,
  shipmentType: z.enum([
    'INTRA_ABUJA_DISPATCH',
    'INTER_STATE_CARGO',
    'COMMERCIAL_HAULAGE',
  ]),
  pickupAddress: z.string().min(5).max(240),
  deliveryAddress: z.string().min(5).max(240),
  destinationState: z.string().min(2).default('FCT - Abuja'),
  packageDescription: z.string().min(3).max(500),
  estimatedWeightKg: z.number().positive().max(30000),
  declaredValueKobo: koboAmountSchema.optional(),
});

export const createFibrexEnquirySchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: nigerianPhoneSchema,
  customerEmail: z.string().email().optional(),
  abujaDistrict: z.string().min(2).max(100),
  estateName: z.string().min(2).max(140),
  streetAddress: z.string().min(5).max(240),
  buildingType: z.enum([
    'RESIDENTIAL_SINGLE',
    'ESTATE_COMPOUND',
    'OFFICE_COMPLEX',
  ]),
  requestType: z.enum([
    'COVERAGE_CHECK',
    'NEW_INSTALLATION',
    'APPOINTMENT_BOOKING',
    'SUBSCRIPTION_RENEWAL',
  ]),
  preferredPlan: z.string().max(100).optional(),
  preferredAppointmentDate: z.string().optional(),
  mtnDisclaimerAccepted: z.literal(true, {
    errorMap: () => ({
      message:
        'You must acknowledge that coverage, installation, speed and service availability are subject to MTN confirmation.',
    }),
  }),
});

export const createMtnDistributionRequestSchema = z.object({
  companyName: z.string().min(2).max(160),
  contactPerson: z.string().min(2).max(120),
  contactPhone: nigerianPhoneSchema,
  contactEmail: z.string().email(),
  distributionCategory: z.enum([
    'BULK_5G_ROUTERS',
    'MIFI_FLEET',
    'ENTERPRISE_CONNECTIVITY',
    'TRADE_SUB_DEALER',
  ]),
  estimatedUnits: z.number().int().min(5).max(100000),
  deliveryLocation: z.string().min(3).max(200),
  notes: z.string().max(1000).optional(),
});

// --- ADMIN CMS CRUD SCHEMAS ---
export const cmsProductSubPillarSchema = z.enum([
  'CLOTHING',
  'SHOES',
  'BAGS',
  'ACCESSORIES',
  'MTN_HARDWARE',
  'MTN_SERVICE_PLAN',
]);

export const cmsRetailDivisionSchema = z.enum([
  'FASHION_BOUTIQUE',
  'MTN_SERVICES',
]);

export const cmsUpsertProductSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(2, 'Product title is required').max(160),
  subtitle: z.string().trim().max(200).optional(),
  description: z
    .string()
    .trim()
    .min(5, 'Description must be at least 5 characters')
    .max(2000),
  division: cmsRetailDivisionSchema,
  subPillar: cmsProductSubPillarSchema,
  priceNaira: z.number().positive('Price must be greater than ₦0'),
  compareAtPriceNaira: z.number().nonnegative().optional().nullable(),
  availableStock: z
    .number()
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(100000),
  wuyeFloorStock: z
    .number()
    .int()
    .min(0, 'Wuye floor stock cannot be negative')
    .max(100000)
    .optional(),
  sku: z.string().trim().min(2, 'SKU is required').max(64),
  variantTitle: z.string().trim().min(1).max(120).default('Standard'),
  size: z.string().trim().max(30).optional(),
  colorName: z.string().trim().max(50).optional(),
  colorHex: z.string().trim().max(20).optional(),
  imageUrl: z.string().trim().min(1, 'Product image URL or upload is required'),
  additionalImages: z.array(z.string().trim()).optional(),
  isWuyePickupEligible: z.boolean().default(true),
});

export const cmsQuickStockUpdateSchema = z.object({
  productId: z.string().min(1),
  availableStock: z.number().int().min(0).max(100000),
  wuyeFloorStock: z.number().int().min(0).max(100000).optional(),
});

export const cmsDeleteEntitySchema = z.object({
  id: z.string().min(1, 'Entity ID is required'),
});

export const cmsUpsertCategorySchema = z.object({
  id: z.string().trim().min(2).max(60),
  label: z
    .string()
    .trim()
    .min(2, 'Category name cannot be empty')
    .max(80),
  division: cmsRetailDivisionSchema,
  description: z.string().trim().min(2).max(300),
  isActive: z.boolean().default(true),
});

export const cmsUpsertStayCategorySchema = z.object({
  id: z.string().trim().optional(),
  name: z
    .string()
    .trim()
    .min(2, 'Category name is required')
    .max(80),
  description: z.string().trim().max(300).default(''),
  isActive: z.boolean().default(true),
});

export const cmsDeleteStayCategorySchema = z.object({
  id: z.string().trim().min(1, 'Category ID is required'),
  reassignToCategoryName: z.string().trim().optional(),
});

export const cmsPageSectionSchema = z.object({
  id: z.string().min(1),
  eyebrow: z.string().trim().max(100).optional(),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(2).max(1000),
  imageUrl: z.string().trim().optional(),
  ctaText: z.string().trim().max(60).optional(),
  ctaHref: z.string().trim().max(200).optional(),
});

export const cmsHeroTileSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1).max(80),
  subtitle: z.string().trim().max(120).optional(),
  imageUrl: z.string().trim().min(1),
  href: z.string().trim().min(1),
});

export const cmsUpsertPageConfigSchema = z.object({
  path: z.enum([
    '/',
    '/shop/clothes',
    '/mtn-services/fibrex',
    '/stays',
    '/car-hire',
    '/about',
    '/contact',
    '/faqs',
  ]),
  pageName: z.string().trim().min(2).max(100),
  heroEyebrow: z.string().trim().min(1).max(140),
  heroHeadline: z.string().trim().min(2).max(200),
  heroDescription: z.string().trim().min(5).max(600),
  primaryCtaText: z.string().trim().min(1).max(60),
  primaryCtaHref: z.string().trim().min(1).max(200),
  secondaryCtaText: z.string().trim().max(60).optional(),
  secondaryCtaHref: z.string().trim().max(200).optional(),
  announcementText: z.string().trim().max(240).optional(),
  heroTiles: z.array(cmsHeroTileSchema).default([]),
  customSections: z.array(cmsPageSectionSchema).default([]),
});

export const cmsStayRoomUnitSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(2, 'Room name is required').max(120),
  roomSizeSqm: z.number().positive('Room size (sqm) must be positive'),
  ensuiteSizeSqm: z.number().nonnegative('Ensuite size (sqm) cannot be negative'),
  bedType: z.string().trim().min(2, 'Bed type is required').max(120),
  occupancy: z.number().int().min(1).max(20),
  nightlyRateNaira: z.number().positive('Room nightly rate must be greater than ₦0'),
  imageUrl: z.string().trim().min(1, 'Room photo URL or upload is required'),
  description: z.string().trim().max(500).optional(),
});

export const cmsStayAmenityGroupSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(2, 'Amenity group title is required').max(120),
  items: z.array(z.string().trim().min(1)).default([]),
});

export const cmsUpsertStayPropertySchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(3).max(160),
  subtitle: z.string().trim().min(3).max(240),
  category: z.string().trim().min(2).max(80).default('Short-Let Duplex'),
  district: z.string().trim().min(2).max(100),
  estateName: z.string().trim().min(2).max(120),
  address: z.string().trim().min(5).max(300),
  bedrooms: z.number().int().min(1).max(20),
  bathrooms: z.number().int().min(1).max(20),
  maxGuests: z.number().int().min(1).max(30),
  livingRoomSizeSqm: z.number().positive().default(22),
  defaultEnsuiteSizeSqm: z.number().nonnegative().default(3),
  nightlyRateNaira: z.number().positive(),
  weeklyRateNaira: z.number().positive(),
  monthlyRateNaira: z.number().positive(),
  cautionDepositNaira: z.number().nonnegative(),
  aboutIntro: z.string().trim().max(1000).default(''),
  ourPromise: z.string().trim().max(1000).default(''),
  amenityGroups: z.array(cmsStayAmenityGroupSchema).default([]),
  rooms: z.array(cmsStayRoomUnitSchema).default([]),
  imageUrl: z.string().trim().min(1),
  additionalImages: z.array(z.string().trim()).optional(),
  amenitiesText: z.string().trim().min(3),
});

export const cmsUpsertFleetVehicleSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(3).max(140),
  category: z.enum([
    'EXECUTIVE_SEDAN',
    'LUXURY_SUV',
    'EXECUTIVE_BUS',
    'HAULAGE_VAN',
  ]),
  hourlyRateNaira: z.number().positive(),
  dailyIntraCityRateNaira: z.number().positive(),
  airportTransferRateNaira: z.number().positive(),
  interStateDailyRateNaira: z.number().positive(),
  passengerCapacity: z.number().int().min(1).max(60),
  luggageCapacity: z.number().int().min(1).max(60),
  imageUrl: z.string().trim().min(1),
  isAvailable: z.boolean().default(true),
});

