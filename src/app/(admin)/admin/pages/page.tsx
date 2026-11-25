import Link from 'next/link';
import { getAllStorefrontPagesConfig } from '@/server/queries/catalog';
import { PagesCmsClient } from '@/components/admin/pages-cms-client';

export const dynamic = 'force-dynamic';

export default async function AdminPagesCmsPage() {
  const pages = await getAllStorefrontPagesConfig();

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-950">
            Storefront Pages, Hero Banners &amp; Content Elements
          </h1>
          <p className="text-xs text-neutral-500">
            Edit headlines, descriptions, buttons, hero imagery, and page
            sections across all 8 storefront pages.
          </p>
        </div>
        <Link
          href="/admin/products"
          className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Manage Products &amp; Inventory →
        </Link>
      </div>

      <PagesCmsClient initialPages={pages} />
    </div>
  );
}
