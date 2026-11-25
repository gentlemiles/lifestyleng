'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, RotateCcw, MessageCircle } from 'lucide-react';
import { submitReturnRequestAction } from '@/server/actions';
import { formatKoboToNaira } from '@/lib/money';

export default function CustomerOrdersAndReturnPage() {
  const [orderNumber, setOrderNumber] = useState('LNG-ORD-261117-WUYE01');
  const [customerEmail, setCustomerEmail] = useState('customer@lifestyleng.com');
  const [reason, setReason] = useState<
    | 'SIZE_EXCHANGE'
    | 'DEFECTIVE_OR_DAMAGED'
    | 'WRONG_ITEM_RECEIVED'
    | 'OTHER_ELIGIBLE_REASON'
  >('SIZE_EXCHANGE');
  const [conditionNotes, setConditionNotes] = useState(
    'Unworn with original Wuye Boutique tags intact; requesting size exchange from M to L.'
  );
  const [result, setResult] = useState<{
    returnId: string;
    remainingHoursWhenFiled: number;
    whatsappConciergeUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleReturnSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const res = await submitReturnRequestAction({
      orderNumber,
      customerEmail,
      reason,
      conditionNotes,
      unwornConditionConfirmed: true,
    });
    if (res.error) {
      setErrorMsg(res.error.message);
      return;
    }
    setResult(res.data);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10 px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#008080]">
            Customer Self-Service Portal
          </span>
          <h1 className="font-display text-3xl font-bold text-[#1D1D1F]">
            Order History &amp; 24-Hour Return Trigger
          </h1>
        </div>
        <Link
          href="/"
          className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1D1D1F] border border-black/[0.08]"
        >
          ← Return to Storefront
        </Link>
      </div>

      {/* Sample Active Order Card */}
      <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 space-y-4 shadow-[var(--shadow-rest)]">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.06] pb-4">
          <div>
            <span className="text-xs font-bold text-[#1D1D1F]">
              Order #{orderNumber}
            </span>
            <p className="text-xs text-[#6E6E73]">
              Fulfillment: Collected at Suite 83 / Block B70, H&amp;A Plaza, Wuye, Abuja • Total: {formatKoboToNaira(14500000)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FFFBEB] px-3 py-1 text-xs font-semibold text-[#B45309]">
            <Clock className="h-3.5 w-3.5" />
            20.0h Remaining in 24-Hour Return Window
          </span>
        </div>

        <form onSubmit={handleReturnSubmit} className="space-y-4 pt-2">
          <h2 className="font-display text-base font-bold text-[#1D1D1F]">
            Initiate 24-Hour Return or Wuye Size Exchange
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              type="text"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
              className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
            />
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
            />
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as typeof reason)}
              className="sm:col-span-2 rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
            >
              <option value="SIZE_EXCHANGE">Size Exchange at Wuye Boutique</option>
              <option value="DEFECTIVE_OR_DAMAGED">Defective or Damaged Item</option>
              <option value="WRONG_ITEM_RECEIVED">Wrong Item Received</option>
              <option value="OTHER_ELIGIBLE_REASON">Other Eligible Reason (&lt;= 24h)</option>
            </select>
            <textarea
              rows={3}
              value={conditionNotes}
              onChange={(e) => setConditionNotes(e.target.value)}
              required
              className="sm:col-span-2 rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] p-3.5 text-xs"
            />
          </div>

          {errorMsg ? (
            <p className="text-xs font-semibold text-[#DC2626]">{errorMsg}</p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-[#1D1D1F] px-6 py-3 text-xs font-semibold text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Submit 24-Hour Return Request
            </button>

            {result ? (
              <a
                href={result.whatsappConciergeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-5 py-3 text-xs font-semibold text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Return {result.returnId} Logged ({result.remainingHoursWhenFiled}h left) • Coordinate Wuye Drop-Off
              </a>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
