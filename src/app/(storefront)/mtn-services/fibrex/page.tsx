import type { Metadata } from 'next';
import {
  getMtnHardwareCatalog,
  getStorefrontPageConfig,
} from '@/server/queries/catalog';
import {
  FibrexCoverageCard,
  MtnB2bDistributionForm,
} from '@/components/divisions/mtn/fibrex-coverage-card';
import { ProductCard } from '@/components/commerce/product-card';
import { CmsCustomSections } from '@/components/layout/cms-custom-sections';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:
    'MTN Services — FibreX Internet & 5G Routers in Abuja | Lifestyle Corporate Networks Ltd.',
  description:
    'Check MTN FibreX availability in your Abuja estate, shop MTN 5G/4G routers and pocket MiFis, or request wholesale B2B hardware.',
};

export default async function MtnFibrexHubPage() {
  const [mtnProducts, pageConfig] = await Promise.all([
    getMtnHardwareCatalog(),
    getStorefrontPageConfig('/mtn-services/fibrex'),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-14 px-4 py-8 sm:px-6 sm:py-12">
      <section className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#745B00]">
          {pageConfig.heroEyebrow}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#1B1B1D] sm:text-5xl">
          {pageConfig.heroHeadline}
        </h1>
        <p className="text-base leading-relaxed text-[#44474E]">
          {pageConfig.heroDescription}
        </p>
      </section>

      <CmsCustomSections sections={pageConfig.customSections} />

      <section aria-labelledby="fibrex-coverage-heading">
        <FibrexCoverageCard />
      </section>

      <section className="space-y-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1B1B1D] sm:text-3xl">
            MTN 5G Routers &amp; Pocket MiFis
          </h2>
          <p className="mt-1 text-sm text-[#44474E]">
            In stock in Abuja with 1-year manufacturer warranty.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {mtnProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section aria-labelledby="mtn-b2b-heading">
        <MtnB2bDistributionForm />
      </section>
    </div>
  );
}
