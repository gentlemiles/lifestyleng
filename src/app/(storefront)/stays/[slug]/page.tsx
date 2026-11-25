import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MapPin } from 'lucide-react';
import { getStayPropertyBySlug } from '@/server/queries/catalog';
import { ApartmentDetailSection } from '@/components/divisions/homes/apartment-detail-section';

export const dynamic = 'force-dynamic';

export default async function StayPropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getStayPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 px-4 py-8 sm:px-6 sm:py-10">
      <nav className="text-xs text-[#6E6E73]">
        <Link href="/stays" className="hover:text-[#1D1D1F]">
          ← Back to Short-Let Apartments
        </Link>
      </nav>

      <div className="space-y-2">
        <p className="flex items-center gap-1.5 text-xs font-semibold text-[#006A6A]">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span>{property.address}</span>
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#1B1B1D] sm:text-4xl">
          {property.title}
        </h1>
        <p className="text-xs text-[#6E6E73]">{property.subtitle}</p>
      </div>

      <ApartmentDetailSection property={property} />
    </div>
  );
}
