import type { Metadata } from 'next';
import { BedDouble, MapPin, Users } from 'lucide-react';
import {
  getStayCategoriesCatalog,
  getStayPropertiesCatalog,
  getStorefrontPageConfig,
} from '@/server/queries/catalog';
import { PropertyMgmtForm } from '@/components/divisions/homes/stay-booking-widget';
import { ApartmentDetailSection } from '@/components/divisions/homes/apartment-detail-section';
import { StaysCatalogGrid } from '@/components/divisions/homes/stays-catalog-grid';
import { CmsCustomSections } from '@/components/layout/cms-custom-sections';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:
    '4-Bedroom Duplex in Kaura, Abuja | Short-Let & Furnished Stays — LifestyleNG',
  description:
    'Book our 4-Bedroom Duplex at House 43, 1st Crescent, Off Drive 2, Prince & Princess Estate, First gate, opposite Kaura Market, Kaura District, Abuja — rent individual rooms or the whole apartment.',
};

export default async function StaysHubPage() {
  const [properties, stayCategories, pageConfig] = await Promise.all([
    getStayPropertiesCatalog(),
    getStayCategoriesCatalog(),
    getStorefrontPageConfig('/stays'),
  ]);
  const flagship = properties.find((p) => p.isFlagship) ?? properties[0];

  return (
    <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="space-y-2.5">
          {flagship ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-[#006A6A]">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{flagship.address}</span>
            </p>
          ) : (
            <p className="text-xs font-semibold text-[#006A6A]">
              {pageConfig.heroEyebrow}
            </p>
          )}

          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1B1B1D] sm:text-5xl">
            {flagship ? flagship.title : pageConfig.heroHeadline}
          </h1>

          {flagship && (
            <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-[#44474E]">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-medium text-[#1B1B1D]">
                <BedDouble className="h-3.5 w-3.5 text-[#006A6A]" />
                {flagship.bedrooms} rooms all en-suite
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-medium text-[#1B1B1D]">
                2 double beds • 4 single beds
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-medium text-[#1B1B1D]">
                <Users className="h-3.5 w-3.5 text-[#006A6A]" />
                Max {flagship.maxGuests} persons
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-medium text-[#1B1B1D]">
                {flagship.livingRoomSizeSqm} sqm living room •{' '}
                {flagship.defaultEnsuiteSizeSqm} sqm ensuites
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.06] bg-white px-3 py-1 font-medium text-[#1B1B1D]">
                No pets allowed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#001026] px-3 py-1 font-semibold text-white">
                Rent per room or whole apartment
              </span>
            </div>
          )}
        </div>

        <a
          href="#property-management"
          className="self-start rounded-full border border-black/[0.1] bg-white px-4 py-2 text-xs font-semibold text-[#1B1B1D] hover:bg-[#F5F5F7] lg:self-auto"
        >
          List Your Property for Management →
        </a>
      </div>

      <CmsCustomSections sections={pageConfig.customSections} />

      {flagship ? <ApartmentDetailSection property={flagship} /> : null}

      <StaysCatalogGrid properties={properties} categories={stayCategories} />

      <section id="property-management">
        <PropertyMgmtForm />
      </section>
    </div>
  );
}
