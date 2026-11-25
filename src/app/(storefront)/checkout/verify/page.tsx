import Link from 'next/link';
import {
  CheckCircle2,
  MapPin,
  MessageCircle,
  Building2,
  FlaskConical,
  ShoppingBag,
  Phone,
  ArrowRight,
} from 'lucide-react';
import { formatKoboToNaira } from '@/lib/money';
import {
  OFFICIAL_DISPLAY_PHONES,
  WhatsAppTemplates,
  buildWhatsAppUrl,
} from '@/lib/whatsapp';
import { CheckoutVerifyEffects } from '@/components/commerce/checkout-verify-effects';

function parseSafeKobo(raw: string | undefined): number {
  if (!raw) return 0;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

function getFulfillmentText(fulfillment: string): string {
  if (fulfillment === 'WUYE_IN_STORE_PICKUP') {
    return 'In-Store Pickup — Suite 83 / Block B70, H&A Plaza, Wuye, Abuja (₦0)';
  }
  if (fulfillment === 'INTER_STATE_DELIVERY') {
    return 'Inter-State Courier Delivery (36 States)';
  }
  return 'Abuja Same-Day Doorstep Delivery';
}

export default async function CheckoutVerifyPage({
  searchParams,
}: {
  searchParams: Promise<{
    reference?: string;
    order?: string;
    totalKobo?: string;
    subtotalKobo?: string;
    deliveryKobo?: string;
    fulfillment?: string;
    method?: string;
    items?: string;
    customer?: string;
  }>;
}) {
  const params = await searchParams;
  const orderNumber = params.order?.trim() ?? '';
  const reference = params.reference?.trim() ?? '';
  const hasValidOrder = Boolean(orderNumber && reference);

  if (!hasValidOrder) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-[28px] border border-black/[0.08] bg-white p-8 text-center space-y-5 shadow-[var(--shadow-rest)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F5F7] text-[#6E6E73]">
            <ShoppingBag className="h-7 w-7" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#1D1D1F]">
            No Checkout Reference Found
          </h1>
          <p className="text-xs leading-relaxed text-[#6E6E73]">
            We could not find an active order verification reference in this
            link. Start a new order from our Wuye Boutique or view your existing
            orders below.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/shop/clothes"
              className="inline-flex items-center gap-2 rounded-full bg-[#1D1D1F] px-6 py-3 text-xs font-semibold text-white"
            >
              <span>Shop Wuye Boutique</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/account/orders"
              className="rounded-full border border-black/[0.1] bg-[#F5F5F7] px-6 py-3 text-xs font-semibold text-[#1D1D1F]"
            >
              View Orders &amp; Returns
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalKobo = parseSafeKobo(params.totalKobo);
  const subtotalKobo = parseSafeKobo(params.subtotalKobo);
  const deliveryKobo = parseSafeKobo(params.deliveryKobo);
  const fulfillment = params.fulfillment ?? 'WUYE_IN_STORE_PICKUP';
  const method = params.method ?? '';
  const customerName = params.customer?.trim() ?? '';
  const itemsCount = parseSafeKobo(params.items);

  const isBankTransfer =
    method === 'BANK_TRANSFER' || reference.startsWith('MANUAL_');
  const isSandbox =
    method === 'SANDBOX' ||
    method === 'PAYSTACK_SANDBOX' ||
    method === 'FLUTTERWAVE_SANDBOX' ||
    reference.includes('SANDBOX');

  const totalFormatted = formatKoboToNaira(totalKobo);
  const fulfillmentLabel = getFulfillmentText(fulfillment);

  const whatsappUrl = isBankTransfer
    ? buildWhatsAppUrl(
        `Hello LifestyleNG Billing & Wuye Boutique Desk,\n\nI have placed a Manual / Bank Transfer order and would like payment instructions / confirmation:\n• Order No: ${orderNumber}\n• Reference: ${reference}${
          customerName ? `\n• Customer: ${customerName}` : ''
        }\n• Fulfillment: ${fulfillmentLabel}\n• Total Payable: ${totalFormatted}\n\nPlease confirm bank account details or Wuye POS pickup readiness.`
      )
    : WhatsAppTemplates.fashionOrderEnquiry({
        orderNumber: isSandbox ? `${orderNumber} [Sandbox Test]` : orderNumber,
        fulfillment: fulfillmentLabel,
        totalFormatted,
      });

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <CheckoutVerifyEffects shouldClearCart={hasValidOrder} />

      <div className="rounded-[28px] border border-black/[0.08] bg-white p-8 text-center space-y-5 shadow-[var(--shadow-rest)]">
        <div
          className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
            isSandbox
              ? 'bg-[#FFFBEB] text-[#B45309]'
              : 'bg-[#ECFDF5] text-[#10B981]'
          }`}
        >
          {isSandbox ? (
            <FlaskConical className="h-7 w-7" />
          ) : (
            <CheckCircle2 className="h-8 w-8" />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-block rounded-full bg-[#F5F5F7] px-3.5 py-1 text-xs font-semibold text-[#1D1D1F]">
            Reference: {reference}
          </span>
          {isBankTransfer ? (
            <span className="inline-block rounded-full bg-[#ECFDF5] px-3.5 py-1 text-xs font-semibold text-[#047857]">
              Bank Transfer / Wuye POS
            </span>
          ) : null}
          {isSandbox ? (
            <span className="inline-block rounded-full bg-[#FFFBEB] px-3.5 py-1 text-xs font-semibold text-[#B45309] border border-amber-200">
              Sandbox Test Mode • No Real Charge
            </span>
          ) : null}
        </div>

        <h1 className="font-display text-2xl font-bold text-[#1D1D1F] sm:text-3xl">
          {isBankTransfer
            ? `Order ${orderNumber} Placed`
            : isSandbox
              ? `Sandbox Order ${orderNumber} Verified`
              : `Order ${orderNumber} Confirmed`}
        </h1>

        <p className="text-xs leading-relaxed text-[#6E6E73]">
          {customerName ? (
            <>
              Thank you, <strong className="text-[#1D1D1F]">{customerName}</strong>.{' '}
            </>
          ) : null}
          {isBankTransfer ? (
            <>
              Total Payable:{' '}
              <strong className="text-[#1D1D1F] tabular-nums">
                {totalFormatted}
              </strong>
              . Your items are reserved and your shopping bag has been cleared.
            </>
          ) : isSandbox ? (
            <>
              Simulated Total:{' '}
              <strong className="text-[#1D1D1F] tabular-nums">
                {totalFormatted}
              </strong>
              . This pre-launch test transaction succeeded without live payment
              billing, and your shopping bag has been cleared.
            </>
          ) : (
            <>
              Total Settled:{' '}
              <strong className="text-[#1D1D1F] tabular-nums">
                {totalFormatted}
              </strong>
              . Your inventory reservation has been committed and your bag has
              been cleared.
            </>
          )}
        </p>

        {/* Order Amount Breakdown */}
        <div className="rounded-[16px] border border-black/[0.06] bg-[#FAFAFC] p-4 text-left text-xs space-y-1.5">
          <div className="flex justify-between text-[#6E6E73]">
            <span>Fulfillment Method</span>
            <span className="font-semibold text-[#1D1D1F] text-right">
              {fulfillmentLabel}
            </span>
          </div>
          {itemsCount > 0 ? (
            <div className="flex justify-between text-[#6E6E73]">
              <span>Reserved Quantity</span>
              <span className="font-semibold text-[#1D1D1F] tabular-nums">
                {itemsCount} item(s)
              </span>
            </div>
          ) : null}
          {subtotalKobo > 0 ? (
            <div className="flex justify-between text-[#6E6E73]">
              <span>Subtotal</span>
              <span className="font-semibold text-[#1D1D1F] tabular-nums">
                {formatKoboToNaira(subtotalKobo)}
              </span>
            </div>
          ) : null}
          <div className="flex justify-between text-[#6E6E73]">
            <span>Delivery Fee</span>
            <span className="font-semibold text-[#1D1D1F] tabular-nums">
              {deliveryKobo === 0 ? '₦0 (Free Pickup)' : formatKoboToNaira(deliveryKobo)}
            </span>
          </div>
          <div className="flex justify-between border-t border-black/[0.06] pt-2 font-bold text-[#1D1D1F]">
            <span>Total</span>
            <span className="tabular-nums">{totalFormatted}</span>
          </div>
        </div>

        {/* Bank Transfer / Wuye POS Payment Instructions */}
        {isBankTransfer ? (
          <div className="rounded-[16px] border border-[#008080]/25 bg-[#F5F5F7] p-4 text-left text-xs space-y-2">
            <p className="flex items-center gap-1.5 font-bold text-[#1D1D1F]">
              <Building2 className="h-4 w-4 text-[#008080]" />
              Lifestyle Corporate Networks Ltd. — Payment Instructions
            </p>
            <ul className="space-y-1 text-[#44474E] list-disc pl-4">
              <li>
                <strong>Option A — Direct Bank Transfer:</strong> Tap the green
                WhatsApp button below to receive the verified{' '}
                <strong>Lifestyle Corporate Networks Ltd.</strong> corporate
                account details and send your transfer receipt with narration{' '}
                <strong className="text-[#1D1D1F]">{orderNumber}</strong>.
              </li>
              <li>
                <strong>Option B — In-Store POS at Wuye Boutique:</strong> Pay
                by card or transfer directly at{' '}
                <strong>Suite 83 / Block B70, H&amp;A Plaza, Wuye, Abuja</strong>{' '}
                (Mon–Sat, 9:00 AM – 7:00 PM).
              </li>
            </ul>
            <p className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-[#1D1D1F]">
              <Phone className="h-3.5 w-3.5 text-[#008080]" />
              Billing &amp; Order Desk: {OFFICIAL_DISPLAY_PHONES.PRIMARY}
            </p>
          </div>
        ) : null}

        {fulfillment === 'WUYE_IN_STORE_PICKUP' ? (
          <div className="rounded-[16px] bg-[#F5F5F7] p-4 text-left text-xs space-y-1">
            <p className="flex items-center gap-1.5 font-bold text-[#1D1D1F]">
              <MapPin className="h-4 w-4 text-[#008080]" />
              Click-and-Collect Pickup Location:
            </p>
            <p className="text-[#6E6E73]">
              <strong>Lifestyle Boutique (Fashion)</strong> — Suite 83 / Block
              B70, H&amp;A Plaza, Wuye, Abuja.
            </p>
            <p className="text-[#B45309] font-medium pt-1">
              Note: Your 24-hour return eligibility window begins once your
              order is marked Picked Up or Delivered.
            </p>
          </div>
        ) : null}

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3 text-xs font-semibold text-white transition hover:bg-[#059669]"
          >
            <MessageCircle className="h-4 w-4" />
            {isBankTransfer
              ? 'Confirm Transfer / Order on WhatsApp'
              : 'Send Receipt to Wuye Desk on WhatsApp'}
          </a>
          <Link
            href="/account/orders"
            className="rounded-full bg-[#1D1D1F] px-6 py-3 text-xs font-semibold text-white transition hover:bg-black/85"
          >
            View Order &amp; 24h Return Portal
          </Link>
          <Link
            href="/shop/clothes"
            className="rounded-full border border-black/[0.1] bg-[#F5F5F7] px-5 py-3 text-xs font-semibold text-[#1D1D1F] transition hover:bg-[#E8E8ED]"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
