'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, RotateCcw, Search, ShoppingBag, Truck, X } from 'lucide-react';
import type { CmsCategoryItem, ProductCatalogItem } from '@/types';
import { ProductCard } from '@/components/commerce/product-card';
import { useCart } from '@/components/commerce/cart-context';
import { formatKoboToNaira } from '@/lib/money';
import { buildWhatsAppUrl } from '@/lib/whatsapp';

type FashionFilterTab = 'ALL' | 'CLOTHING' | 'SHOES' | 'BAGS' | 'ACCESSORIES';
type SortOrder = 'FEATURED' | 'PRICE_DESC' | 'PRICE_ASC';

const VALID_TABS: ReadonlyArray<FashionFilterTab> = [
  'ALL',
  'CLOTHING',
  'SHOES',
  'BAGS',
  'ACCESSORIES',
];

function normalizeInitialTab(raw?: string): FashionFilterTab {
  if (!raw) return 'ALL';
  const upper = raw.trim().toUpperCase() as FashionFilterTab;
  return VALID_TABS.includes(upper) ? upper : 'ALL';
}

function normalizeInitialSort(raw?: string): SortOrder {
  if (raw === 'PRICE_ASC' || raw === 'PRICE_DESC') return raw;
  return 'FEATURED';
}

export function FashionCatalogClient({
  products,
  categories,
  heroEyebrow = 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja • Open Mon–Sat 9am–7pm',
  heroHeadline = 'Wuye Store Collection',
  heroDescription = 'Order online for same-day Abuja delivery or pick up free in store. Returns and exchanges are accepted within 24 hours of receipt.',
  initialSearchQuery = '',
  initialCategory,
  initialSize,
  initialSort,
}: {
  products: ReadonlyArray<ProductCatalogItem>;
  categories?: ReadonlyArray<CmsCategoryItem>;
  heroEyebrow?: string;
  heroHeadline?: string;
  heroDescription?: string;
  initialSearchQuery?: string;
  initialCategory?: string;
  initialSize?: string;
  initialSort?: string;
}) {
  const router = useRouter();
  const {
    itemCount,
    subtotalKobo,
    openCart,
    fulfillmentType,
    setFulfillmentType,
  } = useCart();

  const [activeTab, setActiveTab] = useState<FashionFilterTab>(() =>
    normalizeInitialTab(initialCategory)
  );
  const [sortOrder, setSortOrder] = useState<SortOrder>(() =>
    normalizeInitialSort(initialSort)
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    initialSize?.trim() || 'ALL'
  );
  const [searchQuery, setSearchQuery] = useState<string>(
    initialSearchQuery.trim()
  );

  // Keep search and category filters in sync when navigating with query params (e.g. header search ?q=...)
  useEffect(() => {
    setSearchQuery(initialSearchQuery.trim());
  }, [initialSearchQuery]);

  useEffect(() => {
    if (initialCategory) {
      setActiveTab(normalizeInitialTab(initialCategory));
    }
  }, [initialCategory]);

  const availableSizes = useMemo(() => {
    const sizeSet = new Set<string>();
    for (const product of products) {
      for (const variant of product.variants) {
        if (variant.shoeSizeEu) {
          sizeSet.add(`EU ${variant.shoeSizeEu}`);
        } else if (variant.size && variant.size.trim().length > 0) {
          sizeSet.add(variant.size.trim());
        }
      }
    }
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
    return Array.from(sizeSet).sort((a, b) => {
      const idxA = order.indexOf(a);
      const idxB = order.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b, undefined, { numeric: true });
    });
  }, [products]);

  const counts = {
    ALL: products.length,
    CLOTHING: products.filter((p) => p.subPillar === 'CLOTHING').length,
    SHOES: products.filter((p) => p.subPillar === 'SHOES').length,
    BAGS: products.filter((p) => p.subPillar === 'BAGS').length,
    ACCESSORIES: products.filter((p) => p.subPillar === 'ACCESSORIES').length,
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filtered = products
    .filter((p) => (activeTab === 'ALL' ? true : p.subPillar === activeTab))
    .filter((p) => {
      if (!normalizedQuery) return true;
      return (
        p.title.toLowerCase().includes(normalizedQuery) ||
        (p.subtitle?.toLowerCase().includes(normalizedQuery) ?? false) ||
        p.description.toLowerCase().includes(normalizedQuery) ||
        p.subPillar.toLowerCase().includes(normalizedQuery) ||
        p.variants.some(
          (v) =>
            v.sku.toLowerCase().includes(normalizedQuery) ||
            v.title.toLowerCase().includes(normalizedQuery) ||
            (v.size?.toLowerCase().includes(normalizedQuery) ?? false) ||
            (v.colorName?.toLowerCase().includes(normalizedQuery) ?? false)
        )
      );
    })
    .filter((p) => {
      if (selectedSize === 'ALL') return true;
      return p.variants.some(
        (v) =>
          v.size === selectedSize ||
          (v.shoeSizeEu ? `EU ${v.shoeSizeEu}` === selectedSize : false)
      );
    })
    .slice()
    .sort((a, b) => {
      if (sortOrder === 'PRICE_DESC') return b.basePriceKobo - a.basePriceKobo;
      if (sortOrder === 'PRICE_ASC') return a.basePriceKobo - b.basePriceKobo;
      return 0;
    });

  const dynamicTabs: { id: FashionFilterTab; label: string; count: number }[] =
    categories && categories.length > 0
      ? [
          { id: 'ALL', label: 'All Items', count: counts.ALL },
          ...categories
            .filter(
              (c): c is CmsCategoryItem & { id: FashionFilterTab } =>
                c.id === 'CLOTHING' ||
                c.id === 'SHOES' ||
                c.id === 'BAGS' ||
                c.id === 'ACCESSORIES'
            )
            .map((c) => ({
              id: c.id,
              label: c.label,
              count: counts[c.id],
            })),
        ]
      : [
          { id: 'ALL', label: 'All Items', count: counts.ALL },
          { id: 'CLOTHING', label: 'Clothing', count: counts.CLOTHING },
          { id: 'SHOES', label: 'Shoes', count: counts.SHOES },
          { id: 'BAGS', label: 'Bags', count: counts.BAGS },
          { id: 'ACCESSORIES', label: 'Accessories', count: counts.ACCESSORIES },
        ];

  function handleResetFilters() {
    setActiveTab('ALL');
    setSelectedSize('ALL');
    setSearchQuery('');
    setSortOrder('FEATURED');
    if (initialSearchQuery || initialCategory || initialSize || initialSort) {
      router.replace('/shop/clothes', { scroll: false });
    }
  }

  return (
    <div className="space-y-8">
      <section className="flex flex-col justify-between gap-4 border-b border-black/[0.07] pb-6 md:flex-row md:items-end">
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#44474E]">{heroEyebrow}</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#1B1B1D] sm:text-4xl">
            {heroHeadline}
          </h1>
          <p className="max-w-2xl text-sm text-[#44474E]">{heroDescription}</p>
        </div>

        <button
          type="button"
          onClick={openCart}
          className="inline-flex items-center gap-2 self-start rounded-full bg-[#001026] px-5 py-2.5 text-xs font-semibold text-white md:self-auto"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Bag ({itemCount})</span>
          <span className="text-white/80 tabular-nums">
            • {formatKoboToNaira(subtotalKobo)}
          </span>
        </button>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={fulfillmentType !== 'WUYE_IN_STORE_PICKUP'}
          onClick={() => setFulfillmentType('ABUJA_DOORSTEP_DELIVERY')}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            fulfillmentType !== 'WUYE_IN_STORE_PICKUP'
              ? 'border-[#001026] bg-white'
              : 'border-black/[0.07] bg-white/60 hover:bg-white'
          }`}
        >
          <Truck className="h-5 w-5 shrink-0 text-[#006A6A]" />
          <div>
            <p className="text-xs font-bold text-[#1B1B1D]">
              Doorstep Delivery (Abuja &amp; Nationwide)
            </p>
            <p className="text-xs text-[#44474E]">
              Same-day dispatch across Abuja districts.
            </p>
          </div>
        </button>

        <button
          type="button"
          aria-pressed={fulfillmentType === 'WUYE_IN_STORE_PICKUP'}
          onClick={() => setFulfillmentType('WUYE_IN_STORE_PICKUP')}
          className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition ${
            fulfillmentType === 'WUYE_IN_STORE_PICKUP'
              ? 'border-[#001026] bg-white'
              : 'border-black/[0.07] bg-white/60 hover:bg-white'
          }`}
        >
          <MapPin className="h-5 w-5 shrink-0 text-[#006A6A]" />
          <div>
            <p className="text-xs font-bold text-[#1B1B1D]">
              Free Store Pickup &amp; Fitting (₦0)
            </p>
            <p className="text-xs text-[#44474E]">
              Collect at Suite 83 / Block B70, H&amp;A Plaza, Wuye.
            </p>
          </div>
        </button>
      </div>

      {/* Filter Toolbar + Search Input */}
      <div className="space-y-3">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div
            role="tablist"
            aria-label="Product categories"
            className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0"
          >
            {dynamicTabs.map((chip) => {
              const isActive = activeTab === chip.id;
              return (
                <button
                  key={chip.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveTab(chip.id)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-[#001026] text-white font-semibold'
                      : 'bg-white text-[#1B1B1D] border border-black/[0.07] hover:bg-[#F5F5F7]'
                  }`}
                >
                  {chip.label} ({chip.count})
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-[#6E6E73]" />
              <input
                type="search"
                aria-label="Search boutique products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search loafers, tote, tee..."
                className="w-full sm:w-52 rounded-full border border-black/[0.1] bg-white py-2 pl-8 pr-7 text-xs text-[#1B1B1D] focus:border-[#001026] focus:outline-none"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    if (initialSearchQuery) {
                      router.replace('/shop/clothes', { scroll: false });
                    }
                  }}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-2.5 text-[#6E6E73] hover:text-[#1B1B1D]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>

            <select
              aria-label="Filter by size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              className="rounded-full border border-black/[0.1] bg-white px-3.5 py-2 text-xs font-medium text-[#1B1B1D]"
            >
              <option value="ALL">All Sizes</option>
              {availableSizes.map((size) => (
                <option key={size} value={size}>
                  {size.startsWith('EU ') || size === 'One Size'
                    ? size
                    : `Size ${size}`}
                </option>
              ))}
            </select>

            <select
              aria-label="Sort items"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="rounded-full border border-black/[0.1] bg-white px-3.5 py-2 text-xs font-medium text-[#1B1B1D]"
            >
              <option value="FEATURED">Sort: Featured</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>

        {normalizedQuery ? (
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-white px-4 py-2.5 border border-black/[0.06] text-xs">
            <span className="text-[#44474E]">
              Showing{' '}
              <strong className="text-[#1B1B1D]">{filtered.length}</strong>{' '}
              result(s) for{' '}
              <strong className="text-[#1B1B1D]">
                &ldquo;{searchQuery.trim()}&rdquo;
              </strong>
            </span>
            <button
              type="button"
              onClick={handleResetFilters}
              className="font-semibold text-[#006A6A] hover:underline"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        ) : null}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-black/[0.06] bg-white p-12 text-center space-y-4">
          <p className="font-display text-base font-semibold text-[#1B1B1D]">
            No pieces match your current filters.
          </p>
          <p className="text-xs text-[#6E6E73]">
            Try resetting your search or ask our Wuye Boutique team to check
            in-store availability.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#001026] px-4 py-2 text-xs font-semibold text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Filters
            </button>
            <a
              href={buildWhatsAppUrl(
                `Hello Lifestyle Boutique (Suite 83, H&A Plaza, Wuye), I am looking for${
                  searchQuery.trim() ? ` "${searchQuery.trim()}"` : ' an item'
                }.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/[0.1] bg-white px-4 py-2 text-xs font-semibold text-[#1B1B1D]"
            >
              Ask Wuye Boutique Staff on WhatsApp
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
