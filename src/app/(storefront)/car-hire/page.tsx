import type { Metadata } from 'next';
import {
  getFleetVehiclesCatalog,
  getStorefrontPageConfig,
} from '@/server/queries/catalog';
import {
  CarHireConsole,
  LogisticsShipmentForm,
} from '@/components/divisions/logistics/car-hire-console';
import { CmsCustomSections } from '@/components/layout/cms-custom-sections';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:
    'Abuja Car Hire, Airport Transfers & Inter-State Travel | Lifestyle Logistics',
  description:
    'Chauffeur-driven sedans (₦45,000/day), Prado SUVs (₦95,000/day), and HiAce vans in Abuja. Book Nnamdi Azikiwe Airport (ABV) pickups, inter-state travel across 36 states, or cargo delivery.',
};

export default async function CarHireAndLogisticsPage() {
  const [vehicles, pageConfig] = await Promise.all([
    getFleetVehiclesCatalog(),
    getStorefrontPageConfig('/car-hire'),
  ]);

  return (
    <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-8 sm:px-6 sm:py-12">
      <section className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#006A6A]">
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

      <section aria-labelledby="car-hire-console">
        <CarHireConsole vehicles={vehicles} />
      </section>

      <section aria-labelledby="cargo-logistics">
        <LogisticsShipmentForm />
      </section>
    </div>
  );
}
