import fs from 'node:fs';
import path from 'node:path';
import { sql } from '@/lib/db';
import {
  SEED_FLEET_VEHICLES,
  SEED_PRODUCTS_ALL,
  SEED_STAY_PROPERTIES,
} from '@/lib/db/seed-data';
import type {
  CmsCategoryItem,
  CmsPageConfig,
  FleetVehicleView,
  ProductCatalogItem,
  StayCategoryItem,
  StayPropertyView,
} from '@/types';

const CURRENT_SEED_VERSION = 2;

export interface CmsDatabaseState {
  seedVersion?: number;
  products: ProductCatalogItem[];
  categories: CmsCategoryItem[];
  stayCategories: StayCategoryItem[];
  stayProperties: StayPropertyView[];
  fleetVehicles: FleetVehicleView[];
  pages: CmsPageConfig[];
}

export const DEFAULT_STAY_CATEGORIES: StayCategoryItem[] = [
  {
    id: 'stay-cat-duplex',
    name: 'Short-Let Duplex',
    description:
      '4-bedroom and multi-room residential duplexes available per room or whole apartment.',
    isActive: true,
  },
  {
    id: 'stay-cat-suite',
    name: 'Executive Suite',
    description:
      '1-to-2 bedroom furnished corporate suites for short and monthly stays.',
    isActive: true,
  },
  {
    id: 'stay-cat-penthouse',
    name: 'Diplomatic Penthouse',
    description:
      '3-bedroom diplomatic and executive penthouses in central Abuja districts.',
    isActive: true,
  },
  {
    id: 'stay-cat-villa',
    name: 'Luxury Villa',
    description:
      'Large multi-bedroom private compounds for families and visiting delegations.',
    isActive: true,
  },
];

const DEFAULT_CATEGORIES: CmsCategoryItem[] = [
  {
    id: 'CLOTHING',
    label: 'Clothing & Ready-to-Wear',
    division: 'FASHION_BOUTIQUE',
    description:
      'Safari jackets, merino knitwear, Italian cotton trousers, and silk shirts at Suite 83, H&A Plaza, Wuye.',
    isActive: true,
  },
  {
    id: 'SHOES',
    label: 'Shoes & Footwear',
    division: 'FASHION_BOUTIQUE',
    description:
      'Hand-burnished Venetian calfskin loafers and Italian dress footwear (EU 39–45).',
    isActive: true,
  },
  {
    id: 'BAGS',
    label: 'Bags & Leather Goods',
    division: 'FASHION_BOUTIQUE',
    description:
      'Full-grain pebble leather totes, weekenders, and executive laptop briefcases.',
    isActive: true,
  },
  {
    id: 'ACCESSORIES',
    label: 'Accessories',
    division: 'FASHION_BOUTIQUE',
    description:
      'Polarized titanium & acetate eyewear, belts, and executive accessories.',
    isActive: true,
  },
  {
    id: 'MTN_HARDWARE',
    label: 'MTN 5G/4G Routers & MiFis',
    division: 'MTN_SERVICES',
    description:
      'Official MTN 5G Wi-Fi 6 broadband routers, 4G pocket MiFis, and high-gain outdoor CPE units.',
    isActive: true,
  },
  {
    id: 'MTN_SERVICE_PLAN',
    label: 'MTN FibreX Service Plans',
    division: 'MTN_SERVICES',
    description:
      'Uncapped MTN FibreX home and corporate fiber broadband plans in Abuja.',
    isActive: true,
  },
];

const DEFAULT_PAGES: CmsPageConfig[] = [
  {
    path: '/',
    pageName: 'Homepage (/)',
    heroEyebrow: 'Wear It • Connect It • Stay in It • Move with It',
    heroHeadline: 'Fashion, Fiber, Stays & Cars in Abuja.',
    heroDescription:
      'Shop menswear and leather goods at our Wuye store, check MTN FibreX home internet, book our 4-bedroom Kaura duplex, or hire a chauffeur-driven car.',
    primaryCtaText: 'Shop New Arrivals',
    primaryCtaHref: '/shop/clothes',
    secondaryCtaText: 'Explore Services',
    secondaryCtaHref: '#services',
    announcementText:
      'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja • 24-Hour Return Policy from Receipt',
    heroTiles: [
      {
        id: 'tile-wuye',
        label: 'Wuye Boutique',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuAl7IfgBa4_j7Svf1aBlGZZYudSQ6ex1UhlSfAa0pHzaJQ_9wxGPfhiFQBVQH5DnXDRNl-nzqFObFITardgt7h1B0irH7fZBIAB_UHxztlCf_GUy36IPSwsP3By5dX3FCd1qJ0-GzYgqDoX9zYfCnswuBfyhWbikpC8d16W-4EJEqKoaFmwmUKMdmD_mGBFeLDX4PA56UHjXJ_s7-KrD5Dai5o1E8D-WKBLa-XfHLQ',
        href: '/shop/clothes',
      },
      {
        id: 'tile-mtn',
        label: 'MTN Services',
        subtitle: 'Up to 250 Mbps • FibreX & 5G Routers',
        imageUrl:
          'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1000&q=85',
        href: '/mtn-services/fibrex',
      },
      {
        id: 'tile-carhire',
        label: 'Car Hire & Airport Pickup',
        imageUrl:
          'https://lh3.googleusercontent.com/aida-public/AB6AXuBmKgbZlpIx1HeNKCcL6fhBhJWCcmX1zwBT51WesX6fW5tausNeOqvB-n6h6SV-wQloPOhJGkIC5kGvhl6Z-g_1Zb9wxvZQ7W2o1wANttJIbTHY3wa_SpRo6WmP8qybamg0WkeucjcPYYNSsH9cOhh_QS5z3kVGL77iWn5m8Tz1HYuMfNcn3QkVzbqBOYuavnRKraDn9XKNYmdqaElY96Y_jb9ZZ4G38GlvPgnPt_s',
        href: '/car-hire',
      },
      {
        id: 'tile-kaura',
        label: 'Kaura 4-Bedroom Duplex',
        imageUrl: '/images/stays/prince-and-princess/living-room-hero.jpg',
        href: '/stays',
      },
    ],
    customSections: [],
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/shop/clothes',
    pageName: 'Wuye Fashion Boutique (/shop/clothes)',
    heroEyebrow:
      'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja • Open Mon–Sat 9am–7pm',
    heroHeadline: 'Wuye Store Collection',
    heroDescription:
      'Order online for same-day Abuja delivery or pick up free in store. Returns and exchanges are accepted within 24 hours of receipt.',
    primaryCtaText: 'Shop All Items',
    primaryCtaHref: '/shop/clothes',
    announcementText:
      'Free Click-and-Collect pickup at Suite 83, H&A Plaza, Wuye (₦0)',
    heroTiles: [],
    customSections: [],
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/mtn-services/fibrex',
    pageName: 'MTN Services Hub (/mtn-services/fibrex)',
    heroEyebrow: 'Lifestyle MTN Services • Abuja',
    heroHeadline: 'MTN FibreX Home Internet & 5G Hardware',
    heroDescription:
      'Check if MTN FibreX is available in your Abuja estate, book home installation, or order 5G broadband routers and pocket MiFis for delivery or Wuye store pickup.',
    primaryCtaText: 'CHECK FIBREX AVAILABILITY IN MY AREA',
    primaryCtaHref: '#fibrex-checker-card',
    announcementText:
      'Coverage, installation, speed and service availability are subject to MTN confirmation.',
    heroTiles: [],
    customSections: [],
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/stays',
    pageName: 'Shortlet & Apartments (/stays)',
    heroEyebrow:
      'House 43, 1st Crescent, Off Drive 2, Prince & Princess Estate, First gate, opposite Kaura Market, Kaura District',
    heroHeadline: '4-Bedroom Shortlet Duplex',
    heroDescription:
      '4 rooms all en-suite (2 double beds, 4 single beds • max 8 persons • no pets allowed). Can be rented per room or as the whole apartment.',
    primaryCtaText: 'List Your Property for Management',
    primaryCtaHref: '#property-management',
    announcementText:
      '4 rooms all en-suite • 2 double beds • 4 single beds • Max 8 persons • No pets allowed • Rent per room or whole apartment',
    heroTiles: [],
    customSections: [],
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/car-hire',
    pageName: 'Car Hire & Logistics (/car-hire)',
    heroEyebrow: 'Lifestyle Logistics • Abuja & Nationwide',
    heroHeadline: 'Chauffeur Car Hire & Airport Transfers',
    heroDescription:
      'Hire a driver-operated sedan, Prado SUV, or passenger van in Abuja. We recommend booking at least 2 hours in advance for city rides, Nnamdi Azikiwe Airport (ABV) pickups, and inter-state trips across all 36 states.',
    primaryCtaText: 'BOOK A CAR ON WHATSAPP',
    primaryCtaHref: '#car-hire-console',
    announcementText:
      'Minimum 2 hours advance notice recommended for guaranteed vehicle staging.',
    heroTiles: [],
    customSections: [],
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/about',
    pageName: 'About Us (/about)',
    heroEyebrow: 'Lifestyle Corporate Networks Ltd. • RC-1849204',
    heroHeadline: 'Four Practical Services Under One Abuja Company.',
    heroDescription:
      'Headquartered at Plot 12, Corporate Avenue, Garki, Abuja, Lifestyle Corporate Networks Ltd. runs four divisions built for residents, business travelers, and companies in the FCT.',
    primaryCtaText: 'View Locations & Phones',
    primaryCtaHref: '/contact',
    heroTiles: [],
    customSections: [],
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/contact',
    pageName: 'Contact & Locations (/contact)',
    heroEyebrow: 'Abuja Locations & Phone Lines',
    heroHeadline: 'Visit or Call Us',
    heroDescription:
      'Stop by our Wuye store, visit our Garki office, or call and message us on WhatsApp.',
    primaryCtaText: 'Chat on WhatsApp',
    primaryCtaHref: 'https://wa.me/2348064912969',
    heroTiles: [],
    customSections: [],
    updatedAt: new Date().toISOString(),
  },
  {
    path: '/faqs',
    pageName: 'FAQs (/faqs)',
    heroEyebrow: 'Abuja Store & Service Support',
    heroHeadline: 'Frequently Asked Questions',
    heroDescription:
      'Answers about our Wuye store, 24-hour return policy, MTN Services, Kaura 4-bedroom duplex, and car hire.',
    primaryCtaText: 'Chat on WhatsApp',
    primaryCtaHref: 'https://wa.me/2348064912969',
    heroTiles: [],
    customSections: [],
    updatedAt: new Date().toISOString(),
  },
];

const STORE_FILE_PATH = path.join(process.cwd(), '.data', 'cms-store.json');

function createInitialState(): CmsDatabaseState {
  return {
    seedVersion: CURRENT_SEED_VERSION,
    products: structuredClone(SEED_PRODUCTS_ALL),
    categories: structuredClone(DEFAULT_CATEGORIES),
    stayCategories: structuredClone(DEFAULT_STAY_CATEGORIES),
    stayProperties: structuredClone(SEED_STAY_PROPERTIES),
    fleetVehicles: structuredClone(SEED_FLEET_VEHICLES),
    pages: structuredClone(DEFAULT_PAGES),
  };
}

function normalizeStayProperty(
  persisted: Partial<StayPropertyView> & { id: string }
): StayPropertyView {
  const seedMatch =
    SEED_STAY_PROPERTIES.find((s) => s.id === persisted.id) ??
    SEED_STAY_PROPERTIES[0]!;

  const isKauraFlagship =
    persisted.id === '31111111-1111-4111-8111-111111111101';

  const hasLegacyKauraImages =
    isKauraFlagship &&
    (!Array.isArray(persisted.images) ||
      persisted.images.length === 0 ||
      persisted.images[0]?.startsWith('https://lh3.googleusercontent.com/'));

  const hasLegacyKauraRoomImages =
    isKauraFlagship &&
    (!Array.isArray(persisted.rooms) ||
      persisted.rooms.length === 0 ||
      persisted.rooms[0]?.imageUrl?.startsWith(
        'https://lh3.googleusercontent.com/'
      ));

  return {
    id: persisted.id,
    slug: persisted.slug ?? seedMatch.slug,
    title: persisted.title ?? seedMatch.title,
    subtitle: persisted.subtitle ?? seedMatch.subtitle,
    category: persisted.category || seedMatch.category || 'Short-Let Duplex',
    district: persisted.district ?? seedMatch.district,
    estateName: persisted.estateName ?? seedMatch.estateName,
    address:
      isKauraFlagship &&
      (!persisted.address ||
        persisted.address ===
          'Prince & Princess Estate, Kaura District, Abuja, FCT, Nigeria' ||
        persisted.address ===
          'Prince & Princess Estate, Kaura District, Abuja, FCT')
        ? seedMatch.address
        : persisted.address || seedMatch.address,
    bedrooms:
      typeof persisted.bedrooms === 'number'
        ? persisted.bedrooms
        : seedMatch.bedrooms,
    bathrooms:
      typeof persisted.bathrooms === 'number'
        ? persisted.bathrooms
        : seedMatch.bathrooms,
    maxGuests:
      typeof persisted.maxGuests === 'number'
        ? persisted.maxGuests
        : seedMatch.maxGuests,
    livingRoomSizeSqm:
      typeof persisted.livingRoomSizeSqm === 'number' &&
      persisted.livingRoomSizeSqm > 0
        ? persisted.livingRoomSizeSqm
        : seedMatch.livingRoomSizeSqm,
    defaultEnsuiteSizeSqm:
      typeof persisted.defaultEnsuiteSizeSqm === 'number' &&
      persisted.defaultEnsuiteSizeSqm > 0
        ? persisted.defaultEnsuiteSizeSqm
        : seedMatch.defaultEnsuiteSizeSqm,
    nightlyRateKobo:
      typeof persisted.nightlyRateKobo === 'number'
        ? persisted.nightlyRateKobo
        : seedMatch.nightlyRateKobo,
    weeklyRateKobo:
      typeof persisted.weeklyRateKobo === 'number'
        ? persisted.weeklyRateKobo
        : seedMatch.weeklyRateKobo,
    monthlyRateKobo:
      typeof persisted.monthlyRateKobo === 'number'
        ? persisted.monthlyRateKobo
        : seedMatch.monthlyRateKobo,
    cautionDepositKobo:
      typeof persisted.cautionDepositKobo === 'number'
        ? persisted.cautionDepositKobo
        : seedMatch.cautionDepositKobo,
    aboutIntro:
      persisted.aboutIntro && persisted.aboutIntro.trim().length > 0
        ? persisted.aboutIntro
        : seedMatch.aboutIntro,
    ourPromise:
      persisted.ourPromise && persisted.ourPromise.trim().length > 0
        ? persisted.ourPromise
        : seedMatch.ourPromise,
    amenityGroups:
      Array.isArray(persisted.amenityGroups) &&
      persisted.amenityGroups.length > 0
        ? persisted.amenityGroups
        : seedMatch.amenityGroups,
    rooms:
      !hasLegacyKauraRoomImages &&
      Array.isArray(persisted.rooms) &&
      persisted.rooms.length > 0
        ? persisted.rooms
        : seedMatch.rooms,
    amenities:
      Array.isArray(persisted.amenities) && persisted.amenities.length > 0
        ? persisted.amenities
        : seedMatch.amenities,
    images:
      !hasLegacyKauraImages &&
      Array.isArray(persisted.images) &&
      persisted.images.length > 0
        ? persisted.images
        : seedMatch.images,
    isFlagship:
      typeof persisted.isFlagship === 'boolean'
        ? persisted.isFlagship
        : seedMatch.isFlagship,
    blockedDates: Array.isArray(persisted.blockedDates)
      ? persisted.blockedDates
      : seedMatch.blockedDates,
  };
}

export function readCmsStore(): CmsDatabaseState {
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Partial<CmsDatabaseState>;
      const initial = createInitialState();

      const persistedVersion =
        typeof parsed.seedVersion === 'number' ? parsed.seedVersion : 1;

      let products: ProductCatalogItem[] = Array.isArray(parsed.products)
        ? parsed.products
        : initial.products;

      let shouldPersistUpgrade = false;

      if (
        persistedVersion < CURRENT_SEED_VERSION &&
        Array.isArray(parsed.products)
      ) {
        const existingIds = new Set(products.map((p) => p.id));
        const existingSlugs = new Set(products.map((p) => p.slug));
        const missingSeeds = initial.products.filter(
          (seedItem) =>
            !existingIds.has(seedItem.id) && !existingSlugs.has(seedItem.slug)
        );
        if (missingSeeds.length > 0) {
          products = [...missingSeeds, ...products];
        }
        shouldPersistUpgrade = true;
      }

      const hydrated: CmsDatabaseState = {
        seedVersion: CURRENT_SEED_VERSION,
        products,
        categories: Array.isArray(parsed.categories)
          ? parsed.categories
          : initial.categories,
        stayCategories:
          Array.isArray(parsed.stayCategories) &&
          parsed.stayCategories.length > 0
            ? parsed.stayCategories
            : initial.stayCategories,
        stayProperties: Array.isArray(parsed.stayProperties)
          ? parsed.stayProperties.map((p) => normalizeStayProperty(p))
          : initial.stayProperties,
        fleetVehicles: Array.isArray(parsed.fleetVehicles)
          ? parsed.fleetVehicles
          : initial.fleetVehicles,
        pages: Array.isArray(parsed.pages) ? parsed.pages : initial.pages,
      };

      if (shouldPersistUpgrade) {
        writeCmsStore(hydrated);
      }

      return hydrated;
    }
  } catch {
    // Fallback to initial seed state if file is unreadable
  }

  const initial = createInitialState();
  writeCmsStore(initial);
  return initial;
}

export function writeCmsStore(nextState: CmsDatabaseState): void {
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const payload: CmsDatabaseState = {
      ...nextState,
      seedVersion: nextState.seedVersion ?? CURRENT_SEED_VERSION,
    };
    fs.writeFileSync(
      STORE_FILE_PATH,
      JSON.stringify(payload, null, 2),
      'utf8'
    );
  } catch {
    // Ignore filesystem write errors in read-only test sandboxes
  }
}

const DEFAULT_LOCAL_PG_URL =
  'postgresql://lifestyleng:local_dev_password@localhost:5432/lifestyleng_core';
const CMS_STATE_ROW_ID = 'primary';

let pgSchemaEnsured = false;

function isPostgresPersistenceEnabled(): boolean {
  if (process.env.VITEST === 'true' || process.env.NODE_ENV === 'test') {
    return false;
  }
  const url = process.env.DATABASE_URL?.trim();
  if (!url || url === DEFAULT_LOCAL_PG_URL) {
    return false;
  }
  return url.startsWith('postgres://') || url.startsWith('postgresql://');
}

async function ensureCmsStateTable(): Promise<void> {
  if (pgSchemaEnsured) return;
  await sql`
    CREATE TABLE IF NOT EXISTS cms_state (
      id TEXT PRIMARY KEY,
      payload JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  pgSchemaEnsured = true;
}

function hydratePartialCmsState(
  parsed: Partial<CmsDatabaseState>
): { state: CmsDatabaseState; upgraded: boolean } {
  const initial = createInitialState();
  const persistedVersion =
    typeof parsed.seedVersion === 'number' ? parsed.seedVersion : 1;

  let products: ProductCatalogItem[] = Array.isArray(parsed.products)
    ? parsed.products
    : initial.products;
  let upgraded = false;

  if (
    persistedVersion < CURRENT_SEED_VERSION &&
    Array.isArray(parsed.products)
  ) {
    const existingIds = new Set(products.map((p) => p.id));
    const existingSlugs = new Set(products.map((p) => p.slug));
    const missingSeeds = initial.products.filter(
      (seedItem) =>
        !existingIds.has(seedItem.id) && !existingSlugs.has(seedItem.slug)
    );
    if (missingSeeds.length > 0) {
      products = [...missingSeeds, ...products];
    }
    upgraded = true;
  }

  return {
    state: {
      seedVersion: CURRENT_SEED_VERSION,
      products,
      categories: Array.isArray(parsed.categories)
        ? parsed.categories
        : initial.categories,
      stayCategories:
        Array.isArray(parsed.stayCategories) &&
        parsed.stayCategories.length > 0
          ? parsed.stayCategories
          : initial.stayCategories,
      stayProperties: Array.isArray(parsed.stayProperties)
        ? parsed.stayProperties.map((p) => normalizeStayProperty(p))
        : initial.stayProperties,
      fleetVehicles: Array.isArray(parsed.fleetVehicles)
        ? parsed.fleetVehicles
        : initial.fleetVehicles,
      pages: Array.isArray(parsed.pages) ? parsed.pages : initial.pages,
    },
    upgraded,
  };
}

export async function readCmsStoreAsync(): Promise<CmsDatabaseState> {
  if (isPostgresPersistenceEnabled()) {
    try {
      await ensureCmsStateTable();
      const rows = await sql<{ payload: Partial<CmsDatabaseState> }[]>`
        SELECT payload FROM cms_state WHERE id = ${CMS_STATE_ROW_ID} LIMIT 1
      `;
      const row = rows[0];
      if (row && row.payload) {
        const { state, upgraded } = hydratePartialCmsState(row.payload);
        if (upgraded) {
          await writeCmsStoreAsync(state);
        }
        return state;
      }

      const initial = createInitialState();
      await writeCmsStoreAsync(initial);
      return initial;
    } catch {
      // Fall back to local JSON store if managed Postgres is temporarily unreachable
    }
  }

  return readCmsStore();
}

export async function writeCmsStoreAsync(
  nextState: CmsDatabaseState
): Promise<void> {
  const payload: CmsDatabaseState = {
    ...nextState,
    seedVersion: nextState.seedVersion ?? CURRENT_SEED_VERSION,
  };

  if (isPostgresPersistenceEnabled()) {
    try {
      await ensureCmsStateTable();
      await sql`
        INSERT INTO cms_state (id, payload, updated_at)
        VALUES (${CMS_STATE_ROW_ID}, ${JSON.stringify(payload)}::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
      `;
      return;
    } catch {
      // Fall through to local file store if Postgres write fails
    }
  }

  writeCmsStore(payload);
}
