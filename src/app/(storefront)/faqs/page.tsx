'use client';

import { useState } from 'react';
import { Search, MessageCircle } from 'lucide-react';
import { OFFICIAL_DISPLAY_PHONES, buildWhatsAppUrl } from '@/lib/whatsapp';

type FaqCategory =
  | 'all'
  | 'boutique'
  | 'fibrex'
  | 'shortlet'
  | 'fleet'
  | 'security';

interface FaqItem {
  id: string;
  category: Exclude<FaqCategory, 'all'>;
  categoryLabel: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'boutique',
    categoryLabel: 'Wuye Boutique',
    question:
      'Where is the physical boutique located and can I pick up orders in person?',
    answer:
      'Our physical store is at Suite 83 / Block B70, H&A Plaza, Wuye District, Abuja (Mon–Sat: 9:00 AM – 7:00 PM). You can shop in person or choose Free Store Pickup (₦0) at checkout.',
  },
  {
    id: 'faq-2',
    category: 'boutique',
    categoryLabel: '24-Hour Return Policy',
    question: 'How does your 24-hour return policy work?',
    answer:
      'Returns and size exchanges must be requested within 24 hours of receipt (from when your order is delivered or picked up at Suite 83, H&A Plaza, Wuye). Items must be unworn, unwashed, and have their original tags attached.',
  },
  {
    id: 'faq-3',
    category: 'fibrex',
    categoryLabel: 'MTN FibreX',
    question: 'How do I check if MTN FibreX is available at my Abuja address?',
    answer:
      'Enter your estate and street address on our MTN FibreX page and click CHECK FIBREX AVAILABILITY IN MY AREA. Please note that coverage, installation, speed and service availability are subject to MTN confirmation.',
  },
  {
    id: 'faq-4',
    category: 'fibrex',
    categoryLabel: 'MTN FibreX',
    question: 'Can you help with monthly FibreX subscription renewals?',
    answer:
      'Yes. Select Subscription Renewal on the MTN FibreX page or message our FibreX desk on +234 913 427 5487 or +234 806 491 2969 with your registered number.',
  },
  {
    id: 'faq-5',
    category: 'shortlet',
    categoryLabel: 'Kaura Shortlet',
    question:
      'What are the room specifications, rates, and rental options for the Kaura 4-Bedroom Duplex?',
    answer:
      'Our 4-Bedroom Duplex at Prince & Princess Estate, Kaura District, Abuja features 4 rooms all en-suite with 2 double beds and 4 single beds (max 8 persons; no pets allowed). It can be rented per room or as the whole apartment (₦120,000 per night for the whole apartment plus a ₦50,000 refundable caution deposit).',
  },
  {
    id: 'faq-6',
    category: 'shortlet',
    categoryLabel: 'Kaura Shortlet',
    question: 'What are the check-in times and house rules?',
    answer:
      'Check-in starts at 2:00 PM and check-out is by 11:00 AM. A valid government ID (NIN, Passport, or Driver’s License) is required at check-in. No pets allowed, no loud parties, and no indoor smoking.',
  },
  {
    id: 'faq-7',
    category: 'fleet',
    categoryLabel: 'Car Hire',
    question:
      'What are your Abuja car hire rates and why do you recommend 2 hours notice?',
    answer:
      'Chauffeur-driven sedans start at ₦45,000/day, Prado SUVs at ₦95,000/day, and HiAce vans at ₦140,000/day. Booking at least 2 hours ahead gives our team time to stage, clean, and inspect your vehicle.',
  },
  {
    id: 'faq-8',
    category: 'fleet',
    categoryLabel: 'Airport & Inter-State',
    question:
      'Do you offer ABV Airport pickups and inter-state trips outside Abuja?',
    answer:
      'Yes. We provide flight-tracked pickups and drop-offs at Nnamdi Azikiwe International Airport (ABV), chauffeur-driven trips across all 36 states, and parcel/cargo delivery.',
  },
  {
    id: 'faq-9',
    category: 'security',
    categoryLabel: 'Payments',
    question: 'Which payment methods do you accept?',
    answer:
      'Online orders are processed securely through Paystack and Flutterwave (cards, bank transfer, and USSD). Walk-in customers can also pay via POS at Suite 83, H&A Plaza, Wuye.',
  },
];

const CATEGORY_TABS: { id: FaqCategory; label: string }[] = [
  { id: 'all', label: 'All (9)' },
  { id: 'boutique', label: 'Boutique & Returns' },
  { id: 'fibrex', label: 'MTN Services' },
  { id: 'shortlet', label: 'Kaura Shortlet' },
  { id: 'fleet', label: 'Car Hire' },
  { id: 'security', label: 'Payments' },
];

export default function FaqsPage() {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCat =
      selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6 sm:py-14">
      <section className="space-y-4">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#1B1B1D] sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <p className="text-sm text-[#44474E]">
          Answers about our Wuye store, 24-hour return policy, MTN FibreX, Kaura
          4-bedroom duplex, and car hire.
        </p>

        <div className="relative flex items-center rounded-2xl border border-black/[0.1] bg-white">
          <Search className="pointer-events-none absolute left-4 h-4 w-4 text-[#44474E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions..."
            className="w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-4 text-sm text-[#1B1B1D] focus:outline-none"
          />
        </div>
      </section>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {CATEGORY_TABS.map((tab) => {
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-[#001026] text-white font-semibold'
                  : 'border border-black/[0.08] bg-white text-[#44474E] hover:text-[#1B1B1D]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filteredItems.map((item, idx) => (
          <details
            key={item.id}
            open={idx < 2}
            className="rounded-2xl border border-black/[0.06] bg-white p-5"
          >
            <summary className="cursor-pointer list-none space-y-1">
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#006A6A]">
                {item.categoryLabel}
              </span>
              <span className="block font-display text-base font-bold text-[#1B1B1D]">
                {item.question}
              </span>
            </summary>
            <p className="mt-3 border-t border-black/[0.06] pt-3 text-xs leading-relaxed text-[#44474E]">
              {item.answer}
            </p>
          </details>
        ))}
      </div>

      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-black/[0.06] bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-display text-base font-bold text-[#1B1B1D]">
            Still have a question?
          </p>
          <p className="text-xs text-[#44474E]">
            Message our Abuja team on WhatsApp ({OFFICIAL_DISPLAY_PHONES.PRIMARY}
            ).
          </p>
        </div>
        <a
          href={buildWhatsAppUrl('Hello LifestyleNG, I have a question.')}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-5 py-2.5 text-xs font-semibold text-white"
        >
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}
