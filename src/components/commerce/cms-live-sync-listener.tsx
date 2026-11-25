'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function CmsLiveSyncListener() {
  const router = useRouter();

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      channel = new BroadcastChannel('lifestyleng_cms_sync');
      channel.onmessage = () => {
        router.refresh();
      };
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'lifestyleng_cms_sync_ts') {
        router.refresh();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('storage', handleStorage);
      if (channel) {
        channel.close();
      }
    };
  }, [router]);

  return null;
}
