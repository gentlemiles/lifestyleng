'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ArrowRight,
  MapPin,
  Phone,
} from 'lucide-react';
import { useCart } from '@/components/commerce/cart-context';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import { cn } from '@/lib/utils';

const MAIN_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop/clothes', label: 'Shop' },
  { href: '/mtn-services/fibrex', label: 'MTN Services' },
  { href: '/stays', label: 'Shortlet' },
  { href: '/car-hire', label: 'Car Hire' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

const STORE_CATEGORIES = [
  {
    href: '/shop/clothes',
    label: 'Clothing, Shoes & Bags',
    detail: 'Suite 83, H&A Plaza, Wuye',
  },
  {
    href: '/mtn-services/fibrex',
    label: 'MTN Services',
    detail: 'FibreX home fiber & 5G routers',
  },
  {
    href: '/stays',
    label: '4-Bedroom Shortlet Duplex',
    detail: 'Prince & Princess Estate, Kaura',
  },
  {
    href: '/car-hire',
    label: 'Abuja Car Hire & Airport Pickup',
    detail: 'Chauffeur-driven sedans, SUVs & vans',
  },
] as const;

const SUPPORT_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/shop/clothes', label: 'Shop New Arrivals' },
  { href: '/booking-form', label: 'Book a Service' },
  { href: '/account/orders', label: 'Orders & 24-Hour Returns' },
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Store Locations & Contact' },
  { href: '/faqs', label: 'FAQs' },
] as const;

export function FrostedHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount, openCart } = useCart();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setMenuOpen(false);
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    const trimmed = searchQuery.trim();
    router.push(
      trimmed
        ? `/shop/clothes?q=${encodeURIComponent(trimmed)}`
        : '/shop/clothes'
    );
  }

  return (
    <header
      ref={menuContainerRef}
      className="sticky top-0 inset-x-0 z-50 border-b border-black/[0.07] bg-white/95 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-controls="site-navigation-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/[0.08] bg-white text-[#1B1B1D] transition hover:bg-[#F5F5F7]"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          <Link
            href="/"
            aria-label="Lifestyle Corporate Networks Ltd. Home"
            className="group flex shrink-0 items-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/lcn-logo-full.png"
              alt="Lifestyle Corporate Networks Ltd. — Corporate • Connectivity • Solutions"
              width={946}
              height={225}
              className="h-9 w-auto max-w-[168px] object-contain transition-opacity duration-200 group-hover:opacity-90 sm:h-11 sm:max-w-[205px]"
            />
          </Link>
        </div>

        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-1"
        >
          {MAIN_LINKS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[#001026] text-white'
                    : 'text-[#44474E] hover:bg-[#F5F5F7] hover:text-[#1B1B1D]'
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-1.5 rounded-full border border-black/[0.12] bg-[#F5F5F7] px-3 py-1.5"
            >
              <Search className="h-4 w-4 text-[#44474E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search clothes, routers..."
                className="w-36 sm:w-44 bg-transparent text-xs text-[#1B1B1D] focus:outline-none"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
                className="text-[#44474E] hover:text-[#1B1B1D]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search store"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[#44474E] transition hover:bg-[#F5F5F7] hover:text-[#1B1B1D]"
            >
              <Search className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={openCart}
            aria-label="Open shopping bag"
            className="inline-flex items-center gap-2 rounded-full bg-[#001026] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#0B2545]"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Bag</span>
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[11px] font-bold text-[#001026] tabular-nums">
              {itemCount}
            </span>
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div
          id="site-navigation-menu"
          className="border-t border-black/[0.07] bg-white shadow-xl"
        >
          <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-8 px-4 py-8 sm:px-6 md:grid-cols-12">
            <div className="space-y-3 md:col-span-7">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#74777F]">
                Departments
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {STORE_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.href}
                    href={cat.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-center justify-between rounded-2xl border border-black/[0.06] bg-[#FAFAFC] p-4 transition hover:border-black/20 hover:bg-white"
                  >
                    <div>
                      <p className="font-display text-sm font-bold text-[#1B1B1D]">
                        {cat.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[#44474E]">
                        {cat.detail}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-[#74777F] transition-transform group-hover:translate-x-0.5 group-hover:text-[#1B1B1D]" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 md:col-span-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#74777F]">
                  Store Navigation
                </p>
                <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  {SUPPORT_LINKS.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setMenuOpen(false)}
                        className="block rounded-lg px-2.5 py-1.5 font-medium text-[#1B1B1D] hover:bg-[#F5F5F7]"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl bg-[#F5F5F7] p-4 text-xs text-[#44474E] space-y-1.5">
                <p className="flex items-center gap-2 font-semibold text-[#1B1B1D]">
                  <MapPin className="h-3.5 w-3.5 text-[#006A6A]" />
                  Suite 83 / Block B70, H&amp;A Plaza, Wuye, Abuja
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <a
                    href="tel:+2348064912969"
                    className="inline-flex items-center gap-1.5 font-semibold text-[#1B1B1D] hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    +234 806 491 2969
                  </a>
                  <a
                    href={buildWhatsAppUrl(
                      'Hello LifestyleNG, I have a question about your store.'
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#006A6A] hover:underline"
                  >
                    Chat on WhatsApp →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
