'use server';

import crypto from 'node:crypto';
import { revalidatePath, revalidateTag } from 'next/cache';
import {
  cmsDeleteEntitySchema,
  cmsDeleteStayCategorySchema,
  cmsQuickStockUpdateSchema,
  cmsUpsertCategorySchema,
  cmsUpsertFleetVehicleSchema,
  cmsUpsertPageConfigSchema,
  cmsUpsertProductSchema,
  cmsUpsertStayCategorySchema,
  cmsUpsertStayPropertySchema,
  type ActionResponse,
} from '@/lib/validations/contracts';
import { nairaToKobo } from '@/lib/money';
import { readCmsStore, writeCmsStore } from '@/server/services/cms-store';
import type {
  CmsCategoryItem,
  CmsPageConfig,
  FleetVehicleView,
  ProductCatalogItem,
  StayCategoryItem,
  StayPropertyView,
} from '@/types';

function revalidateAllStorefrontRoutes(): void {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/');
    revalidatePath('/shop/clothes');
    revalidatePath('/mtn-services/fibrex');
    revalidatePath('/stays');
    revalidatePath('/car-hire');
    revalidatePath('/about');
    revalidatePath('/contact');
    revalidatePath('/faqs');
    revalidatePath('/admin');
    revalidatePath('/admin/products');
    revalidatePath('/admin/stays');
    revalidatePath('/admin/logistics');
    revalidateTag('products');
    revalidateTag('inventory');
  } catch {
    // No-op outside Next.js request context
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function upsertProductCmsAction(
  rawInput: unknown
): Promise<ActionResponse<ProductCatalogItem>> {
  const parsed = cmsUpsertProductSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ??
          'Please check the product form fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const input = parsed.data;
  const priceKobo = nairaToKobo(input.priceNaira);
  const compareAtPriceKobo =
    typeof input.compareAtPriceNaira === 'number' &&
    input.compareAtPriceNaira > 0
      ? nairaToKobo(input.compareAtPriceNaira)
      : null;

  const store = readCmsStore();
  const isEditing = Boolean(input.id);
  const existingIndex = isEditing
    ? store.products.findIndex((p) => p.id === input.id)
    : -1;

  const productId =
    existingIndex >= 0 && store.products[existingIndex]
      ? store.products[existingIndex].id
      : crypto.randomUUID();

  const existingProduct =
    existingIndex >= 0 ? store.products[existingIndex] : undefined;

  const baseSlug = slugify(input.title) || `product-${Date.now()}`;
  const slugConflict = store.products.some(
    (p) => p.slug === baseSlug && p.id !== productId
  );
  const finalSlug = existingProduct
    ? existingProduct.slug
    : slugConflict
    ? `${baseSlug}-${productId.slice(0, 6)}`
    : baseSlug;

  const allImages = [
    input.imageUrl,
    ...(input.additionalImages ?? []).filter((u) => u.length > 0),
  ];

  const wuyeStock =
    typeof input.wuyeFloorStock === 'number'
      ? Math.min(input.wuyeFloorStock, input.availableStock)
      : Math.min(input.availableStock, 5);

  const primaryVariantId =
    existingProduct?.variants[0]?.id ?? crypto.randomUUID();

  const updatedVariants =
    existingProduct && existingProduct.variants.length > 0
      ? existingProduct.variants.map((v, idx) =>
          idx === 0
            ? {
                ...v,
                sku: input.sku,
                title: input.variantTitle,
                size: input.size || v.size || 'One Size',
                colorName: input.colorName || v.colorName || 'Obsidian',
                colorHex: input.colorHex || v.colorHex || '#1B1B1D',
                priceKobo,
                compareAtPriceKobo,
                availableStock: input.availableStock,
                wuyeFloorStock: wuyeStock,
              }
            : {
                ...v,
                priceKobo,
                compareAtPriceKobo,
              }
        )
      : [
          {
            id: primaryVariantId,
            productId,
            sku: input.sku,
            title: input.variantTitle,
            size: input.size || 'One Size',
            colorName: input.colorName || 'Obsidian',
            colorHex: input.colorHex || '#1B1B1D',
            priceKobo,
            compareAtPriceKobo,
            availableStock: input.availableStock,
            wuyeFloorStock: wuyeStock,
          },
        ];

  const nextProduct: ProductCatalogItem = {
    id: productId,
    division: input.division,
    subPillar: input.subPillar,
    slug: finalSlug,
    title: input.title,
    subtitle: input.subtitle || `${input.subPillar} • SKU: ${input.sku}`,
    description: input.description,
    basePriceKobo: priceKobo,
    compareAtPriceKobo,
    images: allImages,
    specifications: existingProduct?.specifications ?? {
      Category: input.subPillar,
      SKU: input.sku,
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
      ReturnPolicy: 'Eligible within 24 hours of receipt',
    },
    isWuyePickupEligible: input.isWuyePickupEligible,
    variants: updatedVariants,
  };

  if (existingIndex >= 0) {
    store.products[existingIndex] = nextProduct;
  } else {
    store.products.unshift(nextProduct);
  }

  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: nextProduct,
    error: null,
  };
}

export async function quickUpdateProductStockCmsAction(
  rawInput: unknown
): Promise<ActionResponse<ProductCatalogItem>> {
  const parsed = cmsQuickStockUpdateSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Invalid stock update payload.',
      },
    };
  }

  const store = readCmsStore();
  const productIndex = store.products.findIndex(
    (p) => p.id === parsed.data.productId
  );
  const existing = store.products[productIndex];

  if (productIndex < 0 || !existing) {
    return {
      data: null,
      error: {
        code: 'ERR_NOT_FOUND',
        message: 'Product not found.',
      },
    };
  }

  const nextAvailable = parsed.data.availableStock;
  const nextWuye =
    typeof parsed.data.wuyeFloorStock === 'number'
      ? Math.min(parsed.data.wuyeFloorStock, nextAvailable)
      : Math.min(existing.variants[0]?.wuyeFloorStock ?? 0, nextAvailable);

  const updatedProduct: ProductCatalogItem = {
    ...existing,
    variants: existing.variants.map((v, idx) =>
      idx === 0
        ? {
            ...v,
            availableStock: nextAvailable,
            wuyeFloorStock: nextWuye,
          }
        : v
    ),
  };

  store.products[productIndex] = updatedProduct;
  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: updatedProduct,
    error: null,
  };
}

export async function deleteProductCmsAction(
  rawInput: unknown
): Promise<ActionResponse<{ deletedId: string }>> {
  const parsed = cmsDeleteEntitySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Product ID is required for deletion.',
      },
    };
  }

  const store = readCmsStore();
  const exists = store.products.some((p) => p.id === parsed.data.id);
  if (!exists) {
    return {
      data: null,
      error: {
        code: 'ERR_NOT_FOUND',
        message: 'Product not found.',
      },
    };
  }

  store.products = store.products.filter((p) => p.id !== parsed.data.id);
  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: { deletedId: parsed.data.id },
    error: null,
  };
}

export async function upsertCategoryCmsAction(
  rawInput: unknown
): Promise<ActionResponse<CmsCategoryItem>> {
  const parsed = cmsUpsertCategorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ?? 'Invalid category fields.',
      },
    };
  }

  const store = readCmsStore();
  const normalizedLabel = parsed.data.label.trim().toLowerCase();
  const duplicateLabel = store.categories.some(
    (c) =>
      c.label.trim().toLowerCase() === normalizedLabel &&
      c.id !== parsed.data.id
  );
  if (duplicateLabel) {
    return {
      data: null,
      error: {
        code: 'ERR_DUPLICATE_CATEGORY',
        message: `A category named "${parsed.data.label}" already exists.`,
      },
    };
  }

  const idx = store.categories.findIndex((c) => c.id === parsed.data.id);
  if (idx >= 0) {
    store.categories[idx] = parsed.data;
  } else {
    store.categories.push(parsed.data);
  }

  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: parsed.data,
    error: null,
  };
}

export async function deleteCategoryCmsAction(
  rawInput: unknown
): Promise<ActionResponse<{ deletedId: string }>> {
  const parsed = cmsDeleteEntitySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Category ID is required.',
      },
    };
  }

  const store = readCmsStore();
  store.categories = store.categories.filter((c) => c.id !== parsed.data.id);
  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: { deletedId: parsed.data.id },
    error: null,
  };
}

export interface UpsertStayCategoryResult {
  category: StayCategoryItem;
  propagatedApartmentsCount: number;
}

export async function upsertStayCategoryCmsAction(
  rawInput: unknown
): Promise<ActionResponse<UpsertStayCategoryResult>> {
  const parsed = cmsUpsertStayCategorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ?? 'Category name cannot be empty.',
      },
    };
  }

  const input = parsed.data;
  const store = readCmsStore();
  const normalizedName = input.name.trim().toLowerCase();
  const duplicate = store.stayCategories.some(
    (c) =>
      c.name.trim().toLowerCase() === normalizedName && c.id !== input.id
  );

  if (duplicate) {
    return {
      data: null,
      error: {
        code: 'ERR_DUPLICATE_CATEGORY',
        message: `A category named "${input.name}" already exists.`,
      },
    };
  }

  const existingIdx = input.id
    ? store.stayCategories.findIndex((c) => c.id === input.id)
    : -1;
  const existing =
    existingIdx >= 0 ? store.stayCategories[existingIdx] : undefined;

  const categoryId =
    existing?.id ?? `stay-cat-${slugify(input.name)}-${Date.now().toString().slice(-4)}`;

  const nextCategory: StayCategoryItem = {
    id: categoryId,
    name: input.name.trim(),
    description: input.description.trim(),
    isActive: input.isActive,
  };

  let propagatedApartmentsCount = 0;
  if (existing && existing.name !== nextCategory.name) {
    store.stayProperties = store.stayProperties.map((prop) => {
      if (prop.category === existing.name) {
        propagatedApartmentsCount += 1;
        return { ...prop, category: nextCategory.name };
      }
      return prop;
    });
  }

  if (existingIdx >= 0) {
    store.stayCategories[existingIdx] = nextCategory;
  } else {
    store.stayCategories.push(nextCategory);
  }

  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: {
      category: nextCategory,
      propagatedApartmentsCount,
    },
    error: null,
  };
}

export interface DeleteStayCategoryResult {
  deletedId: string;
  reassignedApartmentsCount: number;
  reassignedToCategory: string;
}

export async function deleteStayCategoryCmsAction(
  rawInput: unknown
): Promise<ActionResponse<DeleteStayCategoryResult>> {
  const parsed = cmsDeleteStayCategorySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Category ID is required for deletion.',
      },
    };
  }

  const store = readCmsStore();
  const target = store.stayCategories.find((c) => c.id === parsed.data.id);
  if (!target) {
    return {
      data: null,
      error: {
        code: 'ERR_NOT_FOUND',
        message: 'Category not found.',
      },
    };
  }

  const remaining = store.stayCategories.filter((c) => c.id !== target.id);
  const fallbackCategoryName =
    parsed.data.reassignToCategoryName?.trim() ||
    remaining[0]?.name ||
    'Uncategorized';

  let reassignedApartmentsCount = 0;
  store.stayProperties = store.stayProperties.map((prop) => {
    if (prop.category === target.name) {
      reassignedApartmentsCount += 1;
      return { ...prop, category: fallbackCategoryName };
    }
    return prop;
  });

  store.stayCategories = remaining;
  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: {
      deletedId: target.id,
      reassignedApartmentsCount,
      reassignedToCategory: fallbackCategoryName,
    },
    error: null,
  };
}

export async function upsertPageConfigCmsAction(
  rawInput: unknown
): Promise<ActionResponse<CmsPageConfig>> {
  const parsed = cmsUpsertPageConfigSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ?? 'Invalid page configuration.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      },
    };
  }

  const store = readCmsStore();
  const nextPage: CmsPageConfig = {
    ...parsed.data,
    updatedAt: new Date().toISOString(),
  };

  const idx = store.pages.findIndex((p) => p.path === nextPage.path);
  if (idx >= 0) {
    store.pages[idx] = nextPage;
  } else {
    store.pages.push(nextPage);
  }

  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: nextPage,
    error: null,
  };
}

export async function upsertStayPropertyCmsAction(
  rawInput: unknown
): Promise<ActionResponse<StayPropertyView>> {
  const parsed = cmsUpsertStayPropertySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ?? 'Invalid stay property fields.',
      },
    };
  }

  const input = parsed.data;
  const store = readCmsStore();
  const existingIdx = input.id
    ? store.stayProperties.findIndex((s) => s.id === input.id)
    : -1;
  const existing =
    existingIdx >= 0 ? store.stayProperties[existingIdx] : undefined;

  const id = existing?.id ?? crypto.randomUUID();
  const slug =
    existing?.slug ?? (`${slugify(input.title)}-${id.slice(0, 4)}` || id);

  const amenities = input.amenitiesText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const normalizedRooms =
    input.rooms.length > 0
      ? input.rooms.map((r) => ({
          id: r.id || crypto.randomUUID(),
          name: r.name,
          roomSizeSqm: r.roomSizeSqm,
          ensuiteSizeSqm: r.ensuiteSizeSqm,
          bedType: r.bedType,
          occupancy: r.occupancy,
          nightlyRateKobo: nairaToKobo(r.nightlyRateNaira),
          imageUrl: r.imageUrl,
          description: r.description,
        }))
      : existing?.rooms ?? [];

  const normalizedAmenityGroups =
    input.amenityGroups.length > 0
      ? input.amenityGroups.map((g) => ({
          id: g.id || crypto.randomUUID(),
          title: g.title,
          items: g.items.map((item) => item.trim()).filter(Boolean),
        }))
      : existing?.amenityGroups ?? [];

  const allImages =
    input.additionalImages && input.additionalImages.length > 0
      ? [
          input.imageUrl,
          ...input.additionalImages.filter((u) => u.trim().length > 0),
        ]
      : existing && existing.images.length > 1
        ? [input.imageUrl, ...existing.images.slice(1)]
        : [input.imageUrl];

  const nextProperty: StayPropertyView = {
    id,
    slug,
    title: input.title,
    subtitle: input.subtitle,
    category: input.category || existing?.category || 'Short-Let Duplex',
    district: input.district,
    estateName: input.estateName,
    address: input.address,
    bedrooms: input.bedrooms,
    bathrooms: input.bathrooms,
    maxGuests: input.maxGuests,
    livingRoomSizeSqm: input.livingRoomSizeSqm,
    defaultEnsuiteSizeSqm: input.defaultEnsuiteSizeSqm,
    nightlyRateKobo: nairaToKobo(input.nightlyRateNaira),
    weeklyRateKobo: nairaToKobo(input.weeklyRateNaira),
    monthlyRateKobo: nairaToKobo(input.monthlyRateNaira),
    cautionDepositKobo: nairaToKobo(input.cautionDepositNaira),
    aboutIntro: input.aboutIntro || existing?.aboutIntro || '',
    ourPromise: input.ourPromise || existing?.ourPromise || '',
    amenityGroups: normalizedAmenityGroups,
    rooms: normalizedRooms,
    amenities,
    images: allImages,
    isFlagship: existing?.isFlagship ?? false,
    blockedDates: existing?.blockedDates ?? [],
  };

  if (existingIdx >= 0) {
    store.stayProperties[existingIdx] = nextProperty;
  } else {
    store.stayProperties.push(nextProperty);
  }

  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: nextProperty,
    error: null,
  };
}

export async function deleteStayPropertyCmsAction(
  rawInput: unknown
): Promise<ActionResponse<{ deletedId: string }>> {
  const parsed = cmsDeleteEntitySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Property ID is required.',
      },
    };
  }

  const store = readCmsStore();
  store.stayProperties = store.stayProperties.filter(
    (s) => s.id !== parsed.data.id
  );
  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: { deletedId: parsed.data.id },
    error: null,
  };
}

export async function upsertFleetVehicleCmsAction(
  rawInput: unknown
): Promise<ActionResponse<FleetVehicleView>> {
  const parsed = cmsUpsertFleetVehicleSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message:
          parsed.error.issues[0]?.message ?? 'Invalid fleet vehicle fields.',
      },
    };
  }

  const input = parsed.data;
  const store = readCmsStore();
  const existingIdx = input.id
    ? store.fleetVehicles.findIndex((v) => v.id === input.id)
    : -1;
  const existing =
    existingIdx >= 0 ? store.fleetVehicles[existingIdx] : undefined;

  const id = existing?.id ?? crypto.randomUUID();
  const slug =
    existing?.slug ?? (`${slugify(input.name)}-${id.slice(0, 4)}` || id);

  const nextVehicle: FleetVehicleView = {
    id,
    slug,
    name: input.name,
    category: input.category,
    hourlyRateKobo: nairaToKobo(input.hourlyRateNaira),
    dailyIntraCityRateKobo: nairaToKobo(input.dailyIntraCityRateNaira),
    airportTransferRateKobo: nairaToKobo(input.airportTransferRateNaira),
    interStateDailyRateKobo: nairaToKobo(input.interStateDailyRateNaira),
    passengerCapacity: input.passengerCapacity,
    luggageCapacity: input.luggageCapacity,
    imageUrl: input.imageUrl,
    isAvailable: input.isAvailable,
  };

  if (existingIdx >= 0) {
    store.fleetVehicles[existingIdx] = nextVehicle;
  } else {
    store.fleetVehicles.push(nextVehicle);
  }

  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: nextVehicle,
    error: null,
  };
}

export async function deleteFleetVehicleCmsAction(
  rawInput: unknown
): Promise<ActionResponse<{ deletedId: string }>> {
  const parsed = cmsDeleteEntitySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Vehicle ID is required.',
      },
    };
  }

  const store = readCmsStore();
  store.fleetVehicles = store.fleetVehicles.filter(
    (v) => v.id !== parsed.data.id
  );
  writeCmsStore(store);
  revalidateAllStorefrontRoutes();

  return {
    data: { deletedId: parsed.data.id },
    error: null,
  };
}
