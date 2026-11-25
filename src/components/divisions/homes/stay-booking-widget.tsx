'use client';

import { useEffect, useState } from 'react';
import {
  Calendar,
  Users,
  ShieldCheck,
  Building2,
  MessageCircle,
  MapPin,
} from 'lucide-react';
import type { StayBookingMode, StayPropertyView } from '@/types';
import { calculateStayQuoteKobo, formatKoboToNaira } from '@/lib/money';
import {
  submitPropertyMgmtAction,
  submitStayBookingAction,
} from '@/server/actions';

interface StayBookingWidgetProps {
  property: StayPropertyView;
  selectedRoomId?: string | null;
  onSelectRoomId?: (roomId: string | null) => void;
}

export function StayBookingWidget({
  property,
  selectedRoomId: controlledRoomId,
  onSelectRoomId,
}: StayBookingWidgetProps) {
  const [bookingMode, setBookingMode] = useState<StayBookingMode>('SHORT_LET');
  const [rentalUnitScope, setRentalUnitScope] = useState<
    'WHOLE_APARTMENT' | 'PER_ROOM'
  >(controlledRoomId ? 'PER_ROOM' : 'WHOLE_APARTMENT');
  const [internalRoomId, setInternalRoomId] = useState<string | null>(
    property.rooms[0]?.id ?? null
  );

  useEffect(() => {
    if (controlledRoomId) {
      setRentalUnitScope('PER_ROOM');
      setInternalRoomId(controlledRoomId);
    } else if (controlledRoomId === null) {
      setRentalUnitScope('WHOLE_APARTMENT');
    }
  }, [controlledRoomId]);

  const activeRoomId = controlledRoomId ?? internalRoomId;
  const selectedRoom =
    rentalUnitScope === 'PER_ROOM'
      ? (property.rooms.find((r) => r.id === activeRoomId) ??
        property.rooms[0] ??
        null)
      : null;

  const activeNightlyRateKobo = selectedRoom
    ? selectedRoom.nightlyRateKobo
    : property.nightlyRateKobo;
  const activeWeeklyRateKobo = selectedRoom
    ? selectedRoom.nightlyRateKobo * 7
    : property.weeklyRateKobo;
  const activeMonthlyRateKobo = selectedRoom
    ? selectedRoom.nightlyRateKobo * 28
    : property.monthlyRateKobo;
  const maxAllowedGuests = selectedRoom
    ? selectedRoom.occupancy
    : property.maxGuests;

  const [checkInDate, setCheckInDate] = useState('2026-12-01');
  const [checkOutDate, setCheckOutDate] = useState('2026-12-05');
  const [guestsCount, setGuestsCount] = useState(2);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setGuestsCount((prev) => Math.max(1, Math.min(prev, maxAllowedGuests)));
  }, [maxAllowedGuests]);

  const hasValidDateRange =
    Boolean(checkInDate) &&
    Boolean(checkOutDate) &&
    new Date(checkOutDate).getTime() > new Date(checkInDate).getTime();

  let quote = {
    nightsCount: 4,
    appliedTier: 'NIGHTLY' as 'NIGHTLY' | 'WEEKLY' | 'MONTHLY',
    staySubtotalKobo: activeNightlyRateKobo * 4,
    cautionDepositKobo: property.cautionDepositKobo,
    totalAmountKobo: activeNightlyRateKobo * 4 + property.cautionDepositKobo,
  };

  if (hasValidDateRange) {
    try {
      quote = calculateStayQuoteKobo({
        checkInDate,
        checkOutDate,
        bookingMode,
        nightlyRateKobo: activeNightlyRateKobo,
        weeklyRateKobo: activeWeeklyRateKobo,
        monthlyRateKobo: activeMonthlyRateKobo,
        cautionDepositKobo: property.cautionDepositKobo,
      });
    } catch {
      // Keep default quote preview if dates are invalid while user edits
    }
  }

  function handleScopeChange(scope: 'WHOLE_APARTMENT' | 'PER_ROOM') {
    setRentalUnitScope(scope);
    if (scope === 'WHOLE_APARTMENT') {
      onSelectRoomId?.(null);
    } else {
      const nextId = activeRoomId ?? property.rooms[0]?.id ?? null;
      setInternalRoomId(nextId);
      onSelectRoomId?.(nextId);
    }
  }

  function handleRoomChange(roomId: string) {
    setRentalUnitScope('PER_ROOM');
    setInternalRoomId(roomId);
    onSelectRoomId?.(roomId);
  }

  async function handleBookingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setWhatsappUrl(null);

    if (!hasValidDateRange) {
      setErrorMessage('Check-out date must be at least 1 night after check-in.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitStayBookingAction({
        propertyId: property.id,
        roomId: selectedRoom?.id,
        guestName,
        guestEmail,
        guestPhone,
        bookingMode,
        checkInDate,
        checkOutDate,
        guestsCount: Math.max(1, Math.min(guestsCount, maxAllowedGuests)),
        specialRequests: selectedRoom
          ? `Selected Room: ${selectedRoom.name} (${selectedRoom.roomSizeSqm} sqm, ${selectedRoom.bedType}, ${formatKoboToNaira(selectedRoom.nightlyRateKobo)}/night)`
          : 'Whole Apartment Reservation',
      });

      if (response.error) {
        setErrorMessage(response.error.message);
        return;
      }

      setSuccessMessage(
        `Reservation ${response.data.bookingReference} logged (${
          selectedRoom ? selectedRoom.name : 'Whole Apartment'
        })! Total: ${formatKoboToNaira(response.data.totalAmountKobo)}.`
      );
      setWhatsappUrl(response.data.whatsappConfirmUrl);
    } catch {
      setErrorMessage(
        'Unable to submit your reservation right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      id="stay-booking-widget"
      className="rounded-[24px] border border-black/[0.08] bg-white p-6 shadow-[var(--shadow-rest)]"
    >
      <div className="flex items-start justify-between gap-2 border-b border-black/[0.06] pb-4">
        <div>
          <span className="inline-block rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#008080]">
            {property.category} • {property.estateName}
          </span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold tabular-nums text-[#1D1D1F]">
              {formatKoboToNaira(activeNightlyRateKobo)}
            </span>
            <span className="text-xs text-[#6E6E73]">
              / night ({selectedRoom ? selectedRoom.name : 'Whole Apartment'})
            </span>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[#F5F5F7] px-3 py-1 text-xs font-semibold text-[#1D1D1F]">
          Max {maxAllowedGuests} Persons
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-black/[0.05] bg-[#FAFAFC] p-3 text-[11px] text-[#44474E] space-y-1">
        <p className="flex items-start gap-1.5 font-medium text-[#1B1B1D]">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006A6A]" />
          <span>{property.address}</span>
        </p>
        <p className="pl-5">
          {property.bedrooms} rooms all en-suite • Max {property.maxGuests}{' '}
          persons • Can be rented <strong>per room</strong> or{' '}
          <strong>whole apartment</strong> •{' '}
          <strong className="text-[#BA1A1A]">No pets allowed</strong>
        </p>
      </div>

      {property.rooms.length > 0 && (
        <div className="mt-3 space-y-2.5">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-[#F5F5F7] p-1">
            <button
              type="button"
              onClick={() => handleScopeChange('WHOLE_APARTMENT')}
              className={`rounded-full py-2 text-xs font-semibold transition ${
                rentalUnitScope === 'WHOLE_APARTMENT'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73]'
              }`}
            >
              Whole Apartment ({property.bedrooms} Rooms)
            </button>
            <button
              type="button"
              onClick={() => handleScopeChange('PER_ROOM')}
              className={`rounded-full py-2 text-xs font-semibold transition ${
                rentalUnitScope === 'PER_ROOM'
                  ? 'bg-white text-[#1D1D1F] shadow-xs'
                  : 'text-[#6E6E73]'
              }`}
            >
              Rent Per En-Suite Room
            </button>
          </div>

          {rentalUnitScope === 'PER_ROOM' && (
            <label className="block">
              <span className="block text-[11px] font-semibold text-[#44474E]">
                Choose Individual En-Suite Room
              </span>
              <select
                aria-label="Choose individual room"
                value={selectedRoom?.id ?? ''}
                onChange={(e) => handleRoomChange(e.target.value)}
                className="mt-1 w-full rounded-[10px] border border-black/[0.12] bg-white px-3 py-2 text-xs font-semibold text-[#1D1D1F]"
              >
                {property.rooms.map((rm) => (
                  <option key={rm.id} value={rm.id}>
                    {rm.name} — {formatKoboToNaira(rm.nightlyRateKobo)}/night (
                    {rm.roomSizeSqm} sqm • {rm.bedType} • Max {rm.occupancy})
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-1 rounded-full bg-[#F5F5F7] p-1">
        <button
          type="button"
          onClick={() => {
            setBookingMode('SHORT_LET');
            setCheckInDate('2026-12-01');
            setCheckOutDate('2026-12-05');
          }}
          className={`rounded-full py-2 text-xs font-semibold transition ${
            bookingMode === 'SHORT_LET'
              ? 'bg-white text-[#1D1D1F] shadow-xs'
              : 'text-[#6E6E73]'
          }`}
        >
          Short-Let Stay
        </button>
        <button
          type="button"
          onClick={() => {
            setBookingMode('FURNISHED_ACCOMMODATION');
            setCheckInDate('2026-12-01');
            setCheckOutDate('2026-12-29');
          }}
          className={`rounded-full py-2 text-xs font-semibold transition ${
            bookingMode === 'FURNISHED_ACCOMMODATION'
              ? 'bg-white text-[#1D1D1F] shadow-xs'
              : 'text-[#6E6E73]'
          }`}
        >
          Furnished Stay (Wk/Mo)
        </button>
      </div>

      <form onSubmit={handleBookingSubmit} className="mt-4 space-y-3">
        <div className="grid grid-cols-2 gap-2.5">
          <label className="block">
            <span className="flex items-center gap-1 text-xs font-medium text-[#6E6E73]">
              <Calendar className="h-3.5 w-3.5" /> Check-In
            </span>
            <input
              type="date"
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.target.value)}
              required
              className="mt-1 w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3 py-2 text-xs text-[#1D1D1F]"
            />
          </label>
          <label className="block">
            <span className="flex items-center gap-1 text-xs font-medium text-[#6E6E73]">
              <Calendar className="h-3.5 w-3.5" /> Check-Out
            </span>
            <input
              type="date"
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.target.value)}
              required
              className="mt-1 w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3 py-2 text-xs text-[#1D1D1F]"
            />
          </label>
        </div>

        <label className="block">
          <span className="flex items-center gap-1 text-xs font-medium text-[#6E6E73]">
            <Users className="h-3.5 w-3.5" /> Number of Guests (Max{' '}
            {maxAllowedGuests})
          </span>
          <input
            type="number"
            min={1}
            max={maxAllowedGuests}
            value={guestsCount}
            onChange={(e) => {
              const parsed = Number(e.target.value);
              setGuestsCount(
                Number.isFinite(parsed) && parsed >= 1
                  ? Math.min(Math.floor(parsed), maxAllowedGuests)
                  : 1
              );
            }}
            className="mt-1 w-full rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3 py-2 text-xs text-[#1D1D1F]"
          />
        </label>

        {!hasValidDateRange ? (
          <p role="alert" className="text-xs font-medium text-[#DC2626]">
            Check-out date must be after check-in date.
          </p>
        ) : null}

        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
          <input
            type="text"
            aria-label="Guest full name"
            placeholder="Full Name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3 py-2 text-xs text-[#1D1D1F]"
          />
          <input
            type="email"
            aria-label="Guest email address"
            placeholder="Email Address"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            required
            className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3 py-2 text-xs text-[#1D1D1F]"
          />
          <input
            type="tel"
            aria-label="Guest Nigerian phone number"
            placeholder="Phone (+234...)"
            value={guestPhone}
            onChange={(e) => setGuestPhone(e.target.value)}
            required
            className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3 py-2 text-xs text-[#1D1D1F]"
          />
        </div>

        <div className="rounded-[14px] bg-[#F5F5F7] p-3.5 space-y-1.5 text-xs">
          <div className="flex justify-between text-[#6E6E73]">
            <span>
              {quote.nightsCount} Night(s) •{' '}
              {selectedRoom ? selectedRoom.name : 'Whole Apartment'}
            </span>
            <span className="font-semibold text-[#1D1D1F] tabular-nums">
              {formatKoboToNaira(quote.staySubtotalKobo)}
            </span>
          </div>
          <div className="flex justify-between text-[#6E6E73]">
            <span>Refundable Caution Deposit</span>
            <span className="font-semibold text-[#1D1D1F] tabular-nums">
              {formatKoboToNaira(quote.cautionDepositKobo)}
            </span>
          </div>
          <div className="flex justify-between border-t border-black/[0.08] pt-2 text-sm font-bold text-[#1D1D1F]">
            <span>Total Reservation</span>
            <span className="tabular-nums">
              {formatKoboToNaira(quote.totalAmountKobo)}
            </span>
          </div>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="rounded-[12px] border border-red-200 bg-red-50 p-3 text-xs font-medium text-[#DC2626]"
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div
            role="status"
            className="rounded-[12px] bg-[#ECFDF5] p-3 text-xs font-medium text-[#047857]"
          >
            {successMessage}
          </div>
        ) : null}

        <div className="space-y-2 pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#1D1D1F] py-3 text-xs font-semibold text-white transition hover:bg-black/85 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Checking Availability...'
              : selectedRoom
                ? `Reserve ${selectedRoom.name} Online`
                : 'Reserve Whole Apartment Online'}
          </button>

          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#10B981] py-3 text-xs font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Confirm Reservation on WhatsApp
            </a>
          ) : null}
        </div>

        <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#86868B]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#008080]" />
          Instant concurrency lock prevents double-booking
        </p>
      </form>
    </div>
  );
}

export function PropertyMgmtForm() {
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [district, setDistrict] = useState('Kaura District');
  const [estateName, setEstateName] = useState('Prince & Princess Estate');
  const [propertyType, setPropertyType] = useState<
    'DUPLEX' | 'TERRACE' | 'APARTMENT' | 'PENTHOUSE' | 'COMMERCIAL_BLOCK'
  >('DUPLEX');
  const [bedrooms, setBedrooms] = useState(4);
  const [furnishingStatus, setFurnishingStatus] = useState<
    'FULLY_FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED'
  >('FULLY_FURNISHED');
  const [targetManagementModel, setTargetManagementModel] = useState<
    | 'SHORT_LET_MANAGEMENT'
    | 'CORPORATE_FURNISHED_LEASE'
    | 'FULL_FACILITY_MANAGEMENT'
  >('SHORT_LET_MANAGEMENT');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<{
    referenceCode: string;
    whatsappPartnerUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const res = await submitPropertyMgmtAction({
        ownerName,
        ownerEmail,
        ownerPhone,
        propertyType,
        district,
        estateName,
        bedrooms: Math.max(1, Math.min(20, Math.floor(bedrooms) || 1)),
        unitsCount: 1,
        furnishingStatus,
        targetManagementModel,
        notes,
      });
      if (res.error) {
        setErrorMsg(res.error.message);
        return;
      }
      setResult(res.data);
    } catch {
      setErrorMsg('Unable to submit your proposal right now. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-black/[0.08] bg-white p-6 sm:p-8 shadow-[var(--shadow-rest)]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#0B2545] text-white">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-[#1D1D1F]">
            Property &amp; Apartment Management Onboarding
          </h3>
          <p className="text-xs text-[#6E6E73]">
            Partner with Lifestyle Boutique (Homes) to manage your Abuja duplex,
            apartment, or residential block.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <input
          type="text"
          placeholder="Property Owner Full Name"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          required
          className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
        />
        <input
          type="email"
          placeholder="Owner Email Address"
          value={ownerEmail}
          onChange={(e) => setOwnerEmail(e.target.value)}
          required
          className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
        />
        <input
          type="tel"
          placeholder="Nigerian Phone (+2348064912969)"
          value={ownerPhone}
          onChange={(e) => setOwnerPhone(e.target.value)}
          required
          className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
        />
        <input
          type="text"
          placeholder="Abuja District (e.g. Kaura, Wuye, Maitama, Guzape)"
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          required
          className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
        />
        <input
          type="text"
          placeholder="Estate Name (e.g. Prince & Princess Estate)"
          value={estateName}
          onChange={(e) => setEstateName(e.target.value)}
          className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            aria-label="Property type"
            value={propertyType}
            onChange={(e) =>
              setPropertyType(e.target.value as typeof propertyType)
            }
            className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3 py-2.5 text-xs"
          >
            <option value="DUPLEX">Duplex</option>
            <option value="TERRACE">Terrace</option>
            <option value="APARTMENT">Apartment</option>
            <option value="PENTHOUSE">Penthouse</option>
            <option value="COMMERCIAL_BLOCK">Multi-Unit Block</option>
          </select>
          <input
            type="number"
            aria-label="Number of bedrooms"
            min={1}
            max={20}
            value={bedrooms}
            onChange={(e) => setBedrooms(Number(e.target.value) || 1)}
            placeholder="Bedrooms"
            className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3 py-2.5 text-xs"
          />
        </div>
        <select
          aria-label="Furnishing status"
          value={furnishingStatus}
          onChange={(e) =>
            setFurnishingStatus(e.target.value as typeof furnishingStatus)
          }
          className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
        >
          <option value="FULLY_FURNISHED">Fully Furnished</option>
          <option value="SEMI_FURNISHED">Semi-Furnished</option>
          <option value="UNFURNISHED">Unfurnished</option>
        </select>
        <select
          aria-label="Target management model"
          value={targetManagementModel}
          onChange={(e) =>
            setTargetManagementModel(
              e.target.value as typeof targetManagementModel
            )
          }
          className="rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] px-3.5 py-2.5 text-xs"
        >
          <option value="SHORT_LET_MANAGEMENT">
            Turnkey Short-Let Management
          </option>
          <option value="CORPORATE_FURNISHED_LEASE">
            Corporate Furnished Lease
          </option>
          <option value="FULL_FACILITY_MANAGEMENT">
            Full Facility &amp; Tenant Management
          </option>
        </select>
        <textarea
          rows={3}
          aria-label="Additional property details"
          placeholder="Additional details about your property (power backup, security, target yield)..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="sm:col-span-2 rounded-[10px] border border-black/[0.1] bg-[#FAFAFC] p-3.5 text-xs"
        />

        {errorMsg ? (
          <p
            role="alert"
            className="sm:col-span-2 text-xs font-medium text-[#DC2626]"
          >
            {errorMsg}
          </p>
        ) : null}

        <div className="sm:col-span-2 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#1D1D1F] px-6 py-3 text-xs font-semibold text-white hover:bg-black/85 disabled:opacity-50"
          >
            {isSubmitting
              ? 'Submitting Proposal...'
              : 'Submit Property Management Proposal'}
          </button>

          {result ? (
            <a
              href={result.whatsappPartnerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-5 py-3 text-xs font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Ref {result.referenceCode} • Connect with Homes Desk on WhatsApp
            </a>
          ) : null}
        </div>
      </form>
    </div>
  );
}
