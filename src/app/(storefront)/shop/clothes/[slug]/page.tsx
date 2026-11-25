import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductBySlug } from '@/server/queries/catalog';
import { ProductDetailClient } from '@/components/divisions/fashion/product-detail-client';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <nav className="text-xs text-[#6E6E73]">
        <Link href="/shop/clothes" className="hover:text-[#1D1D1F]">
          ← Back to Wuye Store Collection
        </Link>
      </nav>
      <ProductDetailClient product={product} />
    </div>
  );
}
