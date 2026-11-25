import { describe, expect, it } from 'vitest';
import {
  OFFICIAL_WHATSAPP_NUMBERS,
  WhatsAppTemplates,
} from '@/lib/whatsapp';

describe('Deterministic Divisional WhatsApp Deep-Link Builders (src/lib/whatsapp.ts)', () => {
  it('generates valid https://wa.me/2348064912969 URLs across all 7 templates', () => {
    const fibrexUrl = WhatsAppTemplates.mtnFibrexAvailability({
      ref: 'LNG-FX-001',
      name: 'Adaobi Okafor',
      phone: '+2348064912969',
      estate: 'Prince & Princess Estate, Kaura',
      address: 'House 14, Kaura District, Abuja',
      requestType: 'COVERAGE_CHECK',
    });

    expect(fibrexUrl.startsWith(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBERS.PRIMARY}?text=`)).toBe(true);
    const decodedFibrex = decodeURIComponent(fibrexUrl);
    expect(decodedFibrex).toContain('CHECK FIBREX AVAILABILITY IN MY AREA');
    expect(decodedFibrex).toContain('subject to MTN confirmation');

    const b2bUrl = WhatsAppTemplates.mtnB2bDistribution({
      ref: 'LNG-MTNB2B-001',
      company: 'Abuja Tech Hub Ltd',
      category: 'BULK_5G_ROUTERS',
      units: 25,
      location: 'Garki, Abuja',
    });
    expect(decodeURIComponent(b2bUrl)).toContain('25 units');

    const carHireUrl = WhatsAppTemplates.carHireBooking({
      ref: 'LNG-CAR-001',
      name: 'Ibrahim Musa',
      phone: '+2348064912969',
      serviceType: 'AIRPORT_TRANSFER',
      vehicle: 'Toyota Land Cruiser Prado VX',
      pickup: 'ABV International Airport',
      destination: 'Maitama, Abuja',
      date: '2026-12-01',
      time: '14:30',
      flightNumber: 'BA083',
    });
    expect(decodeURIComponent(carHireUrl)).toContain('BOOK A CAR ON WHATSAPP');
    expect(decodeURIComponent(carHireUrl)).toContain('BA083');

    const logisticsUrl = WhatsAppTemplates.logisticsShipment({
      waybill: 'LNG-WB-001',
      type: 'INTER_STATE_CARGO',
      pickup: 'Wuye, Abuja',
      delivery: 'Victoria Island, Lagos',
      weightKg: 45,
    });
    expect(decodeURIComponent(logisticsUrl)).toContain('LNG-WB-001');

    const stayUrl = WhatsAppTemplates.stayReservation({
      ref: 'LNG-STAY-001',
      property: '4-Bedroom Luxury Duplex — Prince & Princess Estate, Kaura',
      mode: 'SHORT_LET',
      checkIn: '2026-12-10',
      checkOut: '2026-12-14',
      guests: 4,
      totalFormatted: '₦790,000',
    });
    expect(decodeURIComponent(stayUrl)).toContain('Prince & Princess Estate');

    const propMgmtUrl = WhatsAppTemplates.propertyManagement({
      ref: 'LNG-PM-001',
      owner: 'Chief Danjuma',
      propertyType: 'DUPLEX',
      bedrooms: 4,
      district: 'Kaura',
    });
    expect(decodeURIComponent(propMgmtUrl)).toContain('Property Management');

    const fashionUrl = WhatsAppTemplates.fashionOrderEnquiry({
      orderNumber: 'LNG-ORD-001',
      fulfillment: 'WUYE_IN_STORE_PICKUP',
      totalFormatted: '₦145,000',
    });
    expect(decodeURIComponent(fashionUrl)).toContain('Wuye, Abuja');
  });
});
