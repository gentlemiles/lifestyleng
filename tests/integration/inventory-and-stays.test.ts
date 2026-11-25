import { describe, expect, it } from 'vitest';
import {
  submitCarHireBookingAction,
  submitFibrexEnquiryAction,
  submitStayBookingAction,
} from '@/server/actions';
import {
  deleteProductCmsAction,
  deleteStayCategoryCmsAction,
  deleteStayPropertyCmsAction,
  quickUpdateProductStockCmsAction,
  upsertProductCmsAction,
  upsertStayCategoryCmsAction,
  upsertStayPropertyCmsAction,
} from '@/server/actions/cms';
import {
  getFashionCatalog,
  getProductBySlug,
  getStayPropertyBySlug,
} from '@/server/queries/catalog';

describe('Server Action Concurrency & Domain Validation Suite', () => {
  it('rejects overlapping dates on the Prince & Princess Estate 4-Bedroom Duplex in Kaura with ERR_STAY_DATES_UNAVAILABLE', async () => {
    const overlappingRes = await submitStayBookingAction({
      propertyId: '31111111-1111-4111-8111-111111111101',
      guestName: 'Bola Adeyemi',
      guestEmail: 'bola@example.com',
      guestPhone: '+2348064912969',
      bookingMode: 'SHORT_LET',
      checkInDate: '2026-12-25',
      checkOutDate: '2026-12-27',
      guestsCount: 4,
    });

    expect(overlappingRes.data).toBeNull();
    expect(overlappingRes.error?.code).toBe('ERR_STAY_DATES_UNAVAILABLE');
  });

  it('requires flightNumber for ABV Airport Transfers', async () => {
    const missingFlightRes = await submitCarHireBookingAction({
      vehicleId: '41111111-1111-4111-8111-111111111101',
      customerName: 'Tunde Bakare',
      customerPhone: '+2348064912969',
      serviceType: 'AIRPORT_TRANSFER',
      durationMode: 'FIXED_TRANSFER',
      hoursOrDays: 1,
      pickupLocation: 'ABV International Airport',
      destinationLocation: 'Wuse II, Abuja',
      destinationState: 'FCT - Abuja',
      pickupTimestamp: new Date(Date.now() + 5 * 3600 * 1000).toISOString(),
    });

    expect(missingFlightRes.data).toBeNull();
    expect(missingFlightRes.error?.code).toBe('ERR_VALIDATION_FAILED');
  });

  it('persists MTN FibreX availability check and returns WhatsApp verification link', async () => {
    const fibrexRes = await submitFibrexEnquiryAction({
      customerName: 'Chinedu Eze',
      customerPhone: '+2348064912969',
      abujaDistrict: 'Kaura District',
      estateName: 'Prince & Princess Estate',
      streetAddress: 'Plot 8, Kaura, Abuja',
      buildingType: 'ESTATE_COMPOUND',
      requestType: 'COVERAGE_CHECK',
      mtnDisclaimerAccepted: true,
    });

    expect(fibrexRes.error).toBeNull();
    expect(fibrexRes.data?.referenceCode).toContain('LNG-FX-');
    expect(fibrexRes.data?.whatsappAvailabilityUrl).toContain('2348064912969');
  });

  it('executes full CMS CRUD lifecycle: create product -> read in storefront catalog -> update price & stock -> delete product', async () => {
    // 1. CREATE
    const createRes = await upsertProductCmsAction({
      title: 'Wuye Test Cashmere Tunic',
      subtitle: 'Suite 83, H&A Plaza, Wuye',
      division: 'FASHION_BOUTIQUE',
      subPillar: 'CLOTHING',
      priceNaira: 95000,
      compareAtPriceNaira: 110000,
      availableStock: 12,
      wuyeFloorStock: 8,
      sku: 'LNG-TEST-999',
      variantTitle: 'L • Midnight Navy',
      size: 'L',
      colorName: 'Midnight Navy',
      colorHex: '#001026',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
      description: 'Tailored cashmere tunic tested through the CMS CRUD suite.',
      isWuyePickupEligible: true,
    });

    expect(createRes.error).toBeNull();
    expect(createRes.data).not.toBeNull();
    const createdProduct = createRes.data!;
    expect(createdProduct.basePriceKobo).toBe(9500000);

    // 2. READ from shared storefront catalog query
    const bySlug = await getProductBySlug(createdProduct.slug);
    expect(bySlug).not.toBeNull();
    expect(bySlug?.title).toBe('Wuye Test Cashmere Tunic');

    // 3. UPDATE price and stock
    const updateRes = await upsertProductCmsAction({
      id: createdProduct.id,
      title: 'Wuye Test Cashmere Tunic (Updated)',
      subtitle: 'Suite 83, H&A Plaza, Wuye',
      division: 'FASHION_BOUTIQUE',
      subPillar: 'CLOTHING',
      priceNaira: 88000,
      compareAtPriceNaira: 110000,
      availableStock: 5,
      wuyeFloorStock: 5,
      sku: 'LNG-TEST-999',
      variantTitle: 'L • Midnight Navy',
      size: 'L',
      colorName: 'Midnight Navy',
      colorHex: '#001026',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf',
      description: 'Updated description and price.',
      isWuyePickupEligible: true,
    });

    expect(updateRes.error).toBeNull();
    expect(updateRes.data?.basePriceKobo).toBe(8800000);

    // Quick stock update to 0 (Out of Stock)
    const quickStockRes = await quickUpdateProductStockCmsAction({
      productId: createdProduct.id,
      availableStock: 0,
      wuyeFloorStock: 0,
    });
    expect(quickStockRes.error).toBeNull();
    expect(quickStockRes.data?.variants[0]?.availableStock).toBe(0);

    // 4. DELETE
    const deleteRes = await deleteProductCmsAction({ id: createdProduct.id });
    expect(deleteRes.error).toBeNull();
    expect(deleteRes.data?.deletedId).toBe(createdProduct.id);

    const catalogAfterDelete = await getFashionCatalog();
    expect(
      catalogAfterDelete.some((p) => p.id === createdProduct.id)
    ).toBe(false);
  });

  it('verifies Prince & Princess Estate exact address, 22 sqm living room, 3 sqm ensuites, 4 individual rooms, and structured amenity groups', async () => {
    const kaura = await getStayPropertyBySlug('kaura-4-bedroom-luxury-duplex');
    expect(kaura).not.toBeNull();
    expect(kaura?.address).toBe(
      'House 43, 1st Crescent, Off Drive 2, Prince & Princess Estate, First gate, opposite Kaura Market, Kaura District'
    );
    expect(kaura?.livingRoomSizeSqm).toBe(22);
    expect(kaura?.defaultEnsuiteSizeSqm).toBe(3);
    expect(kaura?.rooms).toHaveLength(4);
    expect(kaura?.rooms.map((r) => ({
      name: r.name,
      roomSizeSqm: r.roomSizeSqm,
      ensuiteSizeSqm: r.ensuiteSizeSqm,
      bedType: r.bedType,
      occupancy: r.occupancy,
      nightlyRateKobo: r.nightlyRateKobo,
    }))).toEqual([
      {
        name: 'Deluxe Room 1',
        roomSizeSqm: 15,
        ensuiteSizeSqm: 3,
        bedType: '1 Queen-size bed',
        occupancy: 2,
        nightlyRateKobo: 5800000,
      },
      {
        name: 'Deluxe Room 2',
        roomSizeSqm: 14,
        ensuiteSizeSqm: 3,
        bedType: '1 Queen-size bed',
        occupancy: 2,
        nightlyRateKobo: 5500000,
      },
      {
        name: 'Double Room 1',
        roomSizeSqm: 14,
        ensuiteSizeSqm: 3,
        bedType: '2 Single beds',
        occupancy: 2,
        nightlyRateKobo: 5500000,
      },
      {
        name: 'Double Room 2',
        roomSizeSqm: 12,
        ensuiteSizeSqm: 3,
        bedType: '2 Single beds',
        occupancy: 2,
        nightlyRateKobo: 5000000,
      },
    ]);
    expect(kaura?.amenityGroups.map((g) => g.title)).toEqual([
      'Comfort & Living',
      'Recreation & Entertainment',
      'Dining & Kitchen Facilities',
      'Connectivity & Entertainment',
      'Power Supply',
      'Security',
      'Housekeeping Services',
    ]);
    expect(kaura?.ourPromise).toContain('home away from home');
  });

  it('executes full Apartment Categories CRUD with duplicate prevention, instant rename propagation, and safe deletion reassignment', async () => {
    // 1. Create Category
    const createCatRes = await upsertStayCategoryCmsAction({
      name: 'Corporate Serviced Loft',
      description: 'Test category for apartment CRUD',
      isActive: true,
    });
    expect(createCatRes.error).toBeNull();
    const createdCategory = createCatRes.data!.category;

    // 2. Duplicate prevention check
    const dupRes = await upsertStayCategoryCmsAction({
      name: 'corporate serviced loft',
      description: 'Duplicate check',
      isActive: true,
    });
    expect(dupRes.data).toBeNull();
    expect(dupRes.error?.code).toBe('ERR_DUPLICATE_CATEGORY');

    // 3. Create a test apartment assigned to this category
    const createAptRes = await upsertStayPropertyCmsAction({
      title: 'Test Loft in Asokoro',
      subtitle: '2 Rooms En-Suite',
      category: 'Corporate Serviced Loft',
      district: 'Asokoro District',
      estateName: 'Asokoro Court',
      address: 'House 10, Asokoro District, Abuja',
      bedrooms: 2,
      bathrooms: 2,
      maxGuests: 4,
      livingRoomSizeSqm: 20,
      defaultEnsuiteSizeSqm: 3,
      nightlyRateNaira: 90000,
      weeklyRateNaira: 550000,
      monthlyRateNaira: 2000000,
      cautionDepositNaira: 40000,
      aboutIntro: 'Test intro',
      ourPromise: 'Test promise',
      amenityGroups: [
        {
          id: 'test-ag',
          title: 'Comfort & Living',
          items: ['20 sqm living room'],
        },
      ],
      rooms: [
        {
          id: 'test-rm-1',
          name: 'Deluxe Room 1',
          roomSizeSqm: 15,
          ensuiteSizeSqm: 3,
          bedType: '1 Queen-size bed',
          occupancy: 2,
          nightlyRateNaira: 50000,
          imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
        },
      ],
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c',
      amenitiesText: '2 En-Suite Rooms',
    });
    expect(createAptRes.error).toBeNull();
    const createdApt = createAptRes.data!;

    // 4. Rename category -> verify instant propagation to assigned apartment
    const renameCatRes = await upsertStayCategoryCmsAction({
      id: createdCategory.id,
      name: 'Executive Serviced Loft',
      description: 'Renamed test category',
      isActive: true,
    });
    expect(renameCatRes.error).toBeNull();
    expect(renameCatRes.data?.propagatedApartmentsCount).toBe(1);

    const aptAfterRename = await getStayPropertyBySlug(createdApt.slug);
    expect(aptAfterRename?.category).toBe('Executive Serviced Loft');

    // 5. Delete category -> verify safe reassignment of the assigned apartment
    const delCatRes = await deleteStayCategoryCmsAction({
      id: createdCategory.id,
      reassignToCategoryName: 'Short-Let Duplex',
    });
    expect(delCatRes.error).toBeNull();
    expect(delCatRes.data?.reassignedApartmentsCount).toBe(1);

    const aptAfterDeleteCat = await getStayPropertyBySlug(createdApt.slug);
    expect(aptAfterDeleteCat?.category).toBe('Short-Let Duplex');

    // Cleanup test apartment
    await deleteStayPropertyCmsAction({ id: createdApt.id });
  });
});
