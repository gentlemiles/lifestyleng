'use client';

import type { ProductVariantView } from '@/types';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

interface VariantSelectorProps {
  productTitle: string;
  variants: ReadonlyArray<ProductVariantView>;
  selectedVariantId: string;
  onSelect: (variant: ProductVariantView) => void;
}

export function VariantSelector({
  productTitle,
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) {
  const selectedVariant =
    variants.find((v) => v.id === selectedVariantId) ?? variants[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-[#6E6E73]">
          Select Option / Size
        </span>
        {selectedVariant ? (
          <span className="font-medium text-[#1D1D1F]">
            {selectedVariant.availableStock <= 0
              ? 'Currently Out of Stock'
              : selectedVariant.wuyeFloorStock > 0
                ? `${selectedVariant.wuyeFloorStock} at Wuye Boutique Floor`
                : `${selectedVariant.availableStock} Available Online`}
          </span>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-label={`Options for ${productTitle}`}
        className="flex flex-wrap gap-2"
      >
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId;
          const isOutOfStock = variant.availableStock <= 0;
          const label = variant.shoeSizeEu
            ? variant.colorName
              ? `EU ${variant.shoeSizeEu} (${variant.colorName})`
              : `EU ${variant.shoeSizeEu}`
            : variant.title;

          return (
            <button
              key={variant.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isOutOfStock}
              onClick={() => onSelect(variant)}
              className={cn(
                'rounded-full px-4 py-2 text-xs transition-all',
                isOutOfStock
                  ? 'cursor-not-allowed bg-[#F5F5F7] text-[#86868B] line-through opacity-35'
                  : isSelected
                    ? 'bg-[#1D1D1F] font-semibold text-white shadow-xs'
                    : 'border border-black/[0.12] bg-white text-[#1D1D1F] hover:border-[#1D1D1F]'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {variants.some((v) => v.availableStock <= 0) ? (
        <a
          href={buildWhatsAppUrl(
            `Hello Lifestyle Boutique (Suite 83, H&A Plaza, Wuye, Abuja), please notify me when ${productTitle} is restocked.`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-medium text-[#008080] underline"
        >
          Request Restock on WhatsApp
        </a>
      ) : null}
    </div>
  );
}
