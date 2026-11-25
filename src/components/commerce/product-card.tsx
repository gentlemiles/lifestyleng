'use client';

import Link from 'next/link';
import type { ProductCatalogItem } from '@/types';
import { PriceDisplay } from './price-display';
import { useCart } from './cart-context';

interface ProductCardProps {
  product: ProductCatalogItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const primaryVariant =
    product.variants.find((v) => v.availableStock > 0) ?? product.variants[0];
  const isOutOfStock = !primaryVariant || primaryVariant.availableStock <= 0;
  const isFashion = product.division === 'FASHION_BOUTIQUE';
  const detailHref = isFashion
    ? `/shop/clothes/${product.slug}`
    : `/mtn-services/fibrex?sku=${encodeURIComponent(product.slug)}`;

  const uniqueColors = Array.from(
    new Map(
      product.variants
        .filter((v) => v.colorHex)
        .map((v) => [v.colorHex, v.colorName ?? v.colorHex])
    ).entries()
  ).slice(0, 4);

  function handleAddToBag() {
    if (!primaryVariant || primaryVariant.availableStock <= 0) return;
    addItem({
      variantId: primaryVariant.id,
      productId: product.id,
      slug: product.slug,
      title: product.title,
      variantTitle: primaryVariant.title,
      sku: primaryVariant.sku,
      division: product.division,
      unitPriceKobo: primaryVariant.priceKobo,
      availableStock: primaryVariant.availableStock,
      imageUrl: product.images[0] ?? '',
    });
  }

  return (
    <article className="group flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-4 transition-shadow hover:shadow-md">
      <div>
        <Link
          href={detailHref}
          className={`relative block w-full overflow-hidden rounded-xl bg-[#F5F5F7] ${
            isFashion ? 'aspect-[4/5]' : 'aspect-square'
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0] ?? ''}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {isOutOfStock ? (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-neutral-900/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-xs">
              Out of Stock
            </span>
          ) : product.isWuyePickupEligible ? (
            <span className="absolute top-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-medium text-[#1B1B1D] shadow-xs">
              {isFashion ? 'Wuye Pickup' : 'MTN Warranty'}
            </span>
          ) : null}
        </Link>

        <div className="mt-3.5 space-y-1">
          {uniqueColors.length > 0 ? (
            <div className="flex items-center gap-1.5 pb-0.5">
              {uniqueColors.map(([hex, name]) => (
                <span
                  key={hex}
                  title={name ?? ''}
                  className="h-3 w-3 rounded-full border border-black/15"
                  style={{ backgroundColor: hex ?? '#1B1B1D' }}
                />
              ))}
            </div>
          ) : null}

          <Link href={detailHref} className="block">
            <h3 className="line-clamp-2 font-display text-base font-semibold text-[#1B1B1D] group-hover:text-[#0B2545]">
              {product.title}
            </h3>
          </Link>

          <PriceDisplay
            amountKobo={primaryVariant?.priceKobo ?? product.basePriceKobo}
            compareAtKobo={
              primaryVariant?.compareAtPriceKobo ?? product.compareAtPriceKobo
            }
            size="md"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToBag}
          className="rounded-full bg-[#001026] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0B2545] disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-600"
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
        </button>
        <Link
          href={detailHref}
          className="flex items-center justify-center rounded-full border border-black/[0.1] bg-[#F5F5F7] px-3 py-2 text-xs font-medium text-[#1B1B1D] transition hover:bg-[#EAE7EA]"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}
