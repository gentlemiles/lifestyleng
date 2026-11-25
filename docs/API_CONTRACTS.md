# API Contracts, Zod Validation Schemas & Server Action Envelopes
**Project:** LifestyleNG.com — Unified Multi-Service Platform  
**Parent Organization:** Lifestyle Corporate Networks Ltd.  
**Priority Level:** CRITICAL (Single Source of Truth for `src/lib/validations/contracts.ts` & `src/server/actions/*`)

## 1. Deterministic `ActionResponse<T>` Envelope
Every Server Action in `src/server/actions/*` must validate inputs with `zod`, catch operational errors, and return a strictly typed discriminated union without leaking internal stack traces:

```typescript
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
```

---

## 2. Shared Zod Validation Schemas (`src/lib/validations/contracts.ts`)

### 2.1 Nigerian Phone & Currency Primitives
```typescript
import { z } from 'zod';

export const nigerianPhoneSchema = z
  .string()
  .trim()
  .regex(/^(\+?234|0)[789][01]\d{8}$/, 'Enter a valid Nigerian phone number (e.g. +2348064912969 or 08064912969)');

export const koboAmountSchema = z
  .number()
  .int('Monetary values must be integer kobo (100 kobo = ₦1.00)')
  .nonnegative();
```

### 2.2 Commerce, Cart, Checkout & 24-Hour Returns Schemas
```typescript
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

export const createCheckoutSessionSchema = z
  .object({
    customerName: z.string().min(2).max(120),
    customerEmail: z.string().email(),
    customerPhone: nigerianPhoneSchema,
    fulfillmentType: fulfillmentTypeSchema,
    shippingAddress: z
      .object({
        streetAddress: z.string().min(5),
        districtOrCity: z.string().min(2),
        state: z.string().min(2).default('FCT - Abuja'),
        landmark: z.string().optional(),
      })
      .optional(),
    paymentProvider: z.enum(['PAYSTACK', 'FLUTTERWAVE']).default('PAYSTACK'),
    returnPolicyAcknowledged: z.literal(true, {
      errorMap: () => ({
        message: 'You must acknowledge the 24-hour return policy from receipt.',
      }),
    }),
  })
  .refine(
    (data) =>
      data.fulfillmentType === 'WUYE_IN_STORE_PICKUP' || Boolean(data.shippingAddress),
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
```

### 2.3 Lifestyle Boutique (Homes) (`/stays`) Schemas
```typescript
export const createStayBookingSchema = z
  .object({
    propertyId: z.string().uuid(),
    guestName: z.string().min(2).max(120),
    guestEmail: z.string().email(),
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
```

### 2.4 Lifestyle Logistics (`/car-hire`) Schemas
```typescript
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
```

### 2.5 Lifestyle MTN Services (`/mtn-services/fibrex`) Schemas
```typescript
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
```

---

## 3. Canonical Server Actions & WhatsApp Deep-Link Return Signatures
Every customer-facing booking or enquiry action persists the record to PostgreSQL and returns a deterministic `whatsappRedirectUrl` pre-populated for `+2348064912969`:

| Server Action (`src/server/actions/*`) | Input Schema | Output `data` Payload | Cache Revalidation Tag |
| :--- | :--- | :--- | :--- |
| `upsertCartItemAction` | `upsertCartItemSchema` | `{ cartId, itemCount, subtotalKobo }` | `cart-{cartId}` |
| `initializeCheckoutAction` | `createCheckoutSessionSchema` | `{ orderNumber, authorizationUrl, reference, whatsappFallbackUrl }` | `inventory`, `orders` |
| `submitReturnRequestAction` | `createReturnRequestSchema` | `{ returnId, status, remainingHoursWhenFiled, whatsappConciergeUrl }` | `orders` |
| `submitStayBookingAction` | `createStayBookingSchema` | `{ bookingReference, totalAmountKobo, whatsappConfirmUrl }` | `stays-availability` |
| `submitPropertyMgmtAction` | `createPropertyManagementRequestSchema` | `{ referenceCode, whatsappPartnerUrl }` | `admin-property-mgmt` |
| `submitCarHireBookingAction` | `createCarHireBookingSchema` | `{ bookingReference, isUnderTwoHoursNotice, whatsappBookUrl }` | `admin-car-hire` |
| `submitLogisticsShipmentAction` | `createLogisticsShipmentSchema` | `{ waybillNumber, whatsappDispatchUrl }` | `admin-logistics` |
| `submitFibrexEnquiryAction` | `createFibrexEnquirySchema` | `{ referenceCode, whatsappAvailabilityUrl }` | `admin-fibrex` |
| `submitMtnDistributionAction` | `createMtnDistributionRequestSchema` | `{ referenceCode, whatsappB2bUrl }` | `admin-mtn-b2b` |

---

## 4. Rate Limiting & Cache Control Matrix
- **Public Mutation Rate Limits (Enforced by IP + Fingerprint in Middleware/Action Wrapper):**
  - `initializeCheckoutAction`: Max **10 requests / 5 minutes** per IP.
  - `submitFibrexEnquiryAction`, `submitCarHireBookingAction`, `submitStayBookingAction`, `submitLogisticsShipmentAction`: Max **5 requests / 10 minutes** per IP (prevents spam on forms as required by Section 8G of the project brief).
- **Webhook Route Handlers (`/api/webhooks/paystack` & `/api/webhooks/flutterwave`):**
  - `export const dynamic = 'force-dynamic'` — Zero caching, raw body stream verification (`await req.text()`).
