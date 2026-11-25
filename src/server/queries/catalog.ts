import { readCmsStore } from '@/server/services/cms-store';
import type {
  CmsCategoryItem,
  CmsPageConfig,
  FleetVehicleView,
  ProductCatalogItem,
  ProductSubPillar,
  StayCategoryItem,
  StayPropertyView,
} from '@/types';

export async function getAllProductsCatalog(): Promise<ProductCatalogItem[]> {
  return readCmsStore().products;
}

export async function getFashionCatalog(
  subPillar?: ProductSubPillar
): Promise<ProductCatalogItem[]> {
  const fashion = readCmsStore().products.filter(
    (p) => p.division === 'FASHION_BOUTIQUE'
  );
  if (!subPillar) {
    return fashion;
  }
  return fashion.filter((p) => p.subPillar === subPillar);
}

export async function getProductBySlug(
  slug: string
): Promise<ProductCatalogItem | null> {
  return readCmsStore().products.find((p) => p.slug === slug) ?? null;
}

export async function getMtnHardwareCatalog(): Promise<ProductCatalogItem[]> {
  return readCmsStore().products.filter((p) => p.division === 'MTN_SERVICES');
}

export async function getCategoriesCatalog(): Promise<CmsCategoryItem[]> {
  return readCmsStore().categories;
}

export async function getStayCategoriesCatalog(): Promise<StayCategoryItem[]> {
  return readCmsStore().stayCategories;
}

export async function getStayPropertiesCatalog(): Promise<StayPropertyView[]> {
  return readCmsStore().stayProperties;
}

export async function getStayPropertyBySlug(
  slug: string
): Promise<StayPropertyView | null> {
  return readCmsStore().stayProperties.find((s) => s.slug === slug) ?? null;
}

export async function getFleetVehiclesCatalog(): Promise<FleetVehicleView[]> {
  return readCmsStore().fleetVehicles;
}

export async function getStorefrontPageConfig(
  pagePath: CmsPageConfig['path']
): Promise<CmsPageConfig> {
  const store = readCmsStore();
  const found = store.pages.find((p) => p.path === pagePath);
  if (found) return found;
  return (
    store.pages[0] ?? {
      path: pagePath,
      pageName: pagePath,
      heroEyebrow: 'LifestyleNG.com',
      heroHeadline: 'Lifestyle Corporate Networks Ltd.',
      heroDescription: 'Wear It. Connect It. Stay in It. Move with It.',
      primaryCtaText: 'Shop Store',
      primaryCtaHref: '/shop/clothes',
      heroTiles: [],
      customSections: [],
      updatedAt: new Date().toISOString(),
    }
  );
}

export async function getAllStorefrontPagesConfig(): Promise<CmsPageConfig[]> {
  return readCmsStore().pages;
}
