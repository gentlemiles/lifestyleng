'use client';

import { useState } from 'react';
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import {
  submitFibrexEnquiryAction,
  submitMtnDistributionAction,
} from '@/server/actions';
import type { FibrexRequestType } from '@/types';

const ABUJA_FIBER_DISTRICTS = [
  'Wuye District',
  'Maitama',
  'Prince & Princess Estate, Kaura',
  'Guzape District',
  'Jabi Lake',
  'Asokoro',
  'Garki II',
  'Life Camp',
  'Katampe Extension',
  'Mabushi',
  'Apo Legislative Quarters',
];

const FIBREX_SPEED_TIERS = [
  {
    speed: '30 Mbps',
    name: 'FibreX Lite',
    description: 'Great for everyday home browsing, remote work, and streaming.',
    priceLabel: '₦25,000',
    features: [
      'Unlimited monthly data',
      'Dual-band Wi-Fi 5 router included',
      'Connects up to 12 devices',
    ],
    featured: false,
  },
  {
    speed: '100 Mbps',
    name: 'FibreX Pro',
    description:
      'Built for 4K streaming, video calls, and busy family households.',
    priceLabel: '₦45,000',
    features: [
      'Unlimited monthly data',
      'Wi-Fi 6 Gigabit router included',
      'Connects up to 35 devices',
    ],
    featured: true,
  },
  {
    speed: '250 Mbps',
    name: 'FibreX Ultra',
    description: 'High-capacity fiber for large duplexes and office teams.',
    priceLabel: '₦90,000',
    features: [
      'Unlimited monthly data',
      'Static IP option available',
      'Priority technician support',
    ],
    featured: false,
  },
];

export function FibrexCoverageCard() {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [abujaDistrict, setAbujaDistrict] = useState('Kaura District');
  const [estateName, setEstateName] = useState(
    'Prince & Princess Estate, Kaura'
  );
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingType, setBuildingType] = useState<
    'RESIDENTIAL_SINGLE' | 'ESTATE_COMPOUND' | 'OFFICE_COMPLEX'
  >('ESTATE_COMPOUND');
  const [requestType, setRequestType] =
    useState<FibrexRequestType>('NEW_INSTALLATION');
  const [preferredPlan, setPreferredPlan] = useState(
    'FibreX Pro — 100 Mbps (₦45,000/mo)'
  );
  const [result, setResult] = useState<{
    referenceCode: string;
    whatsappAvailabilityUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);
    setIsPending(true);

    try {
      const res = await submitFibrexEnquiryAction({
        customerName,
        customerPhone,
        customerEmail: customerEmail.trim() || undefined,
        abujaDistrict,
        estateName,
        streetAddress,
        buildingType,
        requestType,
        preferredPlan,
        mtnDisclaimerAccepted: true,
      });

      if (res.error) {
        setErrorMsg(res.error.message);
        return;
      }
      setResult(res.data);
    } catch {
      setErrorMsg(
        'Unable to submit your FibreX enquiry right now. Please try again.'
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-12">
      <div
        id="fibrex-checker-card"
        className="rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-8"
      >
        <div className="border-b border-black/[0.06] pb-5">
          <h2
            id="fibrex-coverage-heading"
            className="font-display text-xl font-bold text-[#1B1B1D]"
          >
            Check FibreX Coverage in Your Area
          </h2>
          <p className="mt-1 text-xs text-[#44474E]">
            Enter your Abuja estate and street address below so we can confirm
            fiber availability with MTN.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ['NEW_INSTALLATION', 'New FibreX Installation'],
                ['COVERAGE_CHECK', 'Coverage Check'],
                ['SUBSCRIPTION_RENEWAL', 'Subscription Renewal'],
                ['APPOINTMENT_BOOKING', 'Installation Appointment'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setRequestType(id)}
                className={`rounded-full px-4 py-2 text-xs font-medium transition ${
                  requestType === id
                    ? 'bg-[#001026] text-white font-semibold'
                    : 'bg-[#F5F5F7] text-[#1B1B1D] hover:bg-[#EAE7EA]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="fibrex-name"
                className="mb-1 block text-xs font-medium text-[#1B1B1D]"
              >
                Full Name
              </label>
              <input
                id="fibrex-name"
                type="text"
                placeholder="Your full name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
              />
            </div>

            <div>
              <label
                htmlFor="fibrex-phone"
                className="mb-1 block text-xs font-medium text-[#1B1B1D]"
              >
                WhatsApp / Phone Number
              </label>
              <input
                id="fibrex-phone"
                type="tel"
                placeholder="+234 806 491 2969"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
              />
            </div>

            <div>
              <label
                htmlFor="fibrex-estate"
                className="mb-1 block text-xs font-medium text-[#1B1B1D]"
              >
                Abuja District or Estate
              </label>
              <input
                id="fibrex-estate"
                type="text"
                list="abuja-estates-list"
                placeholder="e.g. Prince & Princess Estate, Kaura"
                value={estateName}
                onChange={(e) => {
                  setEstateName(e.target.value);
                  setAbujaDistrict(e.target.value);
                }}
                required
                className="h-11 w-full rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
              />
              <datalist id="abuja-estates-list">
                {ABUJA_FIBER_DISTRICTS.map((d) => (
                  <option key={d} value={d} />
                ))}
              </datalist>
            </div>

            <div>
              <label
                htmlFor="fibrex-street"
                className="mb-1 block text-xs font-medium text-[#1B1B1D]"
              >
                Street Address &amp; House Number
              </label>
              <input
                id="fibrex-street"
                type="text"
                placeholder="House number, street, and nearest landmark"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                required
                className="h-11 w-full rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
              />
            </div>

            <div>
              <label
                htmlFor="fibrex-plan"
                className="mb-1 block text-xs font-medium text-[#1B1B1D]"
              >
                Preferred Monthly Plan
              </label>
              <select
                id="fibrex-plan"
                value={preferredPlan}
                onChange={(e) => setPreferredPlan(e.target.value)}
                className="h-11 w-full rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
              >
                <option value="FibreX Lite — 30 Mbps (₦25,000/mo)">
                  FibreX Lite — 30 Mbps (₦25,000/mo)
                </option>
                <option value="FibreX Pro — 100 Mbps (₦45,000/mo)">
                  FibreX Pro — 100 Mbps (₦45,000/mo)
                </option>
                <option value="FibreX Ultra — 250 Mbps (₦90,000/mo)">
                  FibreX Ultra — 250 Mbps (₦90,000/mo)
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="fibrex-building"
                  className="mb-1 block text-xs font-medium text-[#1B1B1D]"
                >
                  Building Type
                </label>
                <select
                  id="fibrex-building"
                  value={buildingType}
                  onChange={(e) =>
                    setBuildingType(e.target.value as typeof buildingType)
                  }
                  className="h-11 w-full rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3 text-xs text-[#1B1B1D]"
                >
                  <option value="ESTATE_COMPOUND">Estate Compound</option>
                  <option value="RESIDENTIAL_SINGLE">Standalone Home</option>
                  <option value="OFFICE_COMPLEX">Office Building</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="fibrex-email"
                  className="mb-1 block text-xs font-medium text-[#1B1B1D]"
                >
                  Email (Optional)
                </label>
                <input
                  id="fibrex-email"
                  type="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="h-11 w-full rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3 text-xs text-[#1B1B1D]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#FFFBEB] p-3.5 text-xs text-[#B45309]">
            <strong>Note:</strong> Coverage, installation, speed and service
            availability are subject to MTN confirmation.
          </div>

          {errorMsg ? (
            <p role="alert" className="text-xs font-semibold text-[#BA1A1A]">
              {errorMsg}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FFCC00] px-7 py-3.5 text-xs font-bold text-[#001026] transition hover:bg-[#E6B800]"
            >
              <span>CHECK FIBREX AVAILABILITY IN MY AREA</span>
            </button>

            {result ? (
              <a
                href={result.whatsappAvailabilityUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3.5 text-xs font-bold text-white"
              >
                <MessageCircle className="h-4 w-4" />
                Ref {result.referenceCode} • Continue on WhatsApp
              </a>
            ) : null}

            <a
              href="tel:+2349134275487"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#44474E] hover:text-[#1B1B1D]"
            >
              <Phone className="h-3.5 w-3.5" />
              FibreX Desk: +234 913 427 5487
            </a>
          </div>
        </form>
      </div>

      <div className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
            Monthly FibreX Plans
          </h2>
          <p className="text-sm text-[#44474E]">
            Unlimited home and office fiber plans in Abuja.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {FIBREX_SPEED_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`flex flex-col justify-between rounded-2xl bg-white p-6 ${
                tier.featured
                  ? 'border-2 border-[#001026]'
                  : 'border border-black/[0.06]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-[#1B1B1D]">
                    {tier.name}
                  </h3>
                  <span className="rounded-full bg-[#F5F5F7] px-3 py-1 text-xs font-semibold text-[#1B1B1D]">
                    {tier.speed}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-[#44474E]">
                  {tier.description}
                </p>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-display text-2xl font-bold text-[#1B1B1D] tabular-nums">
                    {tier.priceLabel}
                  </span>
                  <span className="text-xs text-[#44474E]">/ month</span>
                </div>

                <ul className="mt-4 space-y-2 text-xs text-[#1B1B1D]">
                  {tier.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#006A6A]" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#fibrex-checker-card"
                onClick={() =>
                  setPreferredPlan(
                    `${tier.name} — ${tier.speed} (${tier.priceLabel}/mo)`
                  )
                }
                className="mt-6 flex w-full items-center justify-center rounded-full bg-[#001026] py-2.5 text-xs font-semibold text-white transition hover:bg-[#0B2545]"
              >
                Select {tier.name}
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-6">
        <h3 className="font-display text-base font-bold text-[#1B1B1D]">
          Abuja Districts Covered
        </h3>
        <p className="mt-1 text-xs text-[#44474E]">
          Click your district to fill it into the form above:
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ABUJA_FIBER_DISTRICTS.map((district) => (
            <a
              key={district}
              href="#fibrex-checker-card"
              onClick={() => {
                setEstateName(district);
                setAbujaDistrict(district);
              }}
              className="rounded-full border border-black/[0.08] bg-[#FAFAFC] px-3.5 py-1.5 text-xs font-medium text-[#1B1B1D] hover:bg-[#F0EDEF]"
            >
              {district}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MtnB2bDistributionForm() {
  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [distributionCategory, setDistributionCategory] = useState<
    | 'BULK_5G_ROUTERS'
    | 'MIFI_FLEET'
    | 'ENTERPRISE_CONNECTIVITY'
    | 'TRADE_SUB_DEALER'
  >('BULK_5G_ROUTERS');
  const [estimatedUnits, setEstimatedUnits] = useState(10);
  const [deliveryLocation, setDeliveryLocation] = useState('Garki, Abuja');
  const [result, setResult] = useState<{
    referenceCode: string;
    whatsappB2bUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);
    setIsPending(true);
    try {
      const res = await submitMtnDistributionAction({
        companyName,
        contactPerson,
        contactPhone,
        contactEmail,
        distributionCategory,
        estimatedUnits: Math.max(5, Math.floor(estimatedUnits) || 5),
        deliveryLocation,
      });
      if (res.error) {
        setErrorMsg(res.error.message);
        return;
      }
      setResult(res.data);
    } catch {
      setErrorMsg(
        'Unable to submit your bulk quote request right now. Please try again.'
      );
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-8">
      <h3
        id="mtn-b2b-heading"
        className="font-display text-lg font-bold text-[#1B1B1D]"
      >
        Bulk &amp; Corporate Hardware Orders (5+ Units)
      </h3>
      <p className="mt-1 text-xs text-[#44474E]">
        Order MTN 5G routers or pocket MiFis in bulk for offices, hotels, and
        trade distribution.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <input
          type="text"
          aria-label="Company name"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
        />
        <input
          type="text"
          aria-label="Contact person name"
          placeholder="Contact Person"
          value={contactPerson}
          onChange={(e) => setContactPerson(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
        />
        <input
          type="tel"
          aria-label="Contact phone number"
          placeholder="Phone (+2348064912969)"
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
        />
        <input
          type="email"
          aria-label="Work email address"
          placeholder="Work Email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
        />
        <select
          aria-label="Distribution hardware category"
          value={distributionCategory}
          onChange={(e) =>
            setDistributionCategory(
              e.target.value as typeof distributionCategory
            )
          }
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
        >
          <option value="BULK_5G_ROUTERS">Bulk MTN 5G Routers</option>
          <option value="MIFI_FLEET">4G Pocket MiFi Fleet</option>
          <option value="ENTERPRISE_CONNECTIVITY">
            Office Connectivity Setup
          </option>
          <option value="TRADE_SUB_DEALER">Trade Sub-Dealer Order</option>
        </select>
        <input
          type="number"
          aria-label="Estimated unit quantity (minimum 5)"
          min={5}
          value={estimatedUnits}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            setEstimatedUnits(Number.isFinite(parsed) && parsed >= 5 ? parsed : 5);
          }}
          placeholder="Quantity (Min 5)"
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
        />
        <input
          type="text"
          aria-label="Delivery location"
          placeholder="Delivery Location (e.g. Garki, Abuja)"
          value={deliveryLocation}
          onChange={(e) => setDeliveryLocation(e.target.value)}
          required
          className="sm:col-span-2 h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs text-[#1B1B1D]"
        />

        {errorMsg ? (
          <p
            role="alert"
            className="sm:col-span-2 text-xs font-medium text-[#BA1A1A]"
          >
            {errorMsg}
          </p>
        ) : null}

        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="rounded-full bg-[#001026] px-6 py-3 text-xs font-semibold text-white hover:bg-[#0B2545] disabled:opacity-50"
          >
            {isPending ? 'Submitting Request...' : 'Request Bulk Quote'}
          </button>

          {result ? (
            <a
              href={result.whatsappB2bUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-5 py-3 text-xs font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Ref {result.referenceCode} • Send to WhatsApp
            </a>
          ) : null}
        </div>
      </form>
    </div>
  );
}
