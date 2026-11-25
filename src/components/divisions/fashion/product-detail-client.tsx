'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, MapPin, ShieldAlert, MessageCircle } from 'lucide-react';
import type { ProductCatalogItem, ProductVariantView } from '@/types';
import {
  PriceDisplay,
  formatKoboToNaira,
} from '@/components/commerce/price-display';
import { VariantSelector } from '@/components/commerce/variant-selector';
import { useCart } from '@/components/commerce/cart-context';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

function getInitialVariant(product: ProductCatalogItem): ProductVariantView {
  return (
    product.variants.find((v) => v.availableStock > 0) ??
    product.variants[0] ?? {
      id: product.id,
      productId: product.id,
      sku: product.slug,
      title: 'Standard',
      priceKobo: product.basePriceKobo,
      availableStock: 0,
      wuyeFloorStock: 0,
    }
  );
}

export function ProductDetailClient({
  product,
}: {
  product: ProductCatalogItem;
}) {
  const { addItem, setFulfillmentType } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantView>(
    () => getInitialVariant(product)
  );
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Re-sync selected variant if CMS live-sync refreshes product stock/prices
  useEffect(() => {
    setSelectedVariant((prev) => {
      const updated = product.variants.find((v) => v.id === prev.id);
      return updated ?? getInitialVariant(product);
    });
  }, [product]);

  const galleryImages =
    product.images.length > 0 ? product.images : [''];
  const activeImage = galleryImages[activeImageIdx] ?? galleryImages[0] ?? '';
  const isOutOfStock = selectedVariant.availableStock <= 0;

  const whatsappReserveUrl = buildWhatsAppUrl(
    `Hello Lifestyle Boutique (Suite 83 / Block B70, H&A Plaza, Wuye, Abuja),\n\nI would like to reserve/enquire about:\n• Product: ${
      product.title
    }\n• Variant: ${selectedVariant.title} (SKU: ${
      selectedVariant.sku
    })\n• Price: ${formatKoboToNaira(selectedVariant.priceKobo)}`
  );

  function addSelectedVariantToBag() {
    if (isOutOfStock) return;
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      variantTitle: selectedVariant.title,
      sku: selectedVariant.sku,
      division: product.division,
      unitPriceKobo: selectedVariant.priceKobo,
      availableStock: selectedVariant.availableStock,
      imageUrl: product.images[0] ?? '',
    });
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      {/* Left Image Gallery */}
      <div className="lg:col-span-6 space-y-3">
        <div className="aspect-[4/5] overflow-hidden rounded-[24px] border border-black/[0.06] bg-white p-3 shadow-[var(--shadow-rest)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeImage}
            alt={product.title}
            className="h-full w-full rounded-[18px] object-cover"
          />
        </div>

        {galleryImages.length > 1 ? (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                aria-label={`View image ${idx + 1} of ${product.title}`}
                aria-pressed={activeImageIdx === idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`h-20 w-16 shrink-0 overflow-hidden rounded-[12px] border bg-white p-1 transition ${
                  activeImageIdx === idx
                    ? 'border-[#1D1D1F] ring-2 ring-[#1D1D1F]/15'
                    : 'border-black/[0.08] opacity-75 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imgUrl}
                  alt={`${product.title} preview ${idx + 1}`}
                  className="h-full w-full rounded-[8px] object-cover"
                />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Right Buy Box */}
      <div className="lg:col-span-6 space-y-6">
        <div className="space-y-2 border-b border-black/[0.06] pb-5">
          <span className="inline-flex items-center rounded-full bg-[#F5F5F7] px-3 py-1 text-xs font-semibold text-[#0B2545]">
            {product.subPillar} • SKU: {selectedVariant.sku}
          </span>
          <h1 className="font-display text-2xl font-bold text-[#1D1D1F] sm:text-3xl">
            {product.title}
          </h1>
          {product.subtitle ? (
            <p className="text-xs font-medium text-[#6E6E73]">
              {product.subtitle}
            </p>
          ) : null}
          <div className="pt-2">
            <PriceDisplay
              amountKobo={selectedVariant.priceKobo}
              compareAtKobo={selectedVariant.compareAtPriceKobo}
              size="hero"
            />
          </div>
        </div>

        <p className="text-sm leading-relaxed text-[#6E6E73]">
          {product.description}
        </p>

        <VariantSelector
          productTitle={product.title}
          variants={product.variants}
          selectedVariantId={selectedVariant.id}
          onSelect={setSelectedVariant}
        />

        {/* Omnichannel Actions */}
        <div className="space-y-3 pt-2">
          <button
            type="button"
            disabled={isOutOfStock}
            onClick={addSelectedVariantToBag}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#1D1D1F] py-4 text-sm font-semibold text-white transition hover:bg-black/85 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
          >
            <ShoppingBag className="h-4 w-4" />
            {isOutOfStock
              ? 'Currently Out of Stock'
              : `Add to Bag — ${formatKoboToNaira(selectedVariant.priceKobo)}`}
          </button>

          {product.isWuyePickupEligible ? (
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => {
                setFulfillmentType('WUYE_IN_STORE_PICKUP');
                addSelectedVariantToBag();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-black/[0.12] bg-white py-3.5 text-xs font-semibold text-[#1D1D1F] transition hover:bg-[#F5F5F7] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <MapPin className="h-4 w-4 text-[#008080]" />
              Click &amp; Collect at Suite 83, H&amp;A Plaza, Wuye (₦0 Free
              Pickup)
            </button>
          ) : null}

          <a
            href={whatsappReserveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#ECFDF5] py-3.5 text-xs font-semibold text-[#047857] transition hover:bg-[#D1FAE5]"
          >
            <MessageCircle className="h-4 w-4" />
            {isOutOfStock
              ? 'Request Restock Alert via WhatsApp'
              : 'Reserve for In-Store Fitting via WhatsApp'}
          </a>
        </div>

        {/* Strict 24-Hour Return Policy Notice */}
        <div className="rounded-[16px] border border-black/[0.06] bg-white p-4 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-semibold text-[#1D1D1F]">
            <ShieldAlert className="h-4 w-4 text-[#B45309]" />
            <span>Mandatory 24-Hour Return &amp; Exchange Policy</span>
          </div>
          <p className="text-[#6E6E73] leading-relaxed">
            Per Lifestyle Boutique corporate policy, returns or size exchanges
            must be initiated within{' '}
            <strong className="text-[#1D1D1F]">24 hours of receipt</strong>{' '}
            (delivery handover or Wuye in-store pickup) in unworn condition with
            original tags intact.
          </p>
        </div>
      </div>
    </div>
  );
}
