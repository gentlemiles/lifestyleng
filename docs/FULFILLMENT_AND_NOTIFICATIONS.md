# Omnichannel Fulfillment, 24-Hour Returns & WhatsApp/Email Workflows
**Project:** LifestyleNG.com  
**Official Contact Lines:** `+2348064912969` (Primary WhatsApp), `+2349134275487`, `+2348125326496`  
**Priority Level:** RECOMMENDED / CRITICAL FOR CONVERSION & RETENTION

## 1. Deterministic WhatsApp Concierge Engine (`src/lib/whatsapp.ts`)
Every major service page and transaction flow must provide pre-filled WhatsApp escalation identifying the exact division, reference code, and customer selections.

```typescript
// src/lib/whatsapp.ts
export const OFFICIAL_WHATSAPP_NUMBERS = {
  PRIMARY: '2348064912969',
  SECONDARY_1: '2349134275487',
  SECONDARY_2: '2348125326496',
} as const;

export function buildWhatsAppUrl(message: string, phone: string = OFFICIAL_WHATSAPP_NUMBERS.PRIMARY): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export const WhatsAppTemplates = {
  // 1. Lifestyle MTN Services — FibreX Coverage Check (Mandatory CTA)
  mtnFibrexAvailability: (p: {
    ref: string;
    name: string;
    phone: string;
    estate: string;
    address: string;
    requestType: string;
  }) =>
    buildWhatsAppUrl(
      `Hello LifestyleNG MTN Services Desk,\n\nI would like to *CHECK FIBREX AVAILABILITY IN MY AREA*.\n• Ref: ${p.ref}\n• Name: ${p.name}\n• Phone: ${p.phone}\n• Estate/District (Abuja): ${p.estate}\n• Address: ${p.address}\n• Service Requested: ${p.requestType}\n\n(I understand coverage and installation are subject to MTN confirmation.)`
    ),

  // 2. Lifestyle MTN Services — B2B Sales & Distribution
  mtnB2bDistribution: (p: { ref: string; company: string; category: string; units: number; location: string }) =>
    buildWhatsAppUrl(
      `Hello LifestyleNG MTN Distribution Desk,\n\nNew MTN Sales & Distribution Enquiry:\n• Ref: ${p.ref}\n• Organization: ${p.company}\n• Category: ${p.category}\n• Quantity: ${p.units} units\n• Location: ${p.location}`
    ),

  // 3. Lifestyle Logistics — Car Hire & Airport Transfers (Mandatory CTA)
  carHireBooking: (p: {
    ref: string;
    name: string;
    phone: string;
    serviceType: string;
    vehicle: string;
    pickup: string;
    destination: string;
    date: string;
    time: string;
    flightNumber?: string;
  }) =>
    buildWhatsAppUrl(
      `Hello Lifestyle Logistics Desk,\n\nI would like to *BOOK A CAR ON WHATSAPP*:\n• Booking Ref: ${p.ref}\n• Name: ${p.name}\n• Phone: ${p.phone}\n• Service Type: ${p.serviceType}\n• Vehicle: ${p.vehicle}\n• Pickup: ${p.pickup}\n• Destination: ${p.destination}\n• Date & Time: ${p.date} at ${p.time}${p.flightNumber ? `\n• Flight No: ${p.flightNumber}` : ''}`
    ),

  // 4. Lifestyle Logistics — Cargo, Haulage & Dispatch
  logisticsShipment: (p: { waybill: string; type: string; pickup: string; delivery: string; weightKg: number }) =>
    buildWhatsAppUrl(
      `Hello Lifestyle Logistics Dispatch,\n\nNew Logistics/Haulage Booking:\n• Waybill: ${p.waybill}\n• Type: ${p.type}\n• Pickup: ${p.pickup}\n• Delivery: ${p.delivery}\n• Est. Weight: ${p.weightKg}kg`
    ),

  // 5. Lifestyle Boutique (Homes) — Shortlet & Furnished Stays
  stayReservation: (p: {
    ref: string;
    property: string;
    mode: string;
    checkIn: string;
    checkOut: string;
    guests: number;
    totalFormatted: string;
  }) =>
    buildWhatsAppUrl(
      `Hello Lifestyle Homes Concierge,\n\nI would like to confirm my reservation request:\n• Ref: ${p.ref}\n• Property: ${p.property}\n• Stay Type: ${p.mode}\n• Check-In: ${p.checkIn}\n• Check-Out: ${p.checkOut}\n• Guests: ${p.guests}\n• Total: ${p.totalFormatted}`
    ),

  // 6. Lifestyle Boutique (Homes) — Property & Apartment Management
  propertyManagement: (p: { ref: string; owner: string; propertyType: string; bedrooms: number; district: string }) =>
    buildWhatsAppUrl(
      `Hello Lifestyle Homes Property Management,\n\nI have submitted a Property Management onboarding request:\n• Ref: ${p.ref}\n• Owner: ${p.owner}\n• Property: ${p.bedrooms}-Bedroom ${p.propertyType} in ${p.district}, Abuja`
    ),

  // 7. Lifestyle Boutique (Fashion) — Order / Wuye In-Store Pickup / 24h Return
  fashionOrderEnquiry: (p: { orderNumber: string; fulfillment: string; totalFormatted: string }) =>
    buildWhatsAppUrl(
      `Hello Lifestyle Boutique (Wuye, Abuja),\n\nEnquiry regarding my order:\n• Order No: ${p.orderNumber}\n• Fulfillment: ${p.fulfillment}\n• Total: ${p.totalFormatted}`
    ),
};
```

---

## 2. Strict 24-Hour Return Policy Enforcement & Restock Workflow
Per corporate policy, returns are strictly eligible within **24 hours of receipt**:
1. **Receipt Timestamp Capture:**
   - When an Abuja dispatch rider or inter-state courier hands over an order, Admin marks the order `DELIVERED`, which sets `orders.delivered_at = NOW()`.
   - When a Click-and-Collect customer picks up their order at **Suite 83 / Block B70, H&A Plaza, Wuye, Abuja**, Admin marks the order `PICKED_UP`, which sets `orders.picked_up_at = NOW()`.
2. **Deterministic 24-Hour Guard (`submitReturnRequestAction`):**
```typescript
const receiptTime = order.deliveredAt ?? order.pickedUpAt;
if (!receiptTime) {
  return { data: null, error: { code: 'ERR_VALIDATION_FAILED', message: 'Order has not been marked received yet.' } };
}
const elapsedMs = Date.now() - receiptTime.getTime();
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

if (elapsedMs > TWENTY_FOUR_HOURS_MS) {
  return {
    data: null,
    error: {
      code: 'ERR_RETURN_WINDOW_EXPIRED',
      message: 'Return window closed. Returns must be initiated within 24 hours of receipt.',
    },
  };
}
```
3. **Physical Inspection & Inventory Restock:**
   - Once the item is returned to **Suite 83 / Block B70, H&A Plaza, Wuye** and inspected, the Admin selects `APPROVE_AND_RESTOCK` (increments `inventory_levels.available_stock` and marks `REFUNDED`) or `APPROVE_NO_RESTOCK` (if damaged/defective).

---

## 3. Decoupled Transactional Notifications (`Resend`)
Webhook handlers must never block on slow SMTP calls. Dispatch emails asynchronously (using Next.js 15 `after()` API) and record sent message IDs to prevent duplicate emails:
- **Customer Emails:** Order Receipt (with Wuye Pickup directions or Delivery tracking + 24-hour return policy reminder), Shortlet/Furnished Stay Reservation Receipt, Car Hire/Logistics Booking Confirmation.
- **Admin Operations Alerts:** Instant notification to the Lifestyle Corporate Networks Ltd. operations desk whenever a new order, Kaura Shortlet booking, Property Management proposal, Car Hire/Airport Transfer, Logistics shipment, or MTN FibreX/Distribution lead is created.
