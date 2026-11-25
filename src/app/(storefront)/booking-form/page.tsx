import type { Metadata } from 'next';
import {
  getFleetVehiclesCatalog,
  getStayPropertiesCatalog,
} from '@/server/queries/catalog';
import {
  PropertyMgmtForm,
  StayBookingWidget,
} from '@/components/divisions/homes/stay-booking-widget';
import {
  CarHireConsole,
  LogisticsShipmentForm,
} from '@/components/divisions/logistics/car-hire-console';
import {
  FibrexCoverageCard,
  MtnB2bDistributionForm,
} from '@/components/divisions/mtn/fibrex-coverage-card';

export const metadata: Metadata = {
  title:
    'Book a Service — Shortlet, Car Hire, Cargo & MTN FibreX | LifestyleNG.com',
  description:
    'Book our 4-bedroom Kaura shortlet duplex, hire a chauffeur-driven car in Abuja, send a cargo parcel, or request MTN FibreX installation.',
};

export default async function UnifiedBookingFormPage() {
  const [stayProperties, fleetVehicles] = await Promise.all([
    getStayPropertiesCatalog(),
    getFleetVehiclesCatalog(),
  ]);
  const flagshipProperty = stayProperties[0];

  return (
    <div className="mx-auto max-w-[1200px] space-y-14 px-4 py-8 sm:px-6 sm:py-12">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#006A6A]">
          Lifestyle Corporate Networks Ltd. • Abuja
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#1B1B1D] sm:text-5xl">
          Book a Service
        </h1>
        <p className="text-base text-[#44474E]">
          Reserve our 4-bedroom Kaura duplex, book a car and driver, or check
          MTN FibreX coverage for your home or office.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href="#desk-shortlet"
          className="rounded-full bg-[#001026] px-5 py-2.5 text-xs font-semibold text-white"
        >
          1. Shortlet &amp; Property Management
        </a>
        <a
          href="#desk-carhire"
          className="rounded-full border border-black/[0.1] bg-white px-5 py-2.5 text-xs font-semibold text-[#1B1B1D] hover:bg-[#F5F5F7]"
        >
          2. Car Hire &amp; Parcel Delivery
        </a>
        <a
          href="#desk-mtn"
          className="rounded-full border border-black/[0.1] bg-white px-5 py-2.5 text-xs font-semibold text-[#1B1B1D] hover:bg-[#F5F5F7]"
        >
          3. MTN Services
        </a>
      </div>

      <section id="desk-shortlet" className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
          1. Kaura 4-Bedroom Shortlet &amp; Property Management
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {flagshipProperty ? (
            <div className="lg:col-span-5">
              <StayBookingWidget property={flagshipProperty} />
            </div>
          ) : null}
          <div className="lg:col-span-7">
            <PropertyMgmtForm />
          </div>
        </div>
      </section>

      <section id="desk-carhire" className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
          2. Car Hire, Airport Transfers &amp; Parcel Delivery
        </h2>
        <CarHireConsole vehicles={fleetVehicles} />
        <LogisticsShipmentForm />
      </section>

      <section id="desk-mtn" className="space-y-4">
        <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
          3. MTN FibreX Coverage &amp; Bulk Router Orders
        </h2>
        <FibrexCoverageCard />
        <MtnB2bDistributionForm />
      </section>
    </div>
  );
}
