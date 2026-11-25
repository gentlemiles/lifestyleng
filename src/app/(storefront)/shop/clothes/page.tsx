import type { Metadata } from 'next';
import {
  getCategoriesCatalog,
  getFashionCatalog,
  getStorefrontPageConfig,
} from '@/server/queries/catalog';
import { FashionCatalogClient } from '@/components/divisions/fashion/fashion-catalog-client';
import { CmsCustomSections } from '@/components/layout/cms-custom-sections';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:
    'Lifestyle Boutique (Fashion) — Wuye Flagship Store | Suite 83, H&A Plaza, Wuye, Abuja',
  description:
    'Shop ready-to-wear tailoring, Italian leather shoes, bags, and accessories online or reserve a private fitting at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja. Strict 24-hour return policy from receipt.',
};

export default async function ShopClothesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    size?: string;
    sort?: string;
  }>;
}) {
  const [resolvedParams, products, categories, pageConfig] = await Promise.all([
    searchParams,
    getFashionCatalog(),
    getCategoriesCatalog(),
    getStorefrontPageConfig('/shop/clothes'),
  ]);

  const fashionCategories = categories.filter(
    (c) => c.division === 'FASHION_BOUTIQUE' && c.isActive
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-8 sm:px-6 sm:py-10">
      <FashionCatalogClient
        products={products}
        categories={fashionCategories}
        heroEyebrow={pageConfig.heroEyebrow}
        heroHeadline={pageConfig.heroHeadline}
        heroDescription={pageConfig.heroDescription}
        initialSearchQuery={resolvedParams.q ?? ''}
        initialCategory={resolvedParams.category}
        initialSize={resolvedParams.size}
        initialSort={resolvedParams.sort}
      />
      <CmsCustomSections sections={pageConfig.customSections} />
    </div>
  );
}
