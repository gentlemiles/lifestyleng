import Link from 'next/link';
import {
  getAllProductsCatalog,
  getAllStorefrontPagesConfig,
  getCategoriesCatalog,
  getFleetVehiclesCatalog,
  getStayPropertiesCatalog,
} from '@/server/queries/catalog';
import { ProductsCmsClient } from '@/components/admin/products-cms-client';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const [products, categories, pages, stayProperties, fleetVehicles] =
    await Promise.all([
      getAllProductsCatalog(),
      getCategoriesCatalog(),
      getAllStorefrontPagesConfig(),
      getStayPropertiesCatalog(),
      getFleetVehiclesCatalog(),
    ]);

  const totalInventoryUnits = products.reduce(
    (sum, p) =>
      sum + p.variants.reduce((vSum, v) => vSum + v.availableStock, 0),
    0
  );

  const outOfStockCount = products.filter(
    (p) => p.variants.reduce((vSum, v) => vSum + v.availableStock, 0) === 0
  ).length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-neutral-950">
            Store CMS &amp; Inventory Manager
          </h1>
          <p className="mt-0.5 text-xs text-neutral-500">
            Lifestyle Corporate Networks Ltd. • Manage products, pricing, Wuye
            store inventory, categories, and storefront pages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/admin/pages"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Pages &amp; Imagery ({pages.length})
          </Link>
          <Link
            href="/admin/stays"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Apartments ({stayProperties.length})
          </Link>
          <Link
            href="/admin/logistics"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Fleet ({fleetVehicles.length})
          </Link>
          <Link
            href="/admin/orders"
            className="rounded-md border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700 hover:bg-neutral-50"
          >
            Orders &amp; 24h Returns
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <span className="text-xs text-neutral-500">Catalog Products</span>
          <p className="mt-1 text-xl font-bold text-neutral-950 tabular-nums">
            {products.length}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <span className="text-xs text-neutral-500">Total Stock Units</span>
          <p className="mt-1 text-xl font-bold text-neutral-950 tabular-nums">
            {totalInventoryUnits}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <span className="text-xs text-neutral-500">Out of Stock Items</span>
          <p className="mt-1 text-xl font-bold text-neutral-950 tabular-nums">
            {outOfStockCount}
          </p>
        </div>
        <div className="rounded-lg border border-neutral-200 bg-white p-4">
          <span className="text-xs text-neutral-500">Storefront Pages</span>
          <p className="mt-1 text-xl font-bold text-neutral-950 tabular-nums">
            {pages.length}
          </p>
        </div>
      </div>

      <ProductsCmsClient
        initialProducts={products}
        initialCategories={categories}
        initialPages={pages}
      />
    </div>
  );
}
