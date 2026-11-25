import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  doublePrecision,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

// --- ENUMS ---
export const userRoleEnum = pgEnum('user_role', [
  'GUEST',
  'CUSTOMER',
  'ADMIN',
  'SUPER_ADMIN',
]);

export const retailDivisionEnum = pgEnum('retail_division', [
  'FASHION_BOUTIQUE',
  'MTN_SERVICES',
]);

export const productSubPillarEnum = pgEnum('product_sub_pillar', [
  'CLOTHING',
  'SHOES',
  'BAGS',
  'ACCESSORIES',
  'MTN_HARDWARE',
  'MTN_SERVICE_PLAN',
]);

export const fulfillmentTypeEnum = pgEnum('fulfillment_type', [
  'ABUJA_DOORSTEP_DELIVERY',
  'INTER_STATE_DELIVERY',
  'WUYE_IN_STORE_PICKUP',
  'POS_WALK_IN',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING_PAYMENT',
  'PAID',
  'PAID_REQUIRES_ADMIN_RESOLUTION',
  'AMOUNT_MISMATCH_HOLD',
  'PROCESSING',
  'READY_FOR_WUYE_PICKUP',
  'DISPATCHED',
  'DELIVERED',
  'PICKED_UP',
  'CANCELLED',
  'REFUNDED',
]);

export const returnStatusEnum = pgEnum('return_status', [
  'PENDING_INSPECTION',
  'APPROVE_AND_RESTOCK',
  'APPROVE_NO_RESTOCK',
  'REJECTED',
  'REFUNDED',
]);

export const stayBookingModeEnum = pgEnum('stay_booking_mode', [
  'SHORT_LET',
  'FURNISHED_ACCOMMODATION',
]);

export const stayBookingStatusEnum = pgEnum('stay_booking_status', [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'CHECKED_IN',
  'COMPLETED',
  'CANCELLED',
]);

export const carHireServiceTypeEnum = pgEnum('car_hire_service_type', [
  'INTRA_CITY_HIRE',
  'AIRPORT_TRANSFER',
  'INTER_STATE_CHARTER',
]);

export const logisticsShipmentTypeEnum = pgEnum('logistics_shipment_type', [
  'INTRA_ABUJA_DISPATCH',
  'INTER_STATE_CARGO',
  'COMMERCIAL_HAULAGE',
]);

export const fibrexRequestTypeEnum = pgEnum('fibrex_request_type', [
  'COVERAGE_CHECK',
  'NEW_INSTALLATION',
  'APPOINTMENT_BOOKING',
  'SUBSCRIPTION_RENEWAL',
]);

// --- 1. USERS & IDENTITY ---
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  fullName: text('full_name').notNull(),
  passwordHash: text('password_hash'),
  role: userRoleEnum('role').default('CUSTOMER').notNull(),
  emailVerifiedAt: timestamp('email_verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- 2. RETAIL CATALOG (FASHION BOUTIQUE + MTN TELECOM HARDWARE) ---
export const products = pgTable(
  'products',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    division: retailDivisionEnum('division').notNull(),
    subPillar: productSubPillarEnum('sub_pillar').notNull(),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    subtitle: text('subtitle'),
    description: text('description').notNull(),
    basePriceKobo: integer('base_price_kobo').notNull(),
    compareAtPriceKobo: integer('compare_at_price_kobo'),
    images: jsonb('images').$type<string[]>().default([]).notNull(),
    specifications: jsonb('specifications')
      .$type<Record<string, string>>()
      .default({})
      .notNull(),
    isWuyePickupEligible: boolean('is_wuye_pickup_eligible')
      .default(true)
      .notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('idx_products_division_subpillar').on(t.division, t.subPillar)]
);

export const productVariants = pgTable('product_variants', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id')
    .references(() => products.id, { onDelete: 'cascade' })
    .notNull(),
  sku: text('sku').notNull().unique(),
  title: text('title').notNull(),
  size: text('size'),
  shoeSizeEu: integer('shoe_size_eu'),
  colorName: text('color_name'),
  colorHex: text('color_hex'),
  materialFinish: text('material_finish'),
  priceKobo: integer('price_kobo').notNull(),
  compareAtPriceKobo: integer('compare_at_price_kobo'),
  weightGrams: integer('weight_grams').default(500).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const inventoryLevels = pgTable('inventory_levels', {
  id: uuid('id').defaultRandom().primaryKey(),
  variantId: uuid('variant_id')
    .references(() => productVariants.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  availableStock: integer('available_stock').default(0).notNull(),
  reservedStock: integer('reserved_stock').default(0).notNull(),
  wuyeFloorStock: integer('wuye_floor_stock').default(0).notNull(),
  lowStockThreshold: integer('low_stock_threshold').default(3).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- 3. CARTS, ORDERS & 24-HOUR RETURNS ---
export const carts = pgTable('carts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  guestTokenHash: text('guest_token_hash').unique(),
  fulfillmentType: fulfillmentTypeEnum('fulfillment_type')
    .default('ABUJA_DOORSTEP_DELIVERY')
    .notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cartId: uuid('cart_id')
      .references(() => carts.id, { onDelete: 'cascade' })
      .notNull(),
    variantId: uuid('variant_id')
      .references(() => productVariants.id, { onDelete: 'cascade' })
      .notNull(),
    quantity: integer('quantity').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('unq_cart_variant').on(t.cartId, t.variantId)]
);

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNumber: text('order_number').notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  customerEmail: text('customer_email').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerName: text('customer_name').notNull(),
  status: orderStatusEnum('status').default('PENDING_PAYMENT').notNull(),
  fulfillmentType: fulfillmentTypeEnum('fulfillment_type').notNull(),
  shippingAddress: jsonb('shipping_address').$type<{
    streetAddress?: string;
    districtOrCity?: string;
    state?: string;
    landmark?: string;
  }>(),
  subtotalKobo: integer('subtotal_kobo').notNull(),
  deliveryFeeKobo: integer('delivery_fee_kobo').default(0).notNull(),
  totalAmountKobo: integer('total_amount_kobo').notNull(),
  paymentProvider: text('payment_provider').default('PAYSTACK').notNull(),
  paymentReference: text('payment_reference').unique(),
  reservationExpiresAt: timestamp('reservation_expires_at', {
    withTimezone: true,
  }).notNull(),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  pickedUpAt: timestamp('picked_up_at', { withTimezone: true }),
  returnPolicyAcknowledged: boolean('return_policy_acknowledged')
    .default(true)
    .notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  variantId: uuid('variant_id')
    .references(() => productVariants.id, { onDelete: 'restrict' })
    .notNull(),
  skuSnapshot: text('sku_snapshot').notNull(),
  titleSnapshot: text('title_snapshot').notNull(),
  variantTitleSnapshot: text('variant_title_snapshot').notNull(),
  quantity: integer('quantity').notNull(),
  unitPriceKobo: integer('unit_price_kobo').notNull(),
  totalPriceKobo: integer('total_price_kobo').notNull(),
});

export const returnRequests = pgTable('return_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .references(() => orders.id, { onDelete: 'cascade' })
    .notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  reason: text('reason').notNull(),
  conditionNotes: text('condition_notes').notNull(),
  evidenceUrls: jsonb('evidence_urls').$type<string[]>().default([]).notNull(),
  status: returnStatusEnum('status').default('PENDING_INSPECTION').notNull(),
  receiptTimestamp: timestamp('receipt_timestamp', {
    withTimezone: true,
  }).notNull(),
  filedAt: timestamp('filed_at', { withTimezone: true }).defaultNow().notNull(),
  remainingHoursWhenFiled: doublePrecision(
    'remaining_hours_when_filed'
  ).notNull(),
  inspectedByAdminId: uuid('inspected_by_admin_id').references(() => users.id),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
});

// --- 4. LIFESTYLE BOUTIQUE (HOMES) (/stays) ---
export const stayProperties = pgTable('stay_properties', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  category: text('category').default('Short-Let Duplex').notNull(),
  district: text('district').notNull(),
  estateName: text('estate_name').notNull(),
  address: text('address').notNull(),
  bedrooms: integer('bedrooms').notNull(),
  bathrooms: integer('bathrooms').notNull(),
  maxGuests: integer('max_guests').notNull(),
  livingRoomSizeSqm: integer('living_room_size_sqm').default(22).notNull(),
  defaultEnsuiteSizeSqm: integer('default_ensuite_size_sqm').default(3).notNull(),
  nightlyRateKobo: integer('nightly_rate_kobo').notNull(),
  weeklyRateKobo: integer('weekly_rate_kobo').notNull(),
  monthlyRateKobo: integer('monthly_rate_kobo').notNull(),
  cautionDepositKobo: integer('caution_deposit_kobo').default(5000000).notNull(),
  aboutIntro: text('about_intro').default('').notNull(),
  ourPromise: text('our_promise').default('').notNull(),
  amenityGroups: jsonb('amenity_groups')
    .$type<{ id: string; title: string; items: string[] }[]>()
    .default([])
    .notNull(),
  rooms: jsonb('rooms')
    .$type<
      {
        id: string;
        name: string;
        roomSizeSqm: number;
        ensuiteSizeSqm: number;
        bedType: string;
        occupancy: number;
        nightlyRateKobo: number;
        imageUrl: string;
        description?: string;
      }[]
    >()
    .default([])
    .notNull(),
  amenities: jsonb('amenities').$type<string[]>().default([]).notNull(),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  isFlagship: boolean('is_flagship').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const stayBookings = pgTable('stay_bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingReference: text('booking_reference').notNull().unique(),
  propertyId: uuid('property_id')
    .references(() => stayProperties.id, { onDelete: 'restrict' })
    .notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  guestName: text('guest_name').notNull(),
  guestEmail: text('guest_email').notNull(),
  guestPhone: text('guest_phone').notNull(),
  bookingMode: stayBookingModeEnum('booking_mode').default('SHORT_LET').notNull(),
  checkInDate: timestamp('check_in_date', { withTimezone: true }).notNull(),
  checkOutDate: timestamp('check_out_date', { withTimezone: true }).notNull(),
  nightsCount: integer('nights_count').notNull(),
  guestsCount: integer('guests_count').notNull(),
  staySubtotalKobo: integer('stay_subtotal_kobo').notNull(),
  cautionDepositKobo: integer('caution_deposit_kobo').notNull(),
  totalAmountKobo: integer('total_amount_kobo').notNull(),
  status: stayBookingStatusEnum('status')
    .default('PENDING_CONFIRMATION')
    .notNull(),
  specialRequests: text('special_requests'),
  paymentReference: text('payment_reference'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const stayBlockedDates = pgTable('stay_blocked_dates', {
  id: uuid('id').defaultRandom().primaryKey(),
  propertyId: uuid('property_id')
    .references(() => stayProperties.id, { onDelete: 'cascade' })
    .notNull(),
  bookingId: uuid('booking_id').references(() => stayBookings.id, {
    onDelete: 'cascade',
  }),
  startDate: timestamp('start_date', { withTimezone: true }).notNull(),
  endDate: timestamp('end_date', { withTimezone: true }).notNull(),
  reason: text('reason').default('GUEST_RESERVATION').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const propertyManagementRequests = pgTable(
  'property_management_requests',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    referenceCode: text('reference_code').notNull().unique(),
    ownerName: text('owner_name').notNull(),
    ownerEmail: text('owner_email').notNull(),
    ownerPhone: text('owner_phone').notNull(),
    propertyType: text('property_type').notNull(),
    district: text('district').notNull(),
    estateName: text('estate_name'),
    bedrooms: integer('bedrooms').notNull(),
    unitsCount: integer('units_count').default(1).notNull(),
    furnishingStatus: text('furnishing_status').notNull(),
    targetManagementModel: text('target_management_model').notNull(),
    notes: text('notes'),
    status: text('status').default('NEW').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  }
);

// --- 5. LIFESTYLE LOGISTICS (/car-hire) ---
export const fleetVehicles = pgTable('fleet_vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  hourlyRateKobo: integer('hourly_rate_kobo').notNull(),
  dailyIntraCityRateKobo: integer('daily_intra_city_rate_kobo').notNull(),
  airportTransferRateKobo: integer('airport_transfer_rate_kobo').notNull(),
  interStateDailyRateKobo: integer('inter_state_daily_rate_kobo').notNull(),
  passengerCapacity: integer('passenger_capacity').notNull(),
  luggageCapacity: integer('luggage_capacity').notNull(),
  imageUrl: text('image_url').notNull(),
  isAvailable: boolean('is_available').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const carHireBookings = pgTable('car_hire_bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingReference: text('booking_reference').notNull().unique(),
  vehicleId: uuid('vehicle_id')
    .references(() => fleetVehicles.id, { onDelete: 'restrict' })
    .notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  serviceType: carHireServiceTypeEnum('service_type').notNull(),
  durationMode: text('duration_mode').notNull(),
  hoursOrDays: integer('hours_or_days').default(1).notNull(),
  pickupLocation: text('pickup_location').notNull(),
  destinationLocation: text('destination_location').notNull(),
  destinationState: text('destination_state').default('FCT - Abuja').notNull(),
  pickupTimestamp: timestamp('pickup_timestamp', { withTimezone: true }).notNull(),
  flightNumber: text('flight_number'),
  isUnderTwoHoursNotice: boolean('is_under_two_hours_notice')
    .default(false)
    .notNull(),
  estimatedTotalKobo: integer('estimated_total_kobo').notNull(),
  status: text('status').default('PENDING_DISPATCH').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const logisticsShipments = pgTable('logistics_shipments', {
  id: uuid('id').defaultRandom().primaryKey(),
  waybillNumber: text('waybill_number').notNull().unique(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  senderName: text('sender_name').notNull(),
  senderPhone: text('sender_phone').notNull(),
  recipientName: text('recipient_name').notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  shipmentType: logisticsShipmentTypeEnum('shipment_type').notNull(),
  pickupAddress: text('pickup_address').notNull(),
  deliveryAddress: text('delivery_address').notNull(),
  destinationState: text('destination_state').default('FCT - Abuja').notNull(),
  packageDescription: text('package_description').notNull(),
  estimatedWeightKg: doublePrecision('estimated_weight_kg').notNull(),
  declaredValueKobo: integer('declared_value_kobo'),
  estimatedFeeKobo: integer('estimated_fee_kobo').notNull(),
  status: text('status').default('BOOKED').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- 6. LIFESTYLE MTN SERVICES (/mtn-services/fibrex) ---
export const fibrexEnquiries = pgTable('fibrex_enquiries', {
  id: uuid('id').defaultRandom().primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  abujaDistrict: text('abuja_district').notNull(),
  estateName: text('estate_name').notNull(),
  streetAddress: text('street_address').notNull(),
  buildingType: text('building_type').notNull(),
  requestType: fibrexRequestTypeEnum('request_type').notNull(),
  preferredPlan: text('preferred_plan'),
  preferredAppointmentDate: text('preferred_appointment_date'),
  mtnDisclaimerAccepted: boolean('mtn_disclaimer_accepted')
    .default(true)
    .notNull(),
  status: text('status').default('NEW_LEAD').notNull(),
  adminNotes: text('admin_notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const mtnDistributionRequests = pgTable('mtn_distribution_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  referenceCode: text('reference_code').notNull().unique(),
  companyName: text('company_name').notNull(),
  contactPerson: text('contact_person').notNull(),
  contactPhone: text('contact_phone').notNull(),
  contactEmail: text('contact_email').notNull(),
  distributionCategory: text('distribution_category').notNull(),
  estimatedUnits: integer('estimated_units').notNull(),
  deliveryLocation: text('delivery_location').notNull(),
  notes: text('notes'),
  status: text('status').default('NEW_ENQUIRY').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// --- 7. WEBHOOK IDEMPOTENCY & ADMIN AUDIT LOGS ---
export const webhookEvents = pgTable('webhook_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  provider: text('provider').notNull(),
  providerEventId: text('provider_event_id').notNull().unique(),
  eventType: text('event_type').notNull(),
  reference: text('reference'),
  payload: jsonb('payload').notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminUserId: uuid('admin_user_id')
    .references(() => users.id, { onDelete: 'restrict' })
    .notNull(),
  actionType: text('action_type').notNull(),
  entityTable: text('entity_table').notNull(),
  entityId: text('entity_id').notNull(),
  previousState: jsonb('previous_state'),
  newState: jsonb('new_state'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
