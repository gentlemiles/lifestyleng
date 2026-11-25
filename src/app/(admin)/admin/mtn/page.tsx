import Link from 'next/link';

export default function AdminMtnPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase text-[#008080]">
            Lifestyle MTN Services CMS
          </span>
          <h1 className="font-display text-2xl font-bold text-[#1D1D1F]">
            MTN FibreX Coverage Leads &amp; B2B Distribution Orders
          </h1>
        </div>
        <Link href="/admin" className="text-xs font-semibold text-[#008080]">
          ← Back to Admin Overview
        </Link>
      </div>

      <div className="rounded-[22px] border border-black/[0.06] bg-white p-6 space-y-2">
        <p className="font-display text-sm font-bold text-[#1D1D1F]">
          Active Abuja FibreX Coverage &amp; B2B Distribution Queue
        </p>
        <p className="text-xs text-[#6E6E73]">
          All FibreX enquiries carry the mandatory notice: &ldquo;Coverage,
          installation, speed and service availability are subject to MTN
          confirmation.&rdquo;
        </p>
      </div>
    </div>
  );
}
