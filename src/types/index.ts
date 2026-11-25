export type CorporateDivisionId =
  | 'HOMES'
  | 'FASHION'
  | 'LOGISTICS'
  | 'MTN_SERVICES';

export type RetailDivision = 'FASHION_BOUTIQUE' | 'MTN_SERVICES';

export type ProductSubPillar =
  | 'CLOTHING'
  | 'SHOES'
  | 'BAGS'
  | 'ACCESSORIES'
  | 'MTN_HARDWARE'
  | 'MTN_SERVICE_PLAN';

export type FulfillmentType =
  | 'ABUJA_DOORSTEP_DELIVERY'
  | 'INTER_STATE_DELIVERY'
  | 'WUYE_IN_STORE_PICKUP'
  | 'POS_WALK_IN';

export type UserRole = 'GUEST' | 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';

export type StayBookingMode = 'SHORT_LET' | 'FURNISHED_ACCOMMODATION';

export type CarHireServiceType =
  | 'INTRA_CITY_HIRE'
  | 'AIRPORT_TRANSFER'
  | 'INTER_STATE_CHARTER';

export type LogisticsShipmentType =
  | 'INTRA_ABUJA_DISPATCH'
  | 'INTER_STATE_CARGO'
  | 'COMMERCIAL_HAULAGE';

export type FibrexRequestType =
  | 'COVERAGE_CHECK'
  | 'NEW_INSTALLATION'
  | 'APPOINTMENT_BOOKING'
  | 'SUBSCRIPTION_RENEWAL';

export interface ProductVariantView {
  id: string;
  productId: string;
  sku: string;
  title: string;
  size?: string | null;
  shoeSizeEu?: number | null;
  colorName?: string | null;
  colorHex?: string | null;
  materialFinish?: string | null;
  priceKobo: number;
  compareAtPriceKobo?: number | null;
  availableStock: number;
  wuyeFloorStock: number;
}

export interface ProductCatalogItem {
  id: string;
  division: RetailDivision;
  subPillar: ProductSubPillar;
  slug: string;
  title: string;
  subtitle?: string | null;
  description: string;
  basePriceKobo: number;
  compareAtPriceKobo?: number | null;
  images: string[];
  specifications: Record<string, string>;
  isWuyePickupEligible: boolean;
  variants: ProductVariantView[];
}

export interface StayRoomUnitView {
  id: string;
  name: string;
  roomSizeSqm: number;
  ensuiteSizeSqm: number;
  bedType: string;
  occupancy: number;
  nightlyRateKobo: number;
  imageUrl: string;
  description?: string;
}

export interface StayAmenityGroup {
  id: string;
  title: string;
  items: string[];
}

export interface StayCategoryItem {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface StayPropertyView {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  district: string;
  estateName: string;
  address: string;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  livingRoomSizeSqm: number;
  defaultEnsuiteSizeSqm: number;
  nightlyRateKobo: number;
  weeklyRateKobo: number;
  monthlyRateKobo: number;
  cautionDepositKobo: number;
  aboutIntro: string;
  ourPromise: string;
  amenityGroups: StayAmenityGroup[];
  rooms: StayRoomUnitView[];
  amenities: string[];
  images: string[];
  isFlagship: boolean;
  blockedDates: { startDate: string; endDate: string; reason: string }[];
}

export interface FleetVehicleView {
  id: string;
  slug: string;
  name: string;
  category: 'EXECUTIVE_SEDAN' | 'LUXURY_SUV' | 'EXECUTIVE_BUS' | 'HAULAGE_VAN';
  hourlyRateKobo: number;
  dailyIntraCityRateKobo: number;
  airportTransferRateKobo: number;
  interStateDailyRateKobo: number;
  passengerCapacity: number;
  luggageCapacity: number;
  imageUrl: string;
  isAvailable: boolean;
}

export interface CartItemView {
  variantId: string;
  productId: string;
  slug: string;
  title: string;
  variantTitle: string;
  sku: string;
  division: RetailDivision;
  unitPriceKobo: number;
  quantity: number;
  availableStock: number;
  imageUrl: string;
}

export interface CmsCategoryItem {
  id: string;
  label: string;
  division: RetailDivision;
  description: string;
  isActive: boolean;
}

export interface CmsHeroTile {
  id: string;
  label: string;
  subtitle?: string;
  imageUrl: string;
  href: string;
}

export interface CmsPageElementSection {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string;
  ctaHref?: string;
}

export interface CmsPageConfig {
  path:
    | '/'
    | '/shop/clothes'
    | '/mtn-services/fibrex'
    | '/stays'
    | '/car-hire'
    | '/about'
    | '/contact'
    | '/faqs';
  pageName: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroDescription: string;
  primaryCtaText: string;
  primaryCtaHref: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  announcementText?: string;
  heroTiles: CmsHeroTile[];
  customSections: CmsPageElementSection[];
  updatedAt: string;
}
