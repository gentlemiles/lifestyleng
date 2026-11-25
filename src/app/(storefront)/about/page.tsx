import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { getStorefrontPageConfig } from '@/server/queries/catalog';
import { CmsCustomSections } from '@/components/layout/cms-custom-sections';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'About Us — Lifestyle Corporate Networks Ltd. | Abuja, Nigeria',
  description:
    'Learn about Lifestyle Corporate Networks Ltd. (Plot 12, Corporate Avenue, Garki, Abuja) and our four Abuja divisions: Fashion, Homes, Logistics, and MTN Services.',
};

export default async function AboutPage() {
  const pageConfig = await getStorefrontPageConfig('/about');

  return (
    <div className="mx-auto max-w-[1200px] space-y-14 px-4 py-10 sm:px-6 sm:py-14">
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

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#006A6A]">
              Suite 83 / Block B70, H&amp;A Plaza, Wuye
            </span>
            <h2 className="font-display text-xl font-bold text-[#1B1B1D]">
              Lifestyle Boutique (Fashion)
            </h2>
            <p className="text-sm text-[#44474E]">
              Menswear, Italian leather shoes, bags, and accessories stocked in
              our Wuye store. Order online for same-day Abuja delivery or walk
              in to try items on. Returns are accepted within 24 hours of
              receipt.
            </p>
          </div>
          <Link
            href="/shop/clothes"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#006A6A] hover:underline"
          >
            <span>Shop Wuye Store</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#745B00]">
              Subject to MTN Confirmation
            </span>
            <h2 className="font-display text-xl font-bold text-[#1B1B1D]">
              Lifestyle MTN Services
            </h2>
            <p className="text-sm text-[#44474E]">
              We help Abuja residents and offices check MTN FibreX coverage,
              schedule fiber installation, renew monthly plans, and purchase
              genuine 5G routers and pocket MiFis.
            </p>
          </div>
          <Link
            href="/mtn-services/fibrex"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#006A6A] hover:underline"
          >
            <span>Check FibreX Availability</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#006A6A]">
              Prince &amp; Princess Estate, Kaura District
            </span>
            <h2 className="font-display text-xl font-bold text-[#1B1B1D]">
              Lifestyle Boutique (Homes)
            </h2>
            <p className="text-sm text-[#44474E]">
              Short-let and monthly furnished stays anchored by our 4-bedroom
              duplex in Kaura (4 rooms all en-suite, 2 double beds, 4 single
              beds, max 8 persons, no pets allowed, rent per room or whole
              apartment), plus property management for Abuja landlords.
            </p>
          </div>
          <Link
            href="/stays"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#006A6A] hover:underline"
          >
            <span>View Kaura Duplex</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[#006A6A]">
              Abuja &amp; All 36 States
            </span>
            <h2 className="font-display text-xl font-bold text-[#1B1B1D]">
              Lifestyle Logistics
            </h2>
            <p className="text-sm text-[#44474E]">
              Chauffeur-driven sedans, Prado SUVs, and passenger vans for Abuja
              city hire, Nnamdi Azikiwe Airport (ABV) pickups, inter-state
              trips, and parcel delivery.
            </p>
          </div>
          <Link
            href="/car-hire"
            className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#006A6A] hover:underline"
          >
            <span>Book a Vehicle</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-8 text-center space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
          Wear It. Connect It. Stay in It. Move with It.
        </h2>
        <p className="mx-auto max-w-xl text-sm text-[#44474E]">
          Visit us in Wuye or Garki, or reach our Abuja team directly on
          WhatsApp.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link
            href="/contact"
            className="rounded-full bg-[#001026] px-6 py-3 text-xs font-semibold text-white hover:bg-[#0B2545]"
          >
            View Locations &amp; Phones
          </Link>
          <a
            href={buildWhatsAppUrl(
              'Hello Lifestyle Corporate Networks Ltd., I would like to make an enquiry.'
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-black/[0.1] bg-[#F5F5F7] px-6 py-3 text-xs font-semibold text-[#1B1B1D] hover:bg-[#EAE7EA]"
          >
            Message on WhatsApp
          </a>
        </div>
      </section>
    </div>
  );
}
