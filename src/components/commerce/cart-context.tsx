'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { CartItemView, FulfillmentType, ProductCatalogItem } from '@/types';
import { calculateOrderTotalKobo } from '@/lib/money';
import { SlideOverCart } from './slide-over-cart';

interface CartContextValue {
  items: CartItemView[];
  isHydrated: boolean;
  isOpen: boolean;
  fulfillmentType: FulfillmentType;
  itemCount: number;
  subtotalKobo: number;
  deliveryFeeKobo: number;
  totalAmountKobo: number;
  openCart: () => void;
  closeCart: () => void;
  setFulfillmentType: (type: FulfillmentType) => void;
  addItem: (item: Omit<CartItemView, 'quantity'>, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  syncCartWithCatalog: () => Promise<void>;
}

const CART_STORAGE_KEY = 'lifestyleng_cart_items_v1';
const FULFILLMENT_STORAGE_KEY = 'lifestyleng_fulfillment_v1';
const VALID_FULFILLMENT_TYPES: ReadonlyArray<FulfillmentType> = [
  'WUYE_IN_STORE_PICKUP',
  'ABUJA_DOORSTEP_DELIVERY',
  'INTER_STATE_DELIVERY',
  'POS_WALK_IN',
];

function sanitizeStoredCartItems(raw: unknown): CartItemView[] {
  if (!Array.isArray(raw)) return [];
  const clean: CartItemView[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const item = entry as Partial<CartItemView>;
    if (
      typeof item.variantId !== 'string' ||
      !item.variantId ||
      typeof item.productId !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.unitPriceKobo !== 'number' ||
      !Number.isInteger(item.unitPriceKobo) ||
      item.unitPriceKobo < 0 ||
      typeof item.quantity !== 'number' ||
      !Number.isInteger(item.quantity) ||
      item.quantity <= 0
    ) {
      continue;
    }
    const availableStock =
      typeof item.availableStock === 'number' &&
      Number.isInteger(item.availableStock) &&
      item.availableStock > 0
        ? item.availableStock
        : item.quantity;

    clean.push({
      variantId: item.variantId,
      productId: item.productId,
      slug: typeof item.slug === 'string' ? item.slug : '',
      title: item.title,
      variantTitle:
        typeof item.variantTitle === 'string' ? item.variantTitle : 'Standard',
      sku: typeof item.sku === 'string' ? item.sku : 'N/A',
      division:
        item.division === 'MTN_SERVICES' ? 'MTN_SERVICES' : 'FASHION_BOUTIQUE',
      unitPriceKobo: item.unitPriceKobo,
      quantity: Math.min(item.quantity, availableStock),
      availableStock,
      imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
    });
  }
  return clean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemView[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>(
    'WUYE_IN_STORE_PICKUP'
  );

  const syncCartWithCatalog = useCallback(async () => {
    try {
      const res = await fetch('/api/catalog', { cache: 'no-store' });
      if (!res.ok) return;
      const payload = (await res.json()) as {
        products?: ProductCatalogItem[];
      };
      const products = payload.products;
      if (!Array.isArray(products)) return;

      setItems((prev) => {
        if (prev.length === 0) return prev;
        const reconciled: CartItemView[] = [];
        for (const cartItem of prev) {
          const matchingProduct = products.find(
            (p) =>
              p.id === cartItem.productId ||
              p.variants.some((v) => v.id === cartItem.variantId)
          );
          if (!matchingProduct) {
            continue;
          }
          const matchingVariant =
            matchingProduct.variants.find((v) => v.id === cartItem.variantId) ??
            matchingProduct.variants[0];
          if (!matchingVariant || matchingVariant.availableStock <= 0) {
            continue;
          }
          const clampedQty = Math.min(
            cartItem.quantity,
            matchingVariant.availableStock
          );
          if (clampedQty <= 0) {
            continue;
          }
          reconciled.push({
            ...cartItem,
            productId: matchingProduct.id,
            slug: matchingProduct.slug,
            title: matchingProduct.title,
            variantId: matchingVariant.id,
            variantTitle: matchingVariant.title,
            sku: matchingVariant.sku,
            division: matchingProduct.division,
            unitPriceKobo: matchingVariant.priceKobo,
            availableStock: matchingVariant.availableStock,
            imageUrl: matchingProduct.images[0] ?? cartItem.imageUrl,
            quantity: clampedQty,
          });
        }
        return reconciled;
      });
    } catch {
      // Ignore network fetch errors during background sync
    }
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        setItems(sanitizeStoredCartItems(parsed));
      }
      const savedFulfillment = window.localStorage.getItem(
        FULFILLMENT_STORAGE_KEY
      ) as FulfillmentType | null;
      if (
        savedFulfillment &&
        VALID_FULFILLMENT_TYPES.includes(savedFulfillment)
      ) {
        setFulfillmentType(savedFulfillment);
      }
    } catch {
      // Ignore corrupt localStorage payload
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore storage quota limits
    }
  }, [items, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(FULFILLMENT_STORAGE_KEY, fulfillmentType);
    } catch {
      // Ignore storage quota limits
    }
  }, [fulfillmentType, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    void syncCartWithCatalog();

    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('lifestyleng_cms_sync');
      channel.onmessage = () => {
        void syncCartWithCatalog();
      };
    }

    const handleFocus = () => {
      void syncCartWithCatalog();
    };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CART_STORAGE_KEY) {
        try {
          const parsed = event.newValue ? (JSON.parse(event.newValue) as unknown) : [];
          setItems(sanitizeStoredCartItems(parsed));
        } catch {
          // Ignore malformed storage event
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [isHydrated, syncCartWithCatalog]);

  const addItem = useCallback(
    (newItem: Omit<CartItemView, 'quantity'>, quantity: number = 1) => {
      if (newItem.availableStock <= 0 || quantity <= 0) return;
      const safeQty = Math.floor(quantity);
      if (safeQty <= 0) return;

      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (i) => i.variantId === newItem.variantId
        );
        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          if (!existing) return prev;
          const nextQty = Math.min(
            existing.quantity + safeQty,
            newItem.availableStock
          );
          const updated = [...prev];
          updated[existingIndex] = {
            ...existing,
            ...newItem,
            quantity: nextQty,
          };
          return updated;
        }
        return [
          ...prev,
          {
            ...newItem,
            quantity: Math.min(safeQty, newItem.availableStock),
          },
        ];
      });
      setIsOpen(true);
    },
    []
  );

  const updateQuantity = useCallback((variantId: string, quantity: number) => {
    setItems((prev) => {
      if (!Number.isFinite(quantity) || quantity <= 0) {
        return prev.filter((item) => item.variantId !== variantId);
      }
      const nextInt = Math.floor(quantity);
      return prev.map((item) =>
        item.variantId === variantId
          ? { ...item, quantity: Math.min(nextInt, item.availableStock) }
          : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const openCart = useCallback(() => {
    void syncCartWithCatalog();
    setIsOpen(true);
  }, [syncCartWithCatalog]);

  const closeCart = useCallback(() => {
    setIsOpen(false);
  }, []);

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const { subtotalKobo, deliveryFeeKobo, totalAmountKobo } =
    calculateOrderTotalKobo({
      items,
      fulfillmentType,
    });

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isHydrated,
      isOpen,
      fulfillmentType,
      itemCount,
      subtotalKobo,
      deliveryFeeKobo,
      totalAmountKobo,
      openCart,
      closeCart,
      setFulfillmentType,
      addItem,
      updateQuantity,
      clearCart,
      syncCartWithCatalog,
    }),
    [
      items,
      isHydrated,
      isOpen,
      fulfillmentType,
      itemCount,
      subtotalKobo,
      deliveryFeeKobo,
      totalAmountKobo,
      openCart,
      closeCart,
      addItem,
      updateQuantity,
      clearCart,
      syncCartWithCatalog,
    ]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <SlideOverCart />
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return ctx;
}
