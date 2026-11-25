import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import {
  getFashionCatalog,
  getFleetVehiclesCatalog,
  getMtnHardwareCatalog,
  getStayPropertiesCatalog,
  getStorefrontPageConfig,
} from '@/server/queries/catalog';
import { ProductCard } from '@/components/commerce/product-card';
import { PriceDisplay, formatKoboToNaira } from '@/components/commerce/price-display';
import { CmsCustomSections } from '@/components/layout/cms-custom-sections';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [
    fashionProducts,
    mtnProducts,
    stayProperties,
    fleetVehicles,
    pageConfig,
  ] = await Promise.all([
    getFashionCatalog(),
    getMtnHardwareCatalog(),
    getStayPropertiesCatalog(),
    getFleetVehiclesCatalog(),
    getStorefrontPageConfig('/'),
  ]);

  const flagshipDuplex = stayProperties[0];
  const heroTiles = pageConfig.heroTiles;
  const tileFashion = heroTiles[0];
  const tileCarHire = heroTiles[1];
  const tileStays = heroTiles[2];

  return (
    <div className="mx-auto max-w-[1200px] space-y-16 px-4 py-8 sm:px-6 sm:py-12">
      <section className="rounded-[28px] border border-black/[0.06] bg-white p-6 sm:p-12 lg:p-14 shadow-xs">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#006A6A]">
              {pageConfig.heroEyebrow}
            </p>

            <h1 className="font-display text-3xl font-bold tracking-tight text-[#1B1B1D] sm:text-5xl leading-[1.12]">
              {pageConfig.heroHeadline}
            </h1>

            <p className="max-w-lg text-base leading-relaxed text-[#44474E]">
              {pageConfig.heroDescription}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                href={pageConfig.primaryCtaHref || '/shop/clothes'}
                className="inline-flex items-center gap-2 rounded-full bg-[#001026] px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-[#0B2545]"
              >
                <span>{pageConfig.primaryCtaText || 'Shop New Arrivals'}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={pageConfig.secondaryCtaHref || '#services'}
                className="inline-flex items-center justify-center rounded-full border border-black/[0.1] bg-[#F5F5F7] px-6 py-3.5 text-sm font-medium text-[#1B1B1D] transition hover:bg-[#EAE7EA]"
              >
                {pageConfig.secondaryCtaText || 'Explore Services'}
              </Link>
            </div>

            {pageConfig.announcementText ? (
              <div className="border-t border-black/[0.06] pt-4 text-xs text-[#44474E]">
                {pageConfig.announcementText}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-6">
            <div className="grid h-[420px] grid-cols-2 gap-3 sm:h-[460px]">
              <div className="flex flex-col gap-3">
                <Link
                  href={tileFashion?.href ?? '/shop/clothes'}
                  className="group relative h-3/5 overflow-hidden rounded-2xl bg-[#F5F5F7]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      tileFashion?.imageUrl ??
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuAl7IfgBa4_j7Svf1aBlGZZYudSQ6ex1UhlSfAa0pHzaJQ_9wxGPfhiFQBVQH5DnXDRNl-nzqFObFITardgt7h1B0irH7fZBIAB_UHxztlCf_GUy36IPSwsP3By5dX3FCd1qJ0-GzYgqDoX9zYfCnswuBfyhWbikpC8d16W-4EJEqKoaFmwmUKMdmD_mGBFeLDX4PA56UHjXJ_s7-KrD5Dai5o1E8D-WKBLa-XfHLQ'
                    }
                    alt={tileFashion?.label ?? 'Wuye Boutique'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="text-xs font-semibold text-white">
                      {tileFashion?.label ?? 'Wuye Boutique'}
                    </span>
                  </div>
                </Link>

                <Link
                  href="/mtn-services/fibrex"
                  className="flex h-2/5 flex-col justify-between rounded-2xl bg-[#001026] p-5 text-white transition hover:bg-[#0B2545]"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#FFCC00]">
                    MTN Services
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold">
                      Up to 250 Mbps
                    </p>
                    <p className="text-xs text-white/75">
                      FibreX &amp; 5G Routers
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href={tileCarHire?.href ?? '/car-hire'}
                  className="group relative h-2/5 overflow-hidden rounded-2xl bg-[#F5F5F7]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      tileCarHire?.imageUrl ??
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBmKgbZlpIx1HeNKCcL6fhBhJWCcmX1zwBT51WesX6fW5tausNeOqvB-n6h6SV-wQloPOhJGkIC5kGvhl6Z-g_1Zb9wxvZQ7W2o1wANttJIbTHY3wa_SpRo6WmP8qybamg0WkeucjcPYYNSsH9cOhh_QS5z3kVGL77iWn5m8Tz1HYuMfNcn3QkVzbqBOYuavnRKraDn9XKNYmdqaElY96Y_jb9ZZ4G38GlvPgnPt_s'
                    }
                    alt={tileCarHire?.label ?? 'Car Hire & Airport Pickup'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="text-xs font-semibold text-white">
                      {tileCarHire?.label ?? 'Car Hire & Airport Pickup'}
                    </span>
                  </div>
                </Link>

                <Link
                  href={tileStays?.href ?? '/stays'}
                  className="group relative h-3/5 overflow-hidden rounded-2xl bg-[#F5F5F7]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={
                      tileStays?.imageUrl ??
                      'https://lh3.googleusercontent.com/aida-public/AB6AXuBN5jGryxDKE29jBSsDXxa_8qpBc9l_YIdyClNLg1f8TW1DDD4jJUya7EeMI87RHbBsawnHWU5IO3Br6FFgTFYl_QYIRUyPAzPtvy6hjNShsMu1ddNpBeJeYTEVdtO9Rgc34dbPryXecZG8_I3kyV31-aV4CGtQBEza-eI0C88tkCxFJm5ije_0FJ9tgzSJfA-DarNeSmp-kYN8IrE9sFrNwVYpcUs7wBo-kILLg1g'
                    }
                    alt={tileStays?.label ?? 'Kaura 4-Bedroom Duplex'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                    <span className="text-xs font-semibold text-white">
                      {tileStays?.label ?? 'Kaura 4-Bedroom Duplex'}
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CmsCustomSections sections={pageConfig.customSections} />

      <section id="services" className="space-y-6">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1B1B1D] sm:text-3xl">
              Our Four Divisions
            </h2>
            <p className="mt-1 text-sm text-[#44474E]">
              Operated by Lifestyle Corporate Networks Ltd. across Abuja.
            </p>
          </div>
          <Link
            href="/booking-form"
            className="text-xs font-semibold text-[#006A6A] hover:underline"
          >
            Open Service Booking Form →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7">
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#006A6A]">
                Suite 83 / Block B70, H&amp;A Plaza, Wuye
              </span>
              <h3 className="font-display text-xl font-bold text-[#1B1B1D]">
                1. Lifestyle Boutique (Fashion)
              </h3>
              <p className="text-sm text-[#44474E]">
                Ready-to-wear menswear, Italian leather loafers, totes, and
                sunglasses. Pick up in store at Wuye or get same-day Abuja
                delivery. Backed by a 24-hour return window from receipt.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/shop/clothes"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#001026] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0B2545]"
              >
                <span>Shop Clothing &amp; Bags</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7">
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#745B00]">
                Subject to MTN Network Confirmation
              </span>
              <h3 className="font-display text-xl font-bold text-[#1B1B1D]">
                2. Lifestyle MTN Services
              </h3>
              <p className="text-sm text-[#44474E]">
                Check MTN FibreX coverage for your Abuja home or office, arrange
                router installation, renew subscriptions, or order 5G routers
                and MiFis in bulk.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/mtn-services/fibrex"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#FFCC00] px-5 py-2.5 text-xs font-bold text-[#001026] hover:bg-[#E6B800]"
              >
                <span>Check FibreX Availability</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7">
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#006A6A]">
                Prince &amp; Princess Estate, Kaura District
              </span>
              <h3 className="font-display text-xl font-bold text-[#1B1B1D]">
                3. Lifestyle Boutique (Homes)
              </h3>
              <p className="text-sm text-[#44474E]">
                4 rooms all en-suite (2 double beds, 4 single beds • max 8
                persons • no pets allowed). Available to rent per room or the
                whole apartment, plus property management for Abuja landlords.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/stays"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#001026] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0B2545]"
              >
                <span>View Shortlet Stays</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-7">
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-[#006A6A]">
                2 Hours Advance Notice Recommended
              </span>
              <h3 className="font-display text-xl font-bold text-[#1B1B1D]">
                4. Lifestyle Logistics
              </h3>
              <p className="text-sm text-[#44474E]">
                Chauffeur-driven sedans, Prado SUVs, and HiAce vans for Abuja
                rides, Nnamdi Azikiwe Airport (ABV) pickups, inter-state
                charters across 36 states, and cargo dispatch.
              </p>
            </div>
            <div className="mt-6">
              <Link
                href="/car-hire"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#001026] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#0B2545]"
              >
                <span>Book a Vehicle</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="fashion" className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1B1B1D] sm:text-3xl">
              New Arrivals at Wuye Store
            </h2>
            <p className="mt-1 text-sm text-[#44474E]">
              In stock at Suite 83, H&amp;A Plaza, Wuye for delivery or free
              pickup.
            </p>
          </div>
          <Link
            href="/shop/clothes"
            className="text-xs font-semibold text-[#006A6A] hover:underline"
          >
            View All ({fashionProducts.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {fashionProducts.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {flagshipDuplex ? (
        <section
          id="shortlet"
          className="rounded-[24px] border border-black/[0.06] bg-white p-6 sm:p-10"
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-[#F5F5F7] lg:col-span-7">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flagshipDuplex.images[0] ?? ''}
                alt={flagshipDuplex.title}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-4 lg:col-span-5">
              <p className="flex items-start gap-1.5 text-xs font-semibold text-[#006A6A]">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{flagshipDuplex.address}</span>
              </p>
              <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
                {flagshipDuplex.title}
              </h2>
              <p className="text-sm text-[#44474E]">
                <strong>4 rooms all en-suite</strong> with{' '}
                <strong>2 double beds</strong> and <strong>4 single beds</strong>{' '}
                (max {flagshipDuplex.maxGuests} persons •{' '}
                <strong>no pets allowed</strong>). Can be{' '}
                <strong>rented per room or as the whole apartment</strong>, with
                24/7 lithium inverter power, MTN FibreX Wi-Fi, and table soccer
                lounge.
              </p>
              <div className="flex items-baseline gap-6 border-y border-black/[0.06] py-3">
                <div>
                  <span className="block text-[11px] text-[#74777F]">
                    Nightly Rate
                  </span>
                  <PriceDisplay
                    amountKobo={flagshipDuplex.nightlyRateKobo}
                    periodSuffix="/ night"
                    size="lg"
                  />
                </div>
                <div>
                  <span className="block text-[11px] text-[#74777F]">
                    Caution Deposit
                  </span>
                  <PriceDisplay
                    amountKobo={flagshipDuplex.cautionDepositKobo}
                    size="md"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/stays"
                  className="rounded-full bg-[#001026] px-6 py-3 text-xs font-semibold text-white hover:bg-[#0B2545]"
                >
                  Check Dates &amp; Book
                </Link>
                <Link
                  href="/stays#property-management"
                  className="rounded-full border border-black/[0.1] bg-[#F5F5F7] px-5 py-3 text-xs font-medium text-[#1B1B1D] hover:bg-[#EAE7EA]"
                >
                  List Your Property
                </Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1B1B1D] sm:text-3xl">
              MTN 5G Routers &amp; MiFis
            </h2>
            <p className="mt-1 text-sm text-[#44474E]">
              Ready for delivery in Abuja or pickup at our Wuye store.
            </p>
          </div>
          <Link
            href="/mtn-services/fibrex"
            className="text-xs font-semibold text-[#006A6A] hover:underline"
          >
            Check FibreX Coverage →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {mtnProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section id="fleet" className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-[#1B1B1D] sm:text-3xl">
              Chauffeur-Driven Car Hire
            </h2>
            <p className="mt-1 text-sm text-[#44474E]">
              Intra-city Abuja rentals, ABV airport pickups, and inter-state
              trips.
            </p>
          </div>
          <Link
            href="/car-hire"
            className="text-xs font-semibold text-[#006A6A] hover:underline"
          >
            View All Vehicles →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {fleetVehicles.slice(0, 3).map((vehicle) => (
            <div
              key={vehicle.id}
              className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-5"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden rounded-xl bg-[#F5F5F7]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={vehicle.imageUrl}
                    alt={vehicle.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <h3 className="mt-4 font-display text-base font-bold text-[#1B1B1D]">
                  {vehicle.name}
                </h3>
                <p className="mt-1 text-xs text-[#44474E]">
                  Up to {vehicle.passengerCapacity} passengers •{' '}
                  {vehicle.luggageCapacity} bags • Chauffeur included
                </p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                <div>
                  <span className="block text-[11px] text-[#74777F]">
                    Abuja Daily Rate
                  </span>
                  <span className="font-display text-base font-bold text-[#1B1B1D] tabular-nums">
                    {formatKoboToNaira(vehicle.dailyIntraCityRateKobo)}
                  </span>
                </div>
                <Link
                  href="/car-hire"
                  className="rounded-full bg-[#001026] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2545]"
                >
                  Book Vehicle
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
