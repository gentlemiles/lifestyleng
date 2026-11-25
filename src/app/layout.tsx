import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/components/commerce/cart-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (raw && /^https?:\/\//i.test(raw)) {
    return raw.replace(/\/+$/, '');
  }
  return 'https://lifestyleng.com';
}

const SITE_URL = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      'LifestyleNG.com — Wear It. Connect It. Stay in It. Move with It. | Lifestyle Corporate Networks Ltd.',
    template: '%s | LifestyleNG.com (Abuja, Nigeria)',
  },
  description:
    'Official multi-service platform for Lifestyle Corporate Networks Ltd. (Plot 12, Corporate Avenue, Garki, Abuja): Lifestyle Boutique (Homes) at Prince & Princess Estate Kaura, Lifestyle Boutique (Fashion) at Suite 83 H&A Plaza Wuye, Lifestyle Logistics (Car Hire, Airport Transfers & Haulage), and Lifestyle MTN Services (FibreX Unlimited & Telecom Store).',
  keywords: [
    'LifestyleNG',
    'Lifestyle Corporate Networks Ltd',
    'Shortlet in Kaura Abuja',
    'Prince and Princess Estate 4 Bedroom Duplex',
    'Boutique in Wuye Abuja',
    'Suite 83 H&A Plaza Wuye',
    'Car Hire in Abuja',
    'Abuja Airport Transfer',
    'MTN FibreX Availability Abuja',
    'MTN 5G Router Abuja',
  ],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/images/lcn-favicon.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/images/lcn-favicon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    siteName: 'LifestyleNG.com',
    title:
      'LifestyleNG.com — Wear It. Connect It. Stay in It. Move with It.',
    description:
      'Lifestyle Corporate Networks Ltd. — Wuye Fashion Boutique, MTN FibreX & 5G Hardware, Kaura 4-Bedroom Shortlet Duplex, and Abuja Chauffeur Car Hire.',
    images: [
      {
        url: '/images/lcn-logo-full.png',
        width: 946,
        height: 225,
        alt: 'Lifestyle Corporate Networks Ltd. — Corporate • Connectivity • Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifestyleNG.com — Lifestyle Corporate Networks Ltd.',
    description:
      'Wear It. Connect It. Stay in It. Move with It. Official multi-service Abuja platform.',
    images: ['/images/lcn-logo-full.png'],
  },
};

const structuredDataJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: 'Lifestyle Corporate Networks Ltd.',
      alternateName: 'LifestyleNG.com',
      url: SITE_URL,
      logo: `${SITE_URL}/images/lcn-logo-full.png`,
      slogan: 'Wear It. Connect It. Stay in It. Move with It.',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Plot 12, Corporate Avenue, Garki',
        addressLocality: 'Abuja',
        addressRegion: 'FCT',
        addressCountry: 'NG',
      },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+234-806-491-2969',
          contactType: 'customer service',
          areaServed: 'NG',
        },
        {
          '@type': 'ContactPoint',
          telephone: '+234-913-427-5487',
          contactType: 'sales',
          areaServed: 'NG',
        },
        {
          '@type': 'ContactPoint',
          telephone: '+234-812-532-6496',
          contactType: 'technical support',
          areaServed: 'NG',
        },
      ],
    },
    {
      '@type': 'ClothingStore',
      '@id': `${SITE_URL}/shop/clothes#store`,
      name: 'Lifestyle Boutique (Fashion) — Wuye Flagship',
      parentOrganization: { '@id': `${SITE_URL}/#organization` },
      telephone: '+234-806-491-2969',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Suite 83 / Block B70, H&A Plaza, Wuye',
        addressLocality: 'Abuja',
        addressRegion: 'FCT',
        addressCountry: 'NG',
      },
    },
    {
      '@type': 'LodgingBusiness',
      '@id': `${SITE_URL}/stays#lodging`,
      name: 'Lifestyle Boutique (Homes) — Prince & Princess Estate 4-Bedroom Luxury Duplex',
      parentOrganization: { '@id': `${SITE_URL}/#organization` },
      telephone: '+234-806-491-2969',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Prince & Princess Estate, Kaura District',
        addressLocality: 'Abuja',
        addressRegion: 'FCT',
        addressCountry: 'NG',
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] antialiased selection:bg-[#0B2545] selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataJsonLd),
          }}
        />
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
