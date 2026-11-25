import Link from 'next/link';

const ADMIN_NAV_LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Products & Inventory' },
  { href: '/admin/pages', label: 'Pages & Elements' },
  { href: '/admin/stays', label: 'Apartments' },
  { href: '/admin/logistics', label: 'Car Hire Fleet' },
  { href: '/admin/orders', label: 'Orders & 24h Returns' },
  { href: '/admin/mtn', label: 'MTN Leads' },
] as const;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1B1B1D]">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex shrink-0 items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/lcn-logo-full.png"
                alt="Lifestyle Corporate Networks Ltd. CMS"
                width={946}
                height={225}
                className="h-9 w-auto max-w-[168px] object-contain"
              />
              <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-neutral-700">
                CMS
              </span>
            </Link>

            <nav
              aria-label="Admin navigation"
              className="flex items-center gap-1 overflow-x-auto text-xs"
            >
              {ADMIN_NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/shop/clothes"
              className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
            >
              View Shop ↗
            </Link>
            <Link
              href="/"
              className="rounded-md bg-neutral-950 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Storefront ↗
            </Link>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
