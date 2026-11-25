import Link from 'next/link';
import { OFFICIAL_DISPLAY_PHONES, buildWhatsAppUrl } from '@/lib/whatsapp';

export function AppleFooter() {
  return (
    <footer className="mt-20 border-t border-black/[0.07] bg-white text-xs text-[#44474E]">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Link
              href="/"
              aria-label="Lifestyle Corporate Networks Ltd. Home"
              className="inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/lcn-logo-full.png"
                alt="Lifestyle Corporate Networks Ltd. — Corporate • Connectivity • Solutions"
                width={946}
                height={225}
                className="h-12 w-auto max-w-[240px] object-contain"
              />
            </Link>
            <p className="leading-relaxed">
              Plot 12, Corporate Avenue, Garki,
              <br />
              Abuja, FCT, Nigeria
            </p>
            <p className="text-[#74777F]">
              Wear It. Connect It. Stay in It. Move with It.
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="font-display text-sm font-bold text-[#1B1B1D]">
              Abuja Locations
            </p>
            <p className="leading-relaxed">
              <strong className="text-[#1B1B1D]">Wuye Boutique:</strong> Suite
              83 / Block B70, H&amp;A Plaza, Wuye, Abuja
            </p>
            <p className="leading-relaxed">
              <strong className="text-[#1B1B1D]">Kaura Shortlet:</strong>{' '}
              4-Bedroom Duplex, Prince &amp; Princess Estate, Kaura, Abuja
            </p>
          </div>

          <div className="space-y-2.5">
            <p className="font-display text-sm font-bold text-[#1B1B1D]">
              Phone &amp; WhatsApp
            </p>
            <ul className="space-y-1.5 tabular-nums">
              <li>
                <a
                  href={buildWhatsAppUrl('Hello LifestyleNG, I need assistance.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#006A6A] hover:underline"
                >
                  {OFFICIAL_DISPLAY_PHONES.PRIMARY} (WhatsApp)
                </a>
              </li>
              <li>
                <a href="tel:+2349134275487" className="hover:text-[#1B1B1D]">
                  {OFFICIAL_DISPLAY_PHONES.SECONDARY_1} (MTN FibreX Desk)
                </a>
              </li>
              <li>
                <a href="tel:+2348125326496" className="hover:text-[#1B1B1D]">
                  {OFFICIAL_DISPLAY_PHONES.SECONDARY_2} (Stays &amp; Car Hire)
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <p className="font-display text-sm font-bold text-[#1B1B1D]">
              Quick Links
            </p>
            <ul className="grid grid-cols-2 gap-1.5">
              <li>
                <Link href="/shop/clothes" className="hover:text-[#1B1B1D]">
                  Wuye Boutique
                </Link>
              </li>
              <li>
                <Link
                  href="/mtn-services/fibrex"
                  className="hover:text-[#1B1B1D]"
                >
                  MTN Services
                </Link>
              </li>
              <li>
                <Link href="/stays" className="hover:text-[#1B1B1D]">
                  Kaura Shortlet
                </Link>
              </li>
              <li>
                <Link href="/car-hire" className="hover:text-[#1B1B1D]">
                  Car Hire
                </Link>
              </li>
              <li>
                <Link href="/booking-form" className="hover:text-[#1B1B1D]">
                  Book a Service
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-[#1B1B1D]">
                  24h Returns
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="hover:text-[#1B1B1D]">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#1B1B1D]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col justify-between gap-3 border-t border-black/[0.06] pt-6 text-[11px] text-[#74777F] sm:flex-row">
          <p>
            © {new Date().getFullYear()} Lifestyle Corporate Networks Ltd.
            Returns accepted within 24 hours of receipt in original condition.
          </p>
          <p>
            MTN FibreX coverage &amp; installation are subject to MTN
            confirmation.
          </p>
        </div>
      </div>
    </footer>
  );
}
