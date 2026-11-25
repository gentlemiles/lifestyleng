'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import type { StayCategoryItem, StayPropertyView } from '@/types';
import { PriceDisplay } from '@/components/commerce/price-display';

export function StaysCatalogGrid({
  properties,
  categories,
}: {
  properties: StayPropertyView[];
  categories: StayCategoryItem[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const activeCategories = categories.filter((c) => c.isActive);
  const filteredProperties =
    selectedCategory === 'ALL'
      ? properties
      : properties.filter((p) => p.category === selectedCategory);

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
            Managed Apartments in Abuja ({filteredProperties.length})
          </h2>
          <p className="mt-0.5 text-xs text-[#44474E]">
            Filter by property category or open any apartment to compare
            individual rooms and rates.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Filter apartments by category"
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'ALL'}
            onClick={() => setSelectedCategory('ALL')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
              selectedCategory === 'ALL'
                ? 'bg-[#001026] font-semibold text-white'
                : 'border border-black/[0.08] bg-white text-[#1B1B1D] hover:bg-[#F5F5F7]'
            }`}
          >
            All ({properties.length})
          </button>
          {activeCategories.map((cat) => {
            const count = properties.filter(
              (p) => p.category === cat.name
            ).length;
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat.name)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-[#001026] font-semibold text-white'
                    : 'border border-black/[0.08] bg-white text-[#1B1B1D] hover:bg-[#F5F5F7]'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-10 text-center space-y-3">
          <p className="font-display text-base font-semibold text-[#1B1B1D]">
            No apartments listed in &ldquo;{selectedCategory}&rdquo; yet.
          </p>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className="rounded-full bg-[#001026] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2545]"
          >
            Show All Managed Apartments
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-4"
            >
              <div>
                <div className="aspect-[16/10] overflow-hidden rounded-xl bg-[#F5F5F7]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.images[0] ?? ''}
                    alt={prop.title}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="inline-block rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[10px] font-semibold text-[#006A6A]">
                    {prop.category}
                  </span>
                  <span className="text-[11px] font-medium text-[#74777F]">
                    {prop.bedrooms} Bed • Max {prop.maxGuests}
                  </span>
                </div>
                <h3 className="mt-1.5 line-clamp-2 font-display text-sm font-bold text-[#1B1B1D]">
                  {prop.title}
                </h3>
                <p className="mt-1 line-clamp-2 flex items-start gap-1 text-[11px] text-[#44474E]">
                  <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-[#006A6A]" />
                  <span>{prop.address}</span>
                </p>
                {prop.rooms.length > 0 && (
                  <p className="mt-1.5 text-[11px] font-medium text-[#006A6A]">
                    {prop.rooms.length} individual room options available
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-black/[0.06] pt-3">
                <PriceDisplay
                  amountKobo={prop.nightlyRateKobo}
                  periodSuffix="/ night"
                  size="sm"
                />
                <Link
                  href={`/stays/${prop.slug}`}
                  className="rounded-full bg-[#001026] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0B2545]"
                >
                  View Rooms
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
