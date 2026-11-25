'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  MessageCircle,
  MapPin,
  Truck,
  Trash2,
} from 'lucide-react';
import { useCart } from './cart-context';
import { PriceDisplay, formatKoboToNaira } from './price-display';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

export function SlideOverCart() {
  const {
    items,
    isOpen,
    closeCart,
    fulfillmentType,
    setFulfillmentType,
    subtotalKobo,
    deliveryFeeKobo,
    totalAmountKobo,
    updateQuantity,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeCart();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const isWuyePickup =
    fulfillmentType === 'WUYE_IN_STORE_PICKUP' ||
    fulfillmentType === 'POS_WALK_IN';

  const fulfillmentLabel = isWuyePickup
    ? 'In-Store Pickup at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja (₦0 Free)'
    : fulfillmentType === 'INTER_STATE_DELIVERY'
      ? 'Inter-State Courier Delivery (36 States)'
      : 'Abuja Doorstep Delivery';

  const whatsappCheckoutUrl = buildWhatsAppUrl(
    `Hello LifestyleNG Concierge,\n\nI would like to complete my bag order:\n${items
      .map(
        (i) =>
          `• ${i.quantity}x ${i.title} (${i.variantTitle}) — ${formatKoboToNaira(
            i.unitPriceKobo * i.quantity
          )}`
      )
      .join('\n')}\n\nFulfillment: ${fulfillmentLabel}\nTotal: ${formatKoboToNaira(
      totalAmountKobo
    )}`
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 flex justify-end"
    >
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />
      <aside
        aria-label="Shopping Bag"
        className="relative z-10 flex h-full w-full max-w-[440px] flex-col justify-between border-l border-black/[0.08] bg-white/95 p-6 backdrop-blur-2xl shadow-[var(--shadow-modal)]"
      >
        {/* Top Header + Omnichannel Fulfillment Switcher */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="h-5 w-5 text-[#1D1D1F]" />
              <h2 className="font-display text-lg font-bold text-[#1D1D1F]">
                Your LifestyleNG Bag
              </h2>
            </div>
            <div className="flex items-center gap-1">
              {items.length > 0 ? (
                <button
                  type="button"
                  onClick={clearCart}
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-medium text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#DC2626]"
                  aria-label="Clear shopping bag"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={closeCart}
                className="rounded-full p-2 text-[#6E6E73] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]"
                aria-label="Close bag"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Omnichannel Fulfillment Segmented Switcher */}
          <div className="rounded-[16px] bg-[#F5F5F7] p-1.5">
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#6E6E73]">
              Omnichannel Fulfillment Mode
            </p>
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                aria-pressed={isWuyePickup}
                onClick={() => setFulfillmentType('WUYE_IN_STORE_PICKUP')}
                className={`flex flex-col items-start rounded-[12px] p-2.5 text-left transition-all ${
                  isWuyePickup
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <MapPin className="h-3.5 w-3.5 text-[#008080]" />
                  Wuye Pickup (₦0)
                </span>
                <span className="mt-0.5 text-[11px] text-[#86868B]">
                  Suite 83 / Block B70, H&amp;A Plaza
                </span>
              </button>
              <button
                type="button"
                aria-pressed={!isWuyePickup}
                onClick={() => setFulfillmentType('ABUJA_DOORSTEP_DELIVERY')}
                className={`flex flex-col items-start rounded-[12px] p-2.5 text-left transition-all ${
                  !isWuyePickup
                    ? 'bg-white text-[#1D1D1F] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                <span className="flex items-center gap-1.5 text-xs font-semibold">
                  <Truck className="h-3.5 w-3.5 text-[#0B2545]" />
                  {fulfillmentType === 'INTER_STATE_DELIVERY'
                    ? 'Inter-State Courier'
                    : 'Doorstep Delivery'}
                </span>
                <span className="mt-0.5 text-[11px] text-[#86868B]">
                  Abuja &amp; Inter-State
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Cart Items or Empty State */}
        <div className="my-4 flex-1 overflow-y-auto pr-1">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F5F5F7]">
                <ShoppingBag className="h-7 w-7 text-[#86868B]" />
              </div>
              <p className="font-display text-base font-semibold text-[#1D1D1F]">
                Your LifestyleNG bag is empty
              </p>
              <p className="mt-1 max-w-xs text-xs text-[#6E6E73]">
                Explore our four corporate divisions across Abuja fashion,
                connectivity, luxury stays, and executive mobility.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-2">
                <Link
                  href="/shop/clothes"
                  onClick={closeCart}
                  className="rounded-full bg-[#F5F5F7] px-3.5 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#E8E8ED]"
                >
                  Shop Wuye Boutique
                </Link>
                <Link
                  href="/mtn-services/fibrex"
                  onClick={closeCart}
                  className="rounded-full bg-[#F5F5F7] px-3.5 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#E8E8ED]"
                >
                  Explore MTN FibreX
                </Link>
                <Link
                  href="/stays"
                  onClick={closeCart}
                  className="rounded-full bg-[#F5F5F7] px-3.5 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#E8E8ED]"
                >
                  View Kaura 4-Bed Shortlet
                </Link>
                <Link
                  href="/car-hire"
                  onClick={closeCart}
                  className="rounded-full bg-[#F5F5F7] px-3.5 py-2 text-xs font-medium text-[#1D1D1F] hover:bg-[#E8E8ED]"
                >
                  Book Abuja Car Hire
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => {
                const atMaxStock = item.quantity >= item.availableStock;
                return (
                  <li
                    key={item.variantId}
                    className="flex items-center justify-between gap-3 rounded-[16px] border border-black/[0.06] bg-white p-3.5"
                  >
                    {item.imageUrl ? (
                      <div className="h-14 w-12 shrink-0 overflow-hidden rounded-[10px] bg-[#F5F5F7]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#1D1D1F]">
                        {item.title}
                      </p>
                      <p className="truncate text-xs text-[#6E6E73]">
                        {item.variantTitle} • SKU: {item.sku}
                      </p>
                      <div className="mt-1.5">
                        <PriceDisplay
                          amountKobo={item.unitPriceKobo * item.quantity}
                          size="sm"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-[#F5F5F7] px-2 py-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity - 1)
                        }
                        className="rounded-full p-1 text-[#1D1D1F] hover:bg-white"
                        aria-label={`Decrease quantity of ${item.title}`}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={atMaxStock}
                        onClick={() =>
                          updateQuantity(item.variantId, item.quantity + 1)
                        }
                        className="rounded-full p-1 text-[#1D1D1F] hover:bg-white disabled:opacity-35 disabled:cursor-not-allowed"
                        aria-label={
                          atMaxStock
                            ? `Maximum stock (${item.availableStock}) reached for ${item.title}`
                            : `Increase quantity of ${item.title}`
                        }
                        title={
                          atMaxStock
                            ? `Only ${item.availableStock} available`
                            : 'Increase quantity'
                        }
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer Ledger + Mandatory 24-Hour Return Policy Callout */}
        <div className="space-y-3 border-t border-black/[0.08] pt-4">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-[#6E6E73]">
              <span>Subtotal</span>
              <PriceDisplay amountKobo={subtotalKobo} size="sm" />
            </div>
            <div className="flex justify-between text-[#6E6E73]">
              <span>
                {isWuyePickup
                  ? 'Wuye Boutique Pickup (Suite 83, H&A Plaza)'
                  : fulfillmentType === 'INTER_STATE_DELIVERY'
                    ? 'Inter-State Courier Delivery'
                    : 'Abuja Doorstep Delivery'}
              </span>
              <span className="font-semibold text-[#1D1D1F] tabular-nums">
                {deliveryFeeKobo === 0
                  ? '₦0 (Free Pickup)'
                  : formatKoboToNaira(deliveryFeeKobo)}
              </span>
            </div>
            <div className="flex justify-between border-t border-black/[0.06] pt-2 text-base font-bold text-[#1D1D1F]">
              <span>Total</span>
              <PriceDisplay amountKobo={totalAmountKobo} size="md" />
            </div>
          </div>

          <div className="rounded-[12px] bg-[#F5F5F7] p-3 text-xs text-[#6E6E73]">
            Returns are accepted within <strong>24 hours of receipt</strong> in
            original unworn/unopened condition.
          </div>

          {items.length > 0 ? (
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="flex w-full items-center justify-center rounded-full bg-[#1D1D1F] py-3.5 text-sm font-semibold text-white transition hover:bg-black/85"
              >
                Proceed to Secure Checkout
              </Link>
              <a
                href={whatsappCheckoutUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ECFDF5] py-3 text-sm font-semibold text-[#047857] transition hover:bg-[#D1FAE5]"
              >
                <MessageCircle className="h-4 w-4" />
                Checkout via WhatsApp Concierge
              </a>
            </div>
          ) : (
            <Link
              href="/shop/clothes"
              onClick={closeCart}
              className="flex w-full items-center justify-center rounded-full bg-[#1D1D1F] py-3.5 text-sm font-semibold text-white transition hover:bg-black/85"
            >
              Browse Wuye Boutique Collection
            </Link>
          )}
        </div>
      </aside>
    </div>
  );
}
