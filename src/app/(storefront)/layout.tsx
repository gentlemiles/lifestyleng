import { FrostedHeader } from '@/components/layout/frosted-header';
import { AppleFooter } from '@/components/layout/apple-footer';
import { CmsLiveSyncListener } from '@/components/commerce/cms-live-sync-listener';

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <CmsLiveSyncListener />
      <FrostedHeader />
      <main className="flex-1">{children}</main>
      <AppleFooter />
    </div>
  );
}
