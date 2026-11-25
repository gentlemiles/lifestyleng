'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Check,
  ExternalLink,
} from 'lucide-react';
import type {
  CmsCategoryItem,
  CmsPageConfig,
  ProductCatalogItem,
} from '@/types';
import { formatKoboToNaira, koboToNairaWhole } from '@/lib/money';
import {
  deleteCategoryCmsAction,
  deleteProductCmsAction,
  quickUpdateProductStockCmsAction,
  upsertCategoryCmsAction,
  upsertProductCmsAction,
} from '@/server/actions/cms';
import { PagesCmsClient } from './pages-cms-client';

type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
type AdminSubTab = 'PRODUCTS' | 'CATEGORIES' | 'PAGES';

function getProductStockStatus(totalStock: number): StockStatus {
  if (totalStock <= 0) return 'OUT_OF_STOCK';
  if (totalStock <= 3) return 'LOW_STOCK';
  return 'IN_STOCK';
}

function notifyStorefrontSync() {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('lifestyleng_cms_sync');
      channel.postMessage({ type: 'CMS_UPDATED', timestamp: Date.now() });
      channel.close();
    }
    window.localStorage.setItem('lifestyleng_cms_sync_ts', String(Date.now()));
  } catch {
    // Ignore broadcast errors
  }
}

interface ProductFormState {
  id?: string;
  title: string;
  subtitle: string;
  division: 'FASHION_BOUTIQUE' | 'MTN_SERVICES';
  subPillar:
    | 'CLOTHING'
    | 'SHOES'
    | 'BAGS'
    | 'ACCESSORIES'
    | 'MTN_HARDWARE'
    | 'MTN_SERVICE_PLAN';
  priceNaira: string;
  compareAtPriceNaira: string;
  availableStock: string;
  wuyeFloorStock: string;
  sku: string;
  size: string;
  colorName: string;
  colorHex: string;
  imageUrl: string;
  secondaryImageUrl: string;
  description: string;
  isWuyePickupEligible: boolean;
}

const DEFAULT_FORM_STATE: ProductFormState = {
  title: '',
  subtitle: 'Suite 83 / Block B70, H&A Plaza, Wuye',
  division: 'FASHION_BOUTIQUE',
  subPillar: 'CLOTHING',
  priceNaira: '',
  compareAtPriceNaira: '',
  availableStock: '10',
  wuyeFloorStock: '6',
  sku: '',
  size: 'L',
  colorName: 'Obsidian Black',
  colorHex: '#1B1B1D',
  imageUrl:
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=85',
  secondaryImageUrl: '',
  description: '',
  isWuyePickupEligible: true,
};

export function ProductsCmsClient({
  initialProducts,
  initialCategories,
  initialPages,
}: {
  initialProducts: ProductCatalogItem[];
  initialCategories: CmsCategoryItem[];
  initialPages: CmsPageConfig[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminSubTab>('PRODUCTS');
  const [products, setProducts] =
    useState<ProductCatalogItem[]>(initialProducts);
  const [categories, setCategories] =
    useState<CmsCategoryItem[]>(initialCategories);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | StockStatus>('ALL');

  // Create / Edit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'CREATE' | 'EDIT'>('CREATE');
  const [formState, setFormState] =
    useState<ProductFormState>(DEFAULT_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation modal state
  const [productToDelete, setProductToDelete] =
    useState<ProductCatalogItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Global status banner
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Quick stock pending ID
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  // Category edit state
  const [savingCategoryId, setSavingCategoryId] = useState<string | null>(null);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [newCatLabel, setNewCatLabel] = useState('');
  const [newCatDivision, setNewCatDivision] = useState<
    'FASHION_BOUTIQUE' | 'MTN_SERVICES'
  >('FASHION_BOUTIQUE');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [categoryToDelete, setCategoryToDelete] =
    useState<CmsCategoryItem | null>(null);

  const filteredProducts = products.filter((p) => {
    const totalStock = p.variants.reduce((acc, v) => acc + v.availableStock, 0);
    const status = getProductStockStatus(totalStock);
    const matchesSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.variants.some((v) =>
        v.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    const matchesCategory =
      categoryFilter === 'ALL' || p.subPillar === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  function openCreateModal() {
    setFormMode('CREATE');
    setFormState({
      ...DEFAULT_FORM_STATE,
      sku: `LNG-WUY-${String(products.length + 1).padStart(3, '0')}`,
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditModal(product: ProductCatalogItem) {
    const primaryVariant = product.variants[0];
    const totalStock = product.variants.reduce(
      (acc, v) => acc + v.availableStock,
      0
    );
    const wuyeStock = product.variants.reduce(
      (acc, v) => acc + v.wuyeFloorStock,
      0
    );
    setFormMode('EDIT');
    setFormState({
      id: product.id,
      title: product.title,
      subtitle: product.subtitle ?? '',
      division: product.division,
      subPillar: product.subPillar,
      priceNaira: String(koboToNairaWhole(product.basePriceKobo)),
      compareAtPriceNaira: product.compareAtPriceKobo
        ? String(koboToNairaWhole(product.compareAtPriceKobo))
        : '',
      availableStock: String(primaryVariant?.availableStock ?? totalStock),
      wuyeFloorStock: String(primaryVariant?.wuyeFloorStock ?? wuyeStock),
      sku: primaryVariant?.sku ?? 'LNG-SKU-001',
      size: primaryVariant?.size ?? 'One Size',
      colorName: primaryVariant?.colorName ?? 'Standard',
      colorHex: primaryVariant?.colorHex ?? '#1B1B1D',
      imageUrl: product.images[0] ?? '',
      secondaryImageUrl: product.images[1] ?? '',
      description: product.description,
      isWuyePickupEligible: product.isWuyePickupEligible,
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function handleImageUpload(
    field: 'imageUrl' | 'secondaryImageUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setFormState((prev) => ({
          ...prev,
          [field]: reader.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = Number(formState.priceNaira);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError('Please enter a valid positive price in Naira (₦).');
      return;
    }

    const parsedCompare = formState.compareAtPriceNaira.trim()
      ? Number(formState.compareAtPriceNaira)
      : null;
    if (
      parsedCompare !== null &&
      (!Number.isFinite(parsedCompare) || parsedCompare <= 0)
    ) {
      setFormError('Compare-at price must be a positive number or left blank.');
      return;
    }

    const parsedStock = Number(formState.availableStock);
    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      setFormError('Stock quantity must be a whole number (0 or greater).');
      return;
    }

    const parsedWuyeStock = Number(formState.wuyeFloorStock);
    if (!Number.isInteger(parsedWuyeStock) || parsedWuyeStock < 0) {
      setFormError('Wuye floor stock must be a whole number (0 or greater).');
      return;
    }

    setIsSubmitting(true);

    const divisionForCategory: 'FASHION_BOUTIQUE' | 'MTN_SERVICES' =
      formState.subPillar === 'MTN_HARDWARE' ||
      formState.subPillar === 'MTN_SERVICE_PLAN'
        ? 'MTN_SERVICES'
        : 'FASHION_BOUTIQUE';

    try {
      const response = await upsertProductCmsAction({
        id: formState.id,
        title: formState.title.trim(),
        subtitle: formState.subtitle.trim(),
        division: divisionForCategory,
        subPillar: formState.subPillar,
        priceNaira: parsedPrice,
        compareAtPriceNaira: parsedCompare,
        availableStock: parsedStock,
        wuyeFloorStock: Math.min(parsedWuyeStock, parsedStock),
        sku: formState.sku.trim() || `LNG-SKU-${Date.now().toString().slice(-4)}`,
        variantTitle: `${formState.size.trim() || 'Standard'} • ${
          formState.colorName.trim() || 'Standard'
        }`,
        size: formState.size.trim() || 'One Size',
        colorName: formState.colorName.trim() || 'Standard',
        colorHex: formState.colorHex.trim() || '#1B1B1D',
        imageUrl: formState.imageUrl.trim(),
        additionalImages: formState.secondaryImageUrl.trim()
          ? [formState.secondaryImageUrl.trim()]
          : [],
        description: formState.description.trim(),
        isWuyePickupEligible: formState.isWuyePickupEligible,
      });

      if (response.error) {
        setFormError(response.error.message);
        return;
      }

      const saved = response.data;
      const isEditing = Boolean(formState.id);
      setProducts((prev) => {
        const exists = prev.some((p) => p.id === saved.id);
        if (exists) {
          return prev.map((p) => (p.id === saved.id ? saved : p));
        }
        return [saved, ...prev];
      });

      setIsFormOpen(false);
      setBanner({
        type: 'success',
        message: !isEditing
          ? `Created "${saved.title}" (${formatKoboToNaira(saved.basePriceKobo)}). Now live on storefront.`
          : `Updated "${saved.title}". Changes reflected immediately on storefront.`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setFormError('Unable to save product right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleQuickStockAdjust(
    product: ProductCatalogItem,
    nextStock: number
  ) {
    const safeStock = Math.max(0, nextStock);
    setUpdatingStockId(product.id);
    setBanner(null);

    const currentWuye = product.variants[0]?.wuyeFloorStock ?? 0;
    try {
      const response = await quickUpdateProductStockCmsAction({
        productId: product.id,
        availableStock: safeStock,
        wuyeFloorStock: Math.min(currentWuye, safeStock),
      });

      if (response.error) {
        setBanner({ type: 'error', message: response.error.message });
        return;
      }

      const updated = response.data;
      setProducts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setBanner({
        type: 'success',
        message: `Stock for "${updated.title}" updated to ${safeStock} unit(s).`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setBanner({
        type: 'error',
        message: 'Unable to update stock right now. Please try again.',
      });
    } finally {
      setUpdatingStockId(null);
    }
  }

  async function handleConfirmDelete() {
    if (!productToDelete) return;
    setIsDeleting(true);
    setBanner(null);

    try {
      const response = await deleteProductCmsAction({ id: productToDelete.id });

      if (response.error) {
        setBanner({ type: 'error', message: response.error.message });
        setProductToDelete(null);
        return;
      }

      const deletedTitle = productToDelete.title;
      const deletedId = productToDelete.id;
      setProducts((prev) => prev.filter((p) => p.id !== deletedId));
      setProductToDelete(null);
      setBanner({
        type: 'success',
        message: `Deleted "${deletedTitle}" from catalog and reconciled active carts.`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setBanner({
        type: 'error',
        message: 'Unable to delete product right now. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveCategory(cat: CmsCategoryItem) {
    if (!cat.label.trim()) {
      setBanner({
        type: 'error',
        message: 'Category name cannot be empty.',
      });
      return;
    }
    setSavingCategoryId(cat.id);
    setBanner(null);
    try {
      const res = await upsertCategoryCmsAction(cat);
      if (res.error) {
        setBanner({ type: 'error', message: res.error.message });
        return;
      }
      setCategories((prev) =>
        prev.map((c) => (c.id === res.data.id ? res.data : c))
      );
      setBanner({
        type: 'success',
        message: `Saved category "${res.data.label}". Storefront tabs updated.`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setBanner({
        type: 'error',
        message: 'Unable to save category right now. Please try again.',
      });
    } finally {
      setSavingCategoryId(null);
    }
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setBanner(null);
    const trimmed = newCatLabel.trim();
    if (!trimmed) {
      setBanner({
        type: 'error',
        message: 'Category name cannot be empty.',
      });
      return;
    }
    const generatedId = trimmed
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    setIsCreatingCategory(true);
    try {
      const res = await upsertCategoryCmsAction({
        id: generatedId || `CAT_${Date.now()}`,
        label: trimmed,
        division: newCatDivision,
        description:
          newCatDescription.trim() || `${trimmed} catalog items.`,
        isActive: true,
      });
      if (res.error) {
        setBanner({ type: 'error', message: res.error.message });
        return;
      }
      setCategories((prev) => [...prev, res.data]);
      setNewCatLabel('');
      setNewCatDescription('');
      setBanner({
        type: 'success',
        message: `Created category "${res.data.label}".`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setBanner({
        type: 'error',
        message: 'Unable to create category right now. Please try again.',
      });
    } finally {
      setIsCreatingCategory(false);
    }
  }

  async function handleConfirmDeleteCategory() {
    if (!categoryToDelete) return;
    setIsDeletingCategory(true);
    try {
      const res = await deleteCategoryCmsAction({ id: categoryToDelete.id });
      if (res.error) {
        setBanner({ type: 'error', message: res.error.message });
        setCategoryToDelete(null);
        return;
      }
      const deletedLabel = categoryToDelete.label;
      const deletedId = categoryToDelete.id;
      setCategories((prev) => prev.filter((c) => c.id !== deletedId));
      setBanner({
        type: 'success',
        message: `Deleted category "${deletedLabel}".`,
      });
      setCategoryToDelete(null);
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setBanner({
        type: 'error',
        message: 'Unable to delete category right now. Please try again.',
      });
    } finally {
      setIsDeletingCategory(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('PRODUCTS')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'PRODUCTS'
                ? 'bg-neutral-950 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Products &amp; Inventory ({products.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CATEGORIES')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'CATEGORIES'
                ? 'bg-neutral-950 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('PAGES')}
            className={`rounded-md px-3.5 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'PAGES'
                ? 'bg-neutral-950 text-white'
                : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            Pages &amp; Storefront Imagery ({initialPages.length})
          </button>
        </div>

        {activeTab === 'PRODUCTS' && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Add New Product
          </button>
        )}
      </div>

      {banner && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-md border px-4 py-3 text-xs font-medium ${
            banner.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <span>{banner.message}</span>
          <button
            type="button"
            onClick={() => setBanner(null)}
            aria-label="Dismiss notification"
            className="ml-4 text-neutral-500 hover:text-neutral-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {activeTab === 'PRODUCTS' && (
        <div className="space-y-4">
          <div className="flex flex-col justify-between gap-3 rounded-lg border border-neutral-200 bg-white p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by title, SKU, or description..."
                aria-label="Search products"
                className="w-full rounded-md border border-neutral-300 py-2 pl-9 pr-3 text-xs text-neutral-900 focus:border-neutral-950 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800"
              >
                <option value="ALL">All Categories</option>
                <option value="CLOTHING">Clothing</option>
                <option value="SHOES">Shoes</option>
                <option value="BAGS">Bags</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="MTN_HARDWARE">MTN 5G Routers &amp; MiFis</option>
              </select>

              <select
                aria-label="Filter by stock status"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as 'ALL' | StockStatus)
                }
                className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs font-medium text-neutral-800"
              >
                <option value="ALL">All Stock Statuses</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock (&lt;= 3)</option>
                <option value="OUT_OF_STOCK">Out of Stock (0)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-neutral-200 bg-neutral-50 text-neutral-600">
                <tr>
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Price (NGN)</th>
                  <th className="px-4 py-3 font-semibold">
                    Stock &amp; Quick Adjust
                  </th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-10 text-center text-neutral-500"
                    >
                      No products match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const primaryVariant = product.variants[0];
                    const primaryStock = primaryVariant?.availableStock ?? 0;
                    const totalStock = product.variants.reduce(
                      (acc, v) => acc + v.availableStock,
                      0
                    );
                    const wuyeStock = product.variants.reduce(
                      (acc, v) => acc + v.wuyeFloorStock,
                      0
                    );
                    const status = getProductStockStatus(totalStock);
                    const isUpdating = updatingStockId === product.id;

                    return (
                      <tr key={product.id} className="hover:bg-neutral-50/80">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.images[0] ?? ''}
                                alt={product.title}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-neutral-950">
                                {product.title}
                              </p>
                              <p className="truncate text-[11px] text-neutral-500">
                                SKU: {primaryVariant?.sku ?? 'N/A'} • Size:{' '}
                                {primaryVariant?.size ?? 'Standard'}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-block rounded bg-neutral-100 px-2 py-0.5 text-[11px] font-medium text-neutral-800">
                            {product.subPillar}
                          </span>
                          <span className="mt-0.5 block text-[10px] text-neutral-500">
                            {product.division === 'FASHION_BOUTIQUE'
                              ? 'Wuye Boutique'
                              : 'MTN Services'}
                          </span>
                        </td>

                        <td className="px-4 py-3 tabular-nums">
                          <span className="font-bold text-neutral-950">
                            {formatKoboToNaira(product.basePriceKobo)}
                          </span>
                          {product.compareAtPriceKobo &&
                            product.compareAtPriceKobo >
                              product.basePriceKobo && (
                              <span className="block text-[11px] text-neutral-400 line-through">
                                {formatKoboToNaira(product.compareAtPriceKobo)}
                              </span>
                            )}
                        </td>

                        <td className="px-4 py-3 tabular-nums">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-semibold text-neutral-900">
                              {totalStock} units
                            </span>
                            <span className="text-[11px] text-neutral-500">
                              ({wuyeStock} Wuye
                              {product.variants.length > 1
                                ? ` • ${product.variants.length} variants`
                                : ''}
                              )
                            </span>
                          </div>
                          <div className="mt-1.5 flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isUpdating || primaryStock <= 0}
                              onClick={() =>
                                handleQuickStockAdjust(
                                  product,
                                  primaryStock - 1
                                )
                              }
                              aria-label={`Decrease stock for ${product.title}`}
                              className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleQuickStockAdjust(
                                  product,
                                  primaryStock + 1
                                )
                              }
                              aria-label={`Increase stock for ${product.title}`}
                              className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-[11px] font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40"
                            >
                              +1
                            </button>
                            {primaryStock > 0 ? (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleQuickStockAdjust(product, 0)
                                }
                                className="rounded border border-neutral-300 bg-white px-2 py-0.5 text-[11px] text-neutral-600 hover:bg-neutral-100 disabled:opacity-40"
                              >
                                Set 0
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() =>
                                  handleQuickStockAdjust(product, 10)
                                }
                                className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-800 hover:bg-emerald-100 disabled:opacity-40"
                              >
                                Restock +10
                              </button>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          {status === 'IN_STOCK' && (
                            <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
                              In Stock
                            </span>
                          )}
                          {status === 'LOW_STOCK' && (
                            <span className="inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200">
                              Low Stock
                            </span>
                          )}
                          {status === 'OUT_OF_STOCK' && (
                            <span className="inline-block rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-semibold text-red-700 border border-red-200">
                              Out of Stock
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <Link
                              href={
                                product.division === 'MTN_SERVICES'
                                  ? '/mtn-services/fibrex'
                                  : `/shop/clothes/${product.slug}`
                              }
                              className="inline-flex items-center gap-1 rounded border border-neutral-200 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                              <span>View</span>
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => openEditModal(product)}
                              className="inline-flex items-center gap-1 rounded border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50"
                            >
                              <Pencil className="h-3 w-3" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setProductToDelete(product)}
                              className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'CATEGORIES' && (
        <div className="space-y-4">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-neutral-950">
                  Storefront Categories ({categories.length})
                </h2>
                <p className="mt-1 text-xs text-neutral-500">
                  Create, rename, or remove categories across the Wuye Boutique
                  and MTN Services pages. For apartment categories, open the{' '}
                  <Link
                    href="/admin/stays"
                    className="font-semibold text-neutral-950 underline"
                  >
                    Apartments CMS
                  </Link>
                  .
                </p>
              </div>
            </div>

            <form
              onSubmit={handleCreateCategory}
              className="rounded-md border border-neutral-200 bg-neutral-50 p-4 space-y-3 text-xs"
            >
              <span className="block font-bold text-neutral-800">
                Create New Category
              </span>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                <input
                  type="text"
                  aria-label="New category name"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  placeholder="Category Name (e.g. Senator Wear)"
                  className="sm:col-span-4 rounded border border-neutral-300 bg-white px-3 py-2"
                />
                <select
                  aria-label="New category division"
                  value={newCatDivision}
                  onChange={(e) =>
                    setNewCatDivision(
                      e.target.value as 'FASHION_BOUTIQUE' | 'MTN_SERVICES'
                    )
                  }
                  className="sm:col-span-3 rounded border border-neutral-300 bg-white px-3 py-2"
                >
                  <option value="FASHION_BOUTIQUE">Wuye Boutique</option>
                  <option value="MTN_SERVICES">MTN Services</option>
                </select>
                <input
                  type="text"
                  aria-label="New category description"
                  value={newCatDescription}
                  onChange={(e) => setNewCatDescription(e.target.value)}
                  placeholder="Description"
                  className="sm:col-span-3 rounded border border-neutral-300 bg-white px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={isCreatingCategory}
                  className="sm:col-span-2 inline-flex items-center justify-center gap-1 rounded bg-neutral-950 px-3 py-2 font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {isCreatingCategory ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </form>

            <div className="divide-y divide-neutral-200">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="grid grid-cols-1 items-center gap-4 py-4 md:grid-cols-12"
                >
                  <div className="md:col-span-2">
                    <span className="inline-block rounded bg-neutral-100 px-2 py-1 font-mono text-[11px] font-semibold text-neutral-800">
                      {cat.id}
                    </span>
                    <span className="mt-1 block text-[10px] text-neutral-500">
                      {cat.division}
                    </span>
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-medium text-neutral-600">
                      Display Label
                    </label>
                    <input
                      type="text"
                      value={cat.label}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c) =>
                            c.id === cat.id
                              ? { ...c, label: e.target.value }
                              : c
                          )
                        )
                      }
                      className="mt-1 w-full rounded border border-neutral-300 px-2.5 py-1.5 text-xs font-semibold"
                    />
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-[11px] font-medium text-neutral-600">
                      Category Description
                    </label>
                    <input
                      type="text"
                      value={cat.description}
                      onChange={(e) =>
                        setCategories((prev) =>
                          prev.map((c) =>
                            c.id === cat.id
                              ? { ...c, description: e.target.value }
                              : c
                          )
                        )
                      }
                      className="mt-1 w-full rounded border border-neutral-300 px-2.5 py-1.5 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 md:col-span-3">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700">
                      <input
                        type="checkbox"
                        checked={cat.isActive}
                        onChange={(e) =>
                          setCategories((prev) =>
                            prev.map((c) =>
                              c.id === cat.id
                                ? { ...c, isActive: e.target.checked }
                                : c
                            )
                          )
                        }
                      />
                      Active
                    </label>

                    <button
                      type="button"
                      disabled={savingCategoryId === cat.id}
                      onClick={() => handleSaveCategory(cat)}
                      className="rounded bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                    >
                      {savingCategoryId === cat.id ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryToDelete(cat)}
                      className="rounded border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {categoryToDelete && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 space-y-2 text-xs">
                <p className="font-bold text-red-950">
                  Delete category &ldquo;{categoryToDelete.label}&rdquo;? This
                  cannot be undone.
                </p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={isDeletingCategory}
                    onClick={() => setCategoryToDelete(null)}
                    className="rounded border border-neutral-300 bg-white px-3 py-1 font-medium text-neutral-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeletingCategory}
                    onClick={handleConfirmDeleteCategory}
                    className="rounded bg-red-600 px-3 py-1 font-semibold text-white disabled:opacity-50"
                  >
                    {isDeletingCategory ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'PAGES' && <PagesCmsClient initialPages={initialPages} />}

      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="product-modal-heading"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        >
          <div className="my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
              <h2
                id="product-modal-heading"
                className="text-base font-bold text-neutral-950"
              >
                {formMode === 'CREATE'
                  ? 'Add New Product'
                  : `Edit Product: ${formState.title}`}
              </h2>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                aria-label="Close modal"
                className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
              {formError && (
                <div
                  role="alert"
                  className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
                >
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Product Title *
                  </label>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="e.g. Senator Kaftan Set — Midnight Black"
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Category *
                  </label>
                  <select
                    value={formState.subPillar}
                    onChange={(e) => {
                      const nextCat = e.target
                        .value as ProductFormState['subPillar'];
                      const nextDiv =
                        nextCat === 'MTN_HARDWARE' ||
                        nextCat === 'MTN_SERVICE_PLAN'
                          ? 'MTN_SERVICES'
                          : 'FASHION_BOUTIQUE';
                      setFormState((prev) => ({
                        ...prev,
                        subPillar: nextCat,
                        division: nextDiv,
                      }));
                    }}
                    className="mt-1 w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-xs text-neutral-900"
                  >
                    <option value="CLOTHING">Clothing (Wuye Boutique)</option>
                    <option value="SHOES">Shoes (Wuye Boutique)</option>
                    <option value="BAGS">Bags (Wuye Boutique)</option>
                    <option value="ACCESSORIES">
                      Accessories (Wuye Boutique)
                    </option>
                    <option value="MTN_HARDWARE">
                      MTN 5G Routers &amp; MiFis
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Subtitle / Store Location Note
                  </label>
                  <input
                    type="text"
                    value={formState.subtitle}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        subtitle: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Price in Naira (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formState.priceNaira}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        priceNaira: e.target.value,
                      }))
                    }
                    placeholder="e.g. 145000"
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Compare-At Price in Naira (₦) (Optional)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={formState.compareAtPriceNaira}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        compareAtPriceNaira: e.target.value,
                      }))
                    }
                    placeholder="e.g. 165000"
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Total Available Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formState.availableStock}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        availableStock: e.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Wuye Store Floor Stock (Suite 83)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formState.wuyeFloorStock}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        wuyeFloorStock: e.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    SKU *
                  </label>
                  <input
                    type="text"
                    value={formState.sku}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        sku: e.target.value,
                      }))
                    }
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Size / Variant Label
                  </label>
                  <input
                    type="text"
                    value={formState.size}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        size: e.target.value,
                      }))
                    }
                    placeholder="M, L, XL, EU 42, or One Size"
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Color Name
                  </label>
                  <input
                    type="text"
                    value={formState.colorName}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        colorName: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Primary Image URL *
                  </label>
                  <input
                    type="text"
                    value={formState.imageUrl}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        imageUrl: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                  <label className="mt-1.5 block text-[11px] text-neutral-600">
                    Or upload local image file:
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload('imageUrl', e)}
                      className="mt-1 block w-full text-[11px]"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700">
                    Secondary / Hover Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    value={formState.secondaryImageUrl}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        secondaryImageUrl: e.target.value,
                      }))
                    }
                    placeholder="https://..."
                    className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                  />
                  <label className="mt-1.5 block text-[11px] text-neutral-600">
                    Or upload secondary image:
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        handleImageUpload('secondaryImageUrl', e)
                      }
                      className="mt-1 block w-full text-[11px]"
                    />
                  </label>
                </div>

                {formState.imageUrl && (
                  <div className="sm:col-span-2 flex items-center gap-3 rounded-md border border-neutral-200 bg-neutral-50 p-2.5">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded border border-neutral-200 bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formState.imageUrl}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <p className="text-[11px] text-neutral-600">
                      Live Image Preview • Displayed on storefront cards and
                      product detail gallery.
                    </p>
                  </div>
                )}

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700">
                    Product Description *
                  </label>
                  <textarea
                    rows={3}
                    value={formState.description}
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Write clear details on fabric, fit, or hardware specs..."
                    required
                    className="mt-1 w-full rounded-md border border-neutral-300 p-3 text-xs text-neutral-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="inline-flex items-center gap-2 text-xs font-medium text-neutral-800">
                    <input
                      type="checkbox"
                      checked={formState.isWuyePickupEligible}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          isWuyePickupEligible: e.target.checked,
                        }))
                      }
                    />
                    Eligible for Free In-Store Pickup at Suite 83, H&amp;A
                    Plaza, Wuye (₦0)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-md border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 rounded-md bg-neutral-950 px-5 py-2 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSubmitting
                    ? 'Saving...'
                    : formMode === 'CREATE'
                      ? 'Create Product'
                      : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {productToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-heading"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <h3
              id="delete-modal-heading"
              className="text-base font-bold text-neutral-950"
            >
              Delete {productToDelete.title}?
            </h3>
            <p className="text-xs leading-relaxed text-neutral-600">
              Delete <strong>{productToDelete.title}</strong>? This cannot be
              undone. The item will be removed from the storefront catalog and
              any active shopping bags immediately.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setProductToDelete(null)}
                className="rounded-md border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="rounded-md bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
