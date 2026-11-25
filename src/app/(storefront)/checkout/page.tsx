'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  MapPin,
  Truck,
  Lock,
  ShoppingBag,
  Building2,
  FlaskConical,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useCart } from '@/components/commerce/cart-context';
import {
  PriceDisplay,
  formatKoboToNaira,
} from '@/components/commerce/price-display';
import { initializeCheckoutAction } from '@/server/actions';
import type { CheckoutPaymentProvider } from '@/lib/validations/contracts';
import { OFFICIAL_DISPLAY_PHONES, buildWhatsAppUrl } from '@/lib/whatsapp';

const FULFILLMENT_LABELS = {
  WUYE_IN_STORE_PICKUP: 'Wuye Store Pickup (Free)',
  ABUJA_DOORSTEP_DELIVERY: 'Abuja Doorstep Delivery',
  INTER_STATE_DELIVERY: 'Inter-State Courier',
  POS_WALK_IN: 'Wuye Store Pickup (Free)',
} as const;

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    isHydrated,
    fulfillmentType,
    setFulfillmentType,
    subtotalKobo,
    deliveryFeeKobo,
    totalAmountKobo,
  } = useCart();

  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [districtOrCity, setDistrictOrCity] = useState('Wuse II, Abuja');
  const [state, setState] = useState('FCT - Abuja');
  const [sandboxMode, setSandboxMode] = useState(false);
  const [paymentProvider, setPaymentProvider] =
    useState<CheckoutPaymentProvider>('BANK_TRANSFER');
  const [returnPolicyAcknowledged, setReturnPolicyAcknowledged] =
    useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedFulfillment =
    fulfillmentType === 'POS_WALK_IN'
      ? 'WUYE_IN_STORE_PICKUP'
      : fulfillmentType;

  function handleToggleSandboxMode() {
    setErrorMsg(null);
    setSandboxMode((prev) => {
      const next = !prev;
      if (next) {
        if (paymentProvider === 'BANK_TRANSFER') {
          setPaymentProvider('SANDBOX');
        }
      } else {
        setPaymentProvider('BANK_TRANSFER');
      }
      return next;
    });
  }

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);

    if (items.length === 0) {
      setErrorMsg(
        'Your shopping bag is empty. Please add an item before checking out.'
      );
      return;
    }

    if (!returnPolicyAcknowledged) {
      setErrorMsg(
        'Please acknowledge the mandatory 24-hour return policy from receipt before placing your order.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const effectiveProvider: CheckoutPaymentProvider = sandboxMode
        ? paymentProvider === 'BANK_TRANSFER'
          ? 'SANDBOX'
          : paymentProvider
        : 'BANK_TRANSFER';

      const response = await initializeCheckoutAction(
        {
          customerName,
          customerEmail,
          customerPhone,
          fulfillmentType: normalizedFulfillment,
          shippingAddress:
            normalizedFulfillment === 'WUYE_IN_STORE_PICKUP'
              ? undefined
              : {
                  streetAddress,
                  districtOrCity,
                  state,
                },
          paymentProvider: effectiveProvider,
          sandboxMode,
          returnPolicyAcknowledged: true,
        },
        items.map((i) => ({ variantId: i.variantId, quantity: i.quantity }))
      );

      if (response.error) {
        setErrorMsg(response.error.message);
        return;
      }

      router.push(response.data.authorizationUrl);
    } catch {
      setErrorMsg(
        'Unable to initialize checkout right now. Please try again or complete your order via WhatsApp Concierge.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 space-y-6">
        <div className="h-8 w-64 animate-pulse rounded-full bg-[#E8E8ED]/80" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 space-y-6">
            <div className="h-44 animate-pulse rounded-[24px] bg-[#E8E8ED]/70" />
            <div className="h-64 animate-pulse rounded-[24px] bg-[#E8E8ED]/70" />
          </div>
          <div className="lg:col-span-5">
            <div className="h-96 animate-pulse rounded-[24px] bg-[#E8E8ED]/70" />
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="rounded-[28px] border border-black/[0.08] bg-white p-8 sm:p-10 text-center space-y-5 shadow-[var(--shadow-rest)]">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F7]">
            <ShoppingBag className="h-7 w-7 text-[#6E6E73]" />
          </div>
          <div className="space-y-2">
            <span className="inline-block rounded-full bg-[#F5F5F7] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#008080]">
              Checkout Bag Empty
            </span>
            <h1 className="font-display text-2xl font-bold text-[#1D1D1F] sm:text-3xl">
              Your LifestyleNG bag is empty
            </h1>
            <p className="mx-auto max-w-md text-xs leading-relaxed text-[#6E6E73]">
              Add clothing, footwear, bags, accessories, or MTN 5G hardware to
              your bag before proceeding to checkout.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/shop/clothes"
              className="inline-flex items-center gap-2 rounded-full bg-[#1D1D1F] px-6 py-3 text-xs font-semibold text-white transition hover:bg-black/85"
            >
              <span>Shop Wuye Boutique Collection</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/mtn-services/fibrex"
              className="rounded-full border border-black/[0.1] bg-[#F5F5F7] px-5 py-3 text-xs font-semibold text-[#1D1D1F] transition hover:bg-[#E8E8ED]"
            >
              Explore MTN Routers &amp; FibreX
            </Link>
            <Link
              href="/stays"
              className="rounded-full border border-black/[0.1] bg-white px-5 py-3 text-xs font-semibold text-[#1D1D1F] transition hover:bg-[#F5F5F7]"
            >
              View Kaura Shortlet
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const whatsappDirectUrl = buildWhatsAppUrl(
    `Hello LifestyleNG Concierge,\n\nI would like to place my order via WhatsApp / Bank Transfer:\n${items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.title} (${i.variantTitle}, SKU: ${i.sku}) — ${formatKoboToNaira(
            i.unitPriceKobo * i.quantity
          )}`
      )
      .join('\n')}\n\nFulfillment: ${
      FULFILLMENT_LABELS[normalizedFulfillment]
    }\nSubtotal: ${formatKoboToNaira(subtotalKobo)}\nDelivery: ${
      deliveryFeeKobo === 0 ? '₦0 (Free Pickup)' : formatKoboToNaira(deliveryFeeKobo)
    }\nTotal: ${formatKoboToNaira(totalAmountKobo)}${
      customerName.trim() ? `\nCustomer: ${customerName.trim()}` : ''
    }${customerPhone.trim() ? `\nPhone: ${customerPhone.trim()}` : ''}`
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#008080]">
          Zero-Trust Checkout • 15-Minute Inventory Reservation
        </span>
        <h1 className="font-display text-3xl font-bold text-[#1D1D1F]">
          Complete Your LifestyleNG Order
        </h1>
      </div>

      <form
        onSubmit={handleCheckout}
        className="grid grid-cols-1 gap-8 lg:grid-cols-12"
      >
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Fulfillment Mode Selection */}
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 space-y-4 shadow-[var(--shadow-rest)]">
            <h2 className="font-display text-base font-bold text-[#1D1D1F]">
              1. Choose Omnichannel Fulfillment
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                aria-pressed={normalizedFulfillment === 'WUYE_IN_STORE_PICKUP'}
                onClick={() => setFulfillmentType('WUYE_IN_STORE_PICKUP')}
                className={`flex flex-col items-start rounded-[16px] border p-3.5 text-left transition ${
                  normalizedFulfillment === 'WUYE_IN_STORE_PICKUP'
                    ? 'border-[#1D1D1F] bg-[#F5F5F7]'
                    : 'border-black/[0.08] hover:border-black/20'
                }`}
              >
                <MapPin className="h-4 w-4 text-[#008080]" />
                <span className="mt-1.5 text-xs font-bold text-[#1D1D1F]">
                  Wuye Store Pickup (₦0)
                </span>
                <span className="text-[11px] text-[#6E6E73]">
                  Suite 83 / Block B70, H&amp;A Plaza, Wuye
                </span>
              </button>

              <button
                type="button"
                aria-pressed={normalizedFulfillment === 'ABUJA_DOORSTEP_DELIVERY'}
                onClick={() => setFulfillmentType('ABUJA_DOORSTEP_DELIVERY')}
                className={`flex flex-col items-start rounded-[16px] border p-3.5 text-left transition ${
                  normalizedFulfillment === 'ABUJA_DOORSTEP_DELIVERY'
                    ? 'border-[#1D1D1F] bg-[#F5F5F7]'
                    : 'border-black/[0.08] hover:border-black/20'
                }`}
              >
                <Truck className="h-4 w-4 text-[#0B2545]" />
                <span className="mt-1.5 text-xs font-bold text-[#1D1D1F]">
                  Abuja Doorstep (₦3,500)
                </span>
                <span className="text-[11px] text-[#6E6E73]">
                  Same-day dispatch across Abuja
                </span>
              </button>

              <button
                type="button"
                aria-pressed={normalizedFulfillment === 'INTER_STATE_DELIVERY'}
                onClick={() => setFulfillmentType('INTER_STATE_DELIVERY')}
                className={`flex flex-col items-start rounded-[16px] border p-3.5 text-left transition ${
                  normalizedFulfillment === 'INTER_STATE_DELIVERY'
                    ? 'border-[#1D1D1F] bg-[#F5F5F7]'
                    : 'border-black/[0.08] hover:border-black/20'
                }`}
              >
                <Truck className="h-4 w-4 text-[#0B2545]" />
                <span className="mt-1.5 text-xs font-bold text-[#1D1D1F]">
                  Inter-State (₦8,500)
                </span>
                <span className="text-[11px] text-[#6E6E73]">
                  Nationwide courier across 36 states
                </span>
              </button>
            </div>
          </div>

          {/* 2. Customer Contact & Shipping */}
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 space-y-4 shadow-[var(--shadow-rest)]">
            <h2 className="font-display text-base font-bold text-[#1D1D1F]">
              2. Customer Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="checkout-name"
                  className="mb-1 block text-[11px] font-semibold text-[#6E6E73]"
                >
                  Full Name *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  placeholder="Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  autoComplete="name"
                  className="w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#1D1D1F]"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-email"
                  className="mb-1 block text-[11px] font-semibold text-[#6E6E73]"
                >
                  Email Address *
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#1D1D1F]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-phone"
                  className="mb-1 block text-[11px] font-semibold text-[#6E6E73]"
                >
                  Nigerian Phone / WhatsApp Number *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  placeholder="e.g. +2348064912969 or 08064912969"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  autoComplete="tel"
                  className="w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#1D1D1F]"
                />
              </div>

              {normalizedFulfillment !== 'WUYE_IN_STORE_PICKUP' ? (
                <>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="checkout-street"
                      className="mb-1 block text-[11px] font-semibold text-[#6E6E73]"
                    >
                      Delivery Street Address &amp; House No. *
                    </label>
                    <input
                      id="checkout-street"
                      type="text"
                      placeholder="House number, street name, estate or landmark"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      required
                      autoComplete="street-address"
                      className="w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#1D1D1F]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-district"
                      className="mb-1 block text-[11px] font-semibold text-[#6E6E73]"
                    >
                      District / City *
                    </label>
                    <input
                      id="checkout-district"
                      type="text"
                      placeholder="District / City"
                      value={districtOrCity}
                      onChange={(e) => setDistrictOrCity(e.target.value)}
                      required
                      className="w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#1D1D1F]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="checkout-state"
                      className="mb-1 block text-[11px] font-semibold text-[#6E6E73]"
                    >
                      State *
                    </label>
                    <input
                      id="checkout-state"
                      type="text"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs text-[#1D1D1F]"
                    />
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 rounded-[12px] bg-[#F5F5F7] p-3.5 text-xs text-[#1D1D1F]">
                  <strong>Wuye Pickup Location:</strong> Suite 83 / Block B70,
                  H&amp;A Plaza, Wuye, Abuja (Mon–Sat, 9:00 AM – 7:00 PM). Bring
                  your order number upon collection.
                </div>
              )}
            </div>
          </div>

          {/* 3. Payment Method & Sandbox Toggle */}
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 space-y-4 shadow-[var(--shadow-rest)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-bold text-[#1D1D1F]">
                  3. Payment Option
                </h2>
                <p className="text-[11px] text-[#6E6E73]">
                  Place a confirmed manual order via Bank Transfer / Wuye POS,
                  or enable Sandbox Mode for pre-launch testing.
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={sandboxMode}
                onClick={handleToggleSandboxMode}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold transition ${
                  sandboxMode
                    ? 'border-[#0B2545] bg-[#0B2545] text-white'
                    : 'border-black/[0.12] bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED]'
                }`}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                <span>
                  Sandbox / Test Mode: {sandboxMode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {!sandboxMode ? (
              <div className="rounded-[16px] border border-[#008080]/25 bg-[#FAFAFC] p-4 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#1D1D1F]">
                    <Building2 className="h-4 w-4 text-[#008080]" />
                    Bank Transfer / Manual Order &amp; Wuye POS
                  </span>
                  <span className="rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[10px] font-semibold text-[#047857]">
                    Active
                  </span>
                </div>
                <p className="leading-relaxed text-[#6E6E73]">
                  Submit your order now to lock your stock reservation and
                  generate an official{' '}
                  <strong className="text-[#1D1D1F]">
                    Lifestyle Corporate Networks Ltd.
                  </strong>{' '}
                  order reference. Settle via direct bank transfer or pay via
                  in-store POS upon collection at{' '}
                  <strong className="text-[#1D1D1F]">
                    Suite 83 / Block B70, H&amp;A Plaza, Wuye, Abuja
                  </strong>
                  , then confirm your payment receipt with our WhatsApp desk (
                  {OFFICIAL_DISPLAY_PHONES.PRIMARY}).
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-[#047857]">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Zero gateway downtime • Instant order reference &amp;
                    WhatsApp receipt handoff
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 rounded-[16px] border border-amber-300/70 bg-[#FFFBEB] p-4 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#92400E]">
                    <FlaskConical className="h-4 w-4" />
                    Pre-Launch Sandbox / Test Payment Mode
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold text-[#B45309] border border-amber-200">
                    No Real Charge
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-[#92400E]">
                  Live Paystack and Flutterwave keys are currently unconfigured.
                  Choose a simulated provider below to test the complete order
                  verification and cart-clearing flow with zero errors.
                </p>

                <div
                  role="radiogroup"
                  aria-label="Sandbox payment provider"
                  className="grid grid-cols-1 gap-2 sm:grid-cols-3 pt-1"
                >
                  {(
                    [
                      ['SANDBOX', 'Instant Test Pay'],
                      ['PAYSTACK', 'Paystack (Sandbox)'],
                      ['FLUTTERWAVE', 'Flutterwave (Sandbox)'],
                    ] as const
                  ).map(([providerId, label]) => {
                    const isSelected = paymentProvider === providerId;
                    return (
                      <button
                        key={providerId}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setPaymentProvider(providerId)}
                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                          isSelected
                            ? 'bg-[#1D1D1F] text-white'
                            : 'border border-amber-200 bg-white text-[#1D1D1F] hover:bg-amber-50'
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4. Mandatory 24-Hour Return Policy Acknowledgment */}
          <div className="rounded-[24px] border border-black/[0.06] bg-white p-6 space-y-4 shadow-[var(--shadow-rest)]">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={returnPolicyAcknowledged}
                onChange={(e) => setReturnPolicyAcknowledged(e.target.checked)}
                required
                className="mt-1 h-4 w-4 rounded accent-[#1D1D1F]"
              />
              <span className="text-xs leading-relaxed text-[#1D1D1F]">
                <strong>Mandatory 24-Hour Return Policy Acknowledgment:</strong>{' '}
                I understand that returns and exchanges are strictly accepted
                within <strong>24 hours of receipt</strong> (delivery or Wuye
                in-store pickup) in original unworn/unopened condition with tags
                attached.
              </span>
            </label>
          </div>
        </div>

        {/* Right Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-24 rounded-[24px] border border-black/[0.08] bg-white p-6 space-y-5 shadow-[var(--shadow-rest)]">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-[#1D1D1F]">
                Order Summary (NGN)
              </h2>
              <span className="rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[11px] font-semibold text-[#6E6E73]">
                {items.reduce((acc, i) => acc + i.quantity, 0)} item(s)
              </span>
            </div>

            <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex items-center justify-between gap-3 rounded-[14px] border border-black/[0.05] bg-[#FAFAFC] p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {item.imageUrl ? (
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[#F5F5F7]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-[#1D1D1F]">
                        {item.title}
                      </p>
                      <p className="truncate text-[11px] text-[#6E6E73]">
                        {item.variantTitle} • Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <PriceDisplay
                    amountKobo={item.unitPriceKobo * item.quantity}
                    size="sm"
                  />
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-y border-black/[0.06] py-4 text-xs">
              <div className="flex justify-between text-[#6E6E73]">
                <span>Bag Subtotal</span>
                <PriceDisplay amountKobo={subtotalKobo} size="sm" />
              </div>
              <div className="flex justify-between text-[#6E6E73]">
                <span>{FULFILLMENT_LABELS[normalizedFulfillment]}</span>
                <span className="font-semibold text-[#1D1D1F] tabular-nums">
                  {deliveryFeeKobo === 0
                    ? '₦0 (Free Wuye Pickup)'
                    : formatKoboToNaira(deliveryFeeKobo)}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/[0.06] pt-3 text-base font-bold text-[#1D1D1F]">
                <span>Total Payable</span>
                <PriceDisplay amountKobo={totalAmountKobo} size="md" />
              </div>
            </div>

            {errorMsg ? (
              <div
                role="alert"
                className="rounded-[12px] border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-[#DC2626]"
              >
                {errorMsg}
              </div>
            ) : null}

            <div className="space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D1D1F] py-4 text-xs font-bold text-white transition hover:bg-black/85 disabled:opacity-50"
              >
                {sandboxMode ? (
                  <FlaskConical className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                {isSubmitting
                  ? 'Reserving Stock & Creating Order...'
                  : sandboxMode
                    ? `Complete Sandbox Test Order — ${formatKoboToNaira(totalAmountKobo)}`
                    : `Place Order (Bank Transfer / Wuye POS) — ${formatKoboToNaira(totalAmountKobo)}`}
              </button>

              <a
                href={whatsappDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ECFDF5] py-3.5 text-xs font-semibold text-[#047857] transition hover:bg-[#D1FAE5]"
              >
                <MessageCircle className="h-4 w-4" />
                Order &amp; Confirm Payment via WhatsApp
              </a>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#86868B]">
              <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" />
              Server-Verified Integer Kobo Pricing • Zero-Drift NGN Ledger
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
