export const OFFICIAL_WHATSAPP_NUMBERS = {
  PRIMARY: '2348064912969',
  SECONDARY_1: '2349134275487',
  SECONDARY_2: '2348125326496',
} as const;

export const OFFICIAL_DISPLAY_PHONES = {
  PRIMARY: '+234 806 491 2969',
  SECONDARY_1: '+234 913 427 5487',
  SECONDARY_2: '+234 812 532 6496',
} as const;

export function buildWhatsAppUrl(
  message: string,
  phone: string = OFFICIAL_WHATSAPP_NUMBERS.PRIMARY
): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
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
  mtnB2bDistribution: (p: {
    ref: string;
    company: string;
    category: string;
    units: number;
    location: string;
  }) =>
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
  logisticsShipment: (p: {
    waybill: string;
    type: string;
    pickup: string;
    delivery: string;
    weightKg: number;
  }) =>
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
  propertyManagement: (p: {
    ref: string;
    owner: string;
    propertyType: string;
    bedrooms: number;
    district: string;
  }) =>
    buildWhatsAppUrl(
      `Hello Lifestyle Homes Property Management,\n\nI have submitted a Property Management onboarding request:\n• Ref: ${p.ref}\n• Owner: ${p.owner}\n• Property: ${p.bedrooms}-Bedroom ${p.propertyType} in ${p.district}, Abuja`
    ),

  // 7. Lifestyle Boutique (Fashion) — Order / Wuye In-Store Pickup / 24h Return
  fashionOrderEnquiry: (p: {
    orderNumber: string;
    fulfillment: string;
    totalFormatted: string;
  }) =>
    buildWhatsAppUrl(
      `Hello Lifestyle Boutique (Wuye, Abuja),\n\nEnquiry regarding my order:\n• Order No: ${p.orderNumber}\n• Fulfillment: ${p.fulfillment}\n• Total: ${p.totalFormatted}`
    ),
};
