import {
  getAllProductsCatalog,
  getAllStorefrontPagesConfig,
  getCategoriesCatalog,
} from '@/server/queries/catalog';
import { ProductsCmsClient } from '@/components/admin/products-cms-client';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [products, categories, pages] = await Promise.all([
    getAllProductsCatalog(),
    getCategoriesCatalog(),
    getAllStorefrontPagesConfig(),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-xl font-bold text-neutral-950">
          Catalog, Inventory, Categories &amp; Storefront Pages
        </h1>
        <p className="text-xs text-neutral-500">
          Add, edit, restock, or delete products, categories, and page elements.
          Changes sync immediately with the live storefront.
        </p>
      </div>

      <ProductsCmsClient
        initialProducts={products}
        initialCategories={categories}
        initialPages={pages}
      />
    </div>
  );
}
