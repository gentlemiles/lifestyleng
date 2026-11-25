'use client';

import { useEffect, useRef } from 'react';
import { useCart } from './cart-context';

export function CheckoutVerifyEffects({
  shouldClearCart,
}: {
  shouldClearCart: boolean;
}) {
  const { clearCart, isHydrated } = useCart();
  const hasClearedRef = useRef(false);

  useEffect(() => {
    if (!shouldClearCart || !isHydrated || hasClearedRef.current) {
      return;
    }
    hasClearedRef.current = true;
    clearCart();
  }, [shouldClearCart, isHydrated, clearCart]);

  return null;
}
