import { getFleetVehiclesCatalog } from '@/server/queries/catalog';
import { LogisticsCmsClient } from '@/components/admin/logistics-cms-client';

export const dynamic = 'force-dynamic';

export default async function AdminLogisticsPage() {
  const vehicles = await getFleetVehiclesCatalog();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <LogisticsCmsClient initialVehicles={vehicles} />
    </div>
  );
}
