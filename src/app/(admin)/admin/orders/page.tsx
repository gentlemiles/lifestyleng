import Link from 'next/link';
import { formatKoboToNaira } from '@/lib/money';

export default function AdminOrdersPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold uppercase text-[#008080]">
            Omnichannel Fulfillment &amp; Returns
          </span>
          <h1 className="font-display text-2xl font-bold text-[#1D1D1F]">
            Orders &amp; 24-Hour Return Inspection Queue
          </h1>
        </div>
        <Link href="/admin" className="text-xs font-semibold text-[#008080]">
          ← Back to Admin Overview
        </Link>
      </div>

      <div className="rounded-[22px] border border-black/[0.06] bg-white p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-display text-sm font-bold text-[#1D1D1F]">
              Order #LNG-ORD-261117-WUYE01 • Wuye Click-and-Collect Pickup
            </p>
            <p className="text-xs text-[#6E6E73]">
              Suite 83 / Block B70, H&amp;A Plaza, Wuye, Abuja • Amount: {formatKoboToNaira(14500000)}
            </p>
          </div>
          <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857]">
            PICKED_UP (24h Return Window Active)
          </span>
        </div>
      </div>
    </div>
  );
}
