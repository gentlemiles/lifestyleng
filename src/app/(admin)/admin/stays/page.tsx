import {
  getStayCategoriesCatalog,
  getStayPropertiesCatalog,
} from '@/server/queries/catalog';
import { StaysCmsClient } from '@/components/admin/stays-cms-client';

export const dynamic = 'force-dynamic';

export default async function AdminStaysPage() {
  const [properties, stayCategories] = await Promise.all([
    getStayPropertiesCatalog(),
    getStayCategoriesCatalog(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <StaysCmsClient
        initialProperties={properties}
        initialCategories={stayCategories}
      />
    </div>
  );
}
