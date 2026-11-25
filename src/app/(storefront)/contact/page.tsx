import type { Metadata } from 'next';
import { Phone, MessageCircle, ArrowUpRight } from 'lucide-react';
import { OFFICIAL_DISPLAY_PHONES, buildWhatsAppUrl } from '@/lib/whatsapp';
import { getStorefrontPageConfig } from '@/server/queries/catalog';
import { CmsCustomSections } from '@/components/layout/cms-custom-sections';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title:
    'Contact & Locations — Wuye Store, Kaura Duplex & Garki Office | LifestyleNG',
  description:
    'Visit Lifestyle Corporate Networks Ltd. at Suite 83 / Block B70, H&A Plaza, Wuye; Prince & Princess Estate, Kaura; or Plot 12, Corporate Avenue, Garki, Abuja. Phone: +234 806 491 2969.',
};

const PHYSICAL_LOCATIONS = [
  {
    district: 'Wuye District',
    title: 'Wuye Fashion Boutique',
    address: 'Suite 83 / Block B70, H&A Plaza, Wuye District, Abuja, FCT.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCaHczmVVxHJ7im1_w5o8TZSo1XBZ7VOwn7h7TD2LFt3SJ8Xqq0kZNY9imEIbzesz_GSdKXdS2Eh-PUL7mNON6-rqw7YebyGWJ68nmq-i9yCvJ5jWKEnuB6gNwZ-1f1huDTGygyyyjoMbmwHuNAwitbpghBxUQ2BQiKoVEk5se_Ws6QqfpolqOqudiO5Ym7zoQuuhhfc89p9Cigt4lah6SKrb8lcbMlAS4j8S31oVE',
    hours: 'Mon–Sat: 9:00 AM – 7:00 PM',
    note: 'In-store shopping, free pickup (₦0) & 24-hour returns',
    mapUrl: 'https://maps.google.com/?q=H%26A+Plaza+Wuye+Abuja',
    phone: '+2348064912969',
  },
  {
    district: 'Kaura District',
    title: '4-Bedroom Shortlet Duplex',
    address:
      'House 43, 1st Crescent, Off Drive 2, Prince & Princess Estate, First gate, opposite Kaura Market, Kaura District.',
    image: '/images/stays/prince-and-princess/exterior-front.jpg',
    hours: 'Check-in 2:00 PM • Check-out 11:00 AM',
    note: 'Nightly short-lets & monthly furnished stays',
    mapUrl:
      'https://maps.google.com/?q=Prince+and+Princess+Estate+Kaura+Abuja',
    phone: '+2348125326496',
  },
  {
    district: 'Garki District',
    title: 'Corporate Office',
    address:
      'Lifestyle Corporate Networks Ltd., Plot 12, Corporate Avenue, Garki, Abuja.',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCG3PYFQXYvMAhdOd5cCPdBJ_v2_nna325gwCgdrud6anLWT-2lPGotkzs6E0v3GbRFPd-r2rVdwVVMAGUo5o1WmiCUiLiI-YeqAvvdNl8gq8CoPpAouxaALXMQ5VVqrmWdwI-6hk-w8hh3-EA8Iw-vEyfgC-a8Vj5HsZlAWycZSb-nfxqOniwP6GyXspleaqNTb05mBMcKshZADJkPbcO6Gll8XzaiKhwdlzx7Ux0',
    hours: 'Mon–Fri: 8:30 AM – 5:30 PM',
    note: 'Administration, MTN FibreX & B2B distribution',
    mapUrl: 'https://maps.google.com/?q=Garki+Abuja+Nigeria',
    phone: '+2349134275487',
  },
];

export default async function ContactPage() {
  const pageConfig = await getStorefrontPageConfig('/contact');

  return (
    <div className="mx-auto max-w-[1200px] space-y-12 px-4 py-10 sm:px-6 sm:py-14">
      <section className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#006A6A]">
          {pageConfig.heroEyebrow}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#1B1B1D] sm:text-5xl">
          {pageConfig.heroHeadline}
        </h1>
        <p className="text-base text-[#44474E]">{pageConfig.heroDescription}</p>
      </section>

      <CmsCustomSections sections={pageConfig.customSections} />

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {PHYSICAL_LOCATIONS.map((loc) => (
          <div
            key={loc.title}
            className="flex flex-col justify-between rounded-2xl border border-black/[0.06] bg-white p-5"
          >
            <div>
              <div className="mb-4 h-44 w-full overflow-hidden rounded-xl bg-[#F5F5F7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={loc.image}
                  alt={loc.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <span className="text-xs font-semibold text-[#006A6A]">
                {loc.district}
              </span>
              <h2 className="mt-0.5 font-display text-lg font-bold text-[#1B1B1D]">
                {loc.title}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#44474E]">
                {loc.address}
              </p>

              <div className="mt-4 space-y-1 rounded-xl bg-[#FAFAFC] p-3 text-xs text-[#44474E]">
                <p className="font-medium text-[#1B1B1D]">{loc.hours}</p>
                <p>{loc.note}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#006A6A] hover:underline"
              >
                <span>Open in Google Maps</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href={`tel:${loc.phone}`}
                aria-label={`Call ${loc.title}`}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1B1B1D] hover:bg-[#EAE7EA]"
              >
                <Phone className="h-4 w-4" />
              </a>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-8">
        <h2 className="font-display text-xl font-bold text-[#1B1B1D]">
          Direct Phone &amp; WhatsApp Lines
        </h2>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-[#FAFAFC] p-4 space-y-2">
            <p className="text-xs font-semibold text-[#44474E]">
              Primary WhatsApp &amp; Wuye Boutique
            </p>
            <p className="font-display text-lg font-bold text-[#1B1B1D] tabular-nums">
              {OFFICIAL_DISPLAY_PHONES.PRIMARY}
            </p>
            <a
              href={buildWhatsAppUrl(
                'Hello LifestyleNG, I have an enquiry.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#10B981] px-4 py-2 text-xs font-semibold text-white"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Chat on WhatsApp
            </a>
          </div>

          <div className="rounded-xl bg-[#FAFAFC] p-4 space-y-2">
            <p className="text-xs font-semibold text-[#44474E]">
              MTN FibreX &amp; Routers Desk
            </p>
            <p className="font-display text-lg font-bold text-[#1B1B1D] tabular-nums">
              {OFFICIAL_DISPLAY_PHONES.SECONDARY_1}
            </p>
            <a
              href="tel:+2349134275487"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-4 py-2 text-xs font-semibold text-[#1B1B1D]"
            >
              <Phone className="h-3.5 w-3.5" />
              Call FibreX Desk
            </a>
          </div>

          <div className="rounded-xl bg-[#FAFAFC] p-4 space-y-2">
            <p className="text-xs font-semibold text-[#44474E]">
              Kaura Shortlet &amp; Car Hire Desk
            </p>
            <p className="font-display text-lg font-bold text-[#1B1B1D] tabular-nums">
              {OFFICIAL_DISPLAY_PHONES.SECONDARY_2}
            </p>
            <a
              href="tel:+2348125326496"
              className="inline-flex items-center gap-1.5 rounded-full border border-black/[0.1] bg-white px-4 py-2 text-xs font-semibold text-[#1B1B1D]"
            >
              <Phone className="h-3.5 w-3.5" />
              Call Stays &amp; Fleet
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
