import Link from 'next/link';

export default function CustomerBookingsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#008080]">
            Multi-Service Customer Portal
          </span>
          <h1 className="font-display text-3xl font-bold text-[#1D1D1F]">
            My Stays, Car Hire, Logistics &amp; MTN FibreX Bookings
          </h1>
        </div>
        <Link
          href="/booking-form"
          className="rounded-full bg-[#1D1D1F] px-5 py-2.5 text-xs font-semibold text-white"
        >
          + New Service Booking
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-[22px] border border-black/[0.06] bg-white p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase text-[#008080]">
            Lifestyle Boutique (Homes)
          </span>
          <h2 className="font-display text-base font-bold text-[#1D1D1F]">
            4-Bedroom Luxury Duplex — Kaura
          </h2>
          <p className="text-xs text-[#6E6E73]">
            Prince &amp; Princess Estate, Kaura District, Abuja • Status: Confirmed
          </p>
        </div>

        <div className="rounded-[22px] border border-black/[0.06] bg-white p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase text-[#008080]">
            Lifestyle Logistics
          </span>
          <h2 className="font-display text-base font-bold text-[#1D1D1F]">
            ABV Airport Transfer • Prado VX
          </h2>
          <p className="text-xs text-[#6E6E73]">
            Nnamdi Azikiwe International Airport → Maitama • Chauffeur Assigned
          </p>
        </div>

        <div className="rounded-[22px] border border-black/[0.06] bg-white p-5 space-y-2">
          <span className="text-[11px] font-bold uppercase text-[#008080]">
            Lifestyle MTN Services
          </span>
          <h2 className="font-display text-base font-bold text-[#1D1D1F]">
            MTN FibreX Unlimited Coverage Check
          </h2>
          <p className="text-xs text-[#6E6E73]">
            Subject to MTN confirmation • Verification in progress
          </p>
        </div>
      </div>
    </div>
  );
}
