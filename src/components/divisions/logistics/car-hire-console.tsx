'use client';

import { useEffect, useState } from 'react';
import {
  Car,
  Plane,
  AlertTriangle,
  MessageCircle,
  Users,
  Briefcase,
} from 'lucide-react';
import type { CarHireServiceType, FleetVehicleView } from '@/types';
import { formatKoboToNaira } from '@/lib/money';
import { evaluateCarHireLeadTime } from '@/lib/utils';
import {
  submitCarHireBookingAction,
  submitLogisticsShipmentAction,
} from '@/server/actions';

function formatLocalDateTimeInput(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

interface CarHireConsoleProps {
  vehicles: ReadonlyArray<FleetVehicleView>;
}

export function CarHireConsole({ vehicles }: CarHireConsoleProps) {
  const [serviceType, setServiceType] =
    useState<CarHireServiceType>('INTRA_CITY_HIRE');
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    vehicles[0]?.id ?? ''
  );
  const [durationMode, setDurationMode] = useState<
    'HOURLY' | 'DAILY' | 'FIXED_TRANSFER'
  >('DAILY');
  const [hoursOrDays, setHoursOrDays] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [pickupLocation, setPickupLocation] = useState(
    'Suite 83, H&A Plaza, Wuye, Abuja'
  );
  const [destinationLocation, setDestinationLocation] = useState(
    'Maitama, Abuja'
  );
  const [destinationState, setDestinationState] = useState('FCT - Abuja');
  // Initialized empty on SSR to prevent hydration mismatch from Date.now()
  const [pickupTimestamp, setPickupTimestamp] = useState('');
  const [flightNumber, setFlightNumber] = useState('');
  const [result, setResult] = useState<{
    bookingReference: string;
    isUnderTwoHoursNotice: boolean;
    whatsappBookUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fourHoursAhead = new Date(Date.now() + 4 * 60 * 60 * 1000);
    setPickupTimestamp((prev) => prev || formatLocalDateTimeInput(fourHoursAhead));
  }, []);

  useEffect(() => {
    if (
      vehicles.length > 0 &&
      !vehicles.some((v) => v.id === selectedVehicleId)
    ) {
      setSelectedVehicleId(vehicles[0]?.id ?? '');
    }
  }, [vehicles, selectedVehicleId]);

  const selectedVehicle =
    vehicles.find((v) => v.id === selectedVehicleId) ?? vehicles[0];

  const parsedPickupDate = pickupTimestamp ? new Date(pickupTimestamp) : null;
  const isValidPickupDate =
    parsedPickupDate !== null && !Number.isNaN(parsedPickupDate.getTime());
  const leadEval = isValidPickupDate
    ? evaluateCarHireLeadTime(parsedPickupDate)
    : null;

  function handleServiceTypeChange(nextType: CarHireServiceType) {
    setServiceType(nextType);
    if (nextType !== 'INTER_STATE_CHARTER') {
      setDestinationState('FCT - Abuja');
    }
  }

  async function handleCarHireSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);

    if (!selectedVehicle) {
      setErrorMsg('No vehicles are currently available for booking.');
      return;
    }

    if (!isValidPickupDate || !parsedPickupDate) {
      setErrorMsg('Please select a valid pickup date and time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitCarHireBookingAction({
        vehicleId: selectedVehicle.id,
        customerName,
        customerPhone,
        serviceType,
        durationMode:
          serviceType === 'AIRPORT_TRANSFER' ? 'FIXED_TRANSFER' : durationMode,
        hoursOrDays: Math.max(1, Math.min(60, Math.floor(hoursOrDays) || 1)),
        pickupLocation,
        destinationLocation,
        destinationState:
          serviceType === 'INTER_STATE_CHARTER'
            ? destinationState
            : 'FCT - Abuja',
        pickupTimestamp: parsedPickupDate.toISOString(),
        flightNumber:
          serviceType === 'AIRPORT_TRANSFER' ? flightNumber : undefined,
      });

      if (res.error) {
        setErrorMsg(res.error.message);
        return;
      }
      setResult(res.data);
    } catch {
      setErrorMsg(
        'Unable to submit your car hire request right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        {vehicles.map((vehicle) => {
          const isSelected = vehicle.id === selectedVehicle?.id;
          return (
            <div
              key={vehicle.id}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              onClick={() => setSelectedVehicleId(vehicle.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelectedVehicleId(vehicle.id);
                }
              }}
              className={`cursor-pointer rounded-2xl border p-4 transition focus:outline-none focus:ring-2 focus:ring-[#001026] ${
                isSelected
                  ? 'border-[#001026] bg-white ring-2 ring-[#001026]/10'
                  : 'border-black/[0.06] bg-white hover:border-black/20'
              }`}
            >
              <div className="aspect-[16/10] overflow-hidden rounded-xl bg-[#F5F5F7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={vehicle.imageUrl}
                  alt={vehicle.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="mt-3">
                <h3 className="font-display text-sm font-bold text-[#1B1B1D]">
                  {vehicle.name}
                </h3>
                <div className="mt-2 flex items-center gap-3 text-xs text-[#44474E]">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />{' '}
                    {vehicle.passengerCapacity} Seats
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5" />{' '}
                    {vehicle.luggageCapacity} Bags
                  </span>
                </div>
                <div className="mt-3 space-y-1 border-t border-black/[0.06] pt-2.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#44474E]">Abuja Daily:</span>
                    <span className="font-bold text-[#1B1B1D] tabular-nums">
                      {formatKoboToNaira(vehicle.dailyIntraCityRateKobo)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#44474E]">Airport Pickup:</span>
                    <span className="font-bold text-[#1B1B1D] tabular-nums">
                      {formatKoboToNaira(vehicle.airportTransferRateKobo)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/[0.06] pb-4">
          <div>
            <h2
              id="car-hire-console"
              className="font-display text-lg font-bold text-[#1B1B1D]"
            >
              Book a Vehicle &amp; Driver
            </h2>
            <p className="text-xs text-[#44474E]">
              Selected:{' '}
              <strong>{selectedVehicle?.name ?? 'Select a vehicle'}</strong> •
              Please book at least 2 hours ahead when possible.
            </p>
          </div>

          <div
            role="radiogroup"
            aria-label="Car hire service type"
            className="flex flex-wrap gap-1.5"
          >
            {(
              [
                ['INTRA_CITY_HIRE', 'Abuja City Hire', Car],
                ['AIRPORT_TRANSFER', 'ABV Airport Transfer', Plane],
                ['INTER_STATE_CHARTER', 'Inter-State Trip', Car],
              ] as const
            ).map(([typeId, label, Icon]) => (
              <button
                key={typeId}
                type="button"
                role="radio"
                aria-checked={serviceType === typeId}
                onClick={() => handleServiceTypeChange(typeId)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition ${
                  serviceType === typeId
                    ? 'bg-[#001026] text-white font-semibold'
                    : 'bg-[#F5F5F7] text-[#44474E] hover:text-[#1B1B1D]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {leadEval?.isUnderTwoHoursNotice ? (
          <div
            role="status"
            className="mt-4 flex items-start gap-2.5 rounded-xl bg-[#FFFBEB] p-3.5 text-xs text-[#B45309]"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{leadEval.recommendationNotice}</span>
          </div>
        ) : null}

        <form
          onSubmit={handleCarHireSubmit}
          className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <input
            type="text"
            aria-label="Your full name"
            placeholder="Your Full Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
            className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
          />
          <input
            type="tel"
            aria-label="Nigerian phone number"
            placeholder="Phone Number (+2348064912969)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
            className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
          />
          <input
            type="text"
            aria-label="Pickup address or terminal"
            placeholder="Pickup Address or Terminal"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
            required
            className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
          />
          <input
            type="text"
            aria-label="Destination address or city"
            placeholder="Destination Address or City"
            value={destinationLocation}
            onChange={(e) => setDestinationLocation(e.target.value)}
            required
            className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
          />
          <input
            type="datetime-local"
            aria-label="Pickup date and time"
            value={pickupTimestamp}
            onChange={(e) => setPickupTimestamp(e.target.value)}
            required
            className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
          />

          {serviceType === 'AIRPORT_TRANSFER' ? (
            <input
              type="text"
              aria-label="Flight number for ABV airport transfer"
              placeholder="Flight Number (e.g. BA083) — Required for Airport Pickup"
              value={flightNumber}
              onChange={(e) => setFlightNumber(e.target.value)}
              required
              className="h-11 rounded-xl border border-[#006A6A] bg-[#FAFAFC] px-3.5 text-xs"
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <select
                aria-label="Rental duration mode"
                value={durationMode}
                onChange={(e) =>
                  setDurationMode(e.target.value as 'HOURLY' | 'DAILY')
                }
                className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3 text-xs"
              >
                <option value="DAILY">Daily Hire</option>
                <option value="HOURLY">Hourly Hire</option>
              </select>
              <input
                type="number"
                aria-label="Number of hours or days"
                min={1}
                max={30}
                value={hoursOrDays}
                onChange={(e) => {
                  const parsed = Number(e.target.value);
                  setHoursOrDays(
                    Number.isFinite(parsed) && parsed >= 1
                      ? Math.min(30, Math.floor(parsed))
                      : 1
                  );
                }}
                className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3 text-xs"
              />
            </div>
          )}

          {serviceType === 'INTER_STATE_CHARTER' ? (
            <input
              type="text"
              aria-label="Destination state"
              placeholder="Destination State (e.g. Lagos, Kaduna, Kano, Rivers)"
              value={destinationState}
              onChange={(e) => setDestinationState(e.target.value)}
              required
              className="sm:col-span-2 h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
            />
          ) : null}

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
              disabled={isSubmitting || !selectedVehicle}
              className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-6 py-3.5 text-xs font-bold text-white transition hover:bg-[#059669] disabled:opacity-50"
            >
              <MessageCircle className="h-4 w-4" />
              {isSubmitting ? 'Creating Booking...' : 'BOOK A CAR ON WHATSAPP'}
            </button>

            {result ? (
              <a
                href={result.whatsappBookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#001026] px-5 py-3.5 text-xs font-semibold text-white"
              >
                Ref {result.bookingReference} • Open WhatsApp Chat
              </a>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}

export function LogisticsShipmentForm() {
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [shipmentType, setShipmentType] = useState<
    'INTRA_ABUJA_DISPATCH' | 'INTER_STATE_CARGO' | 'COMMERCIAL_HAULAGE'
  >('INTRA_ABUJA_DISPATCH');
  const [pickupAddress, setPickupAddress] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [destinationState, setDestinationState] = useState('FCT - Abuja');
  const [packageDescription, setPackageDescription] = useState('');
  const [estimatedWeightKg, setEstimatedWeightKg] = useState(5);
  const [result, setResult] = useState<{
    waybillNumber: string;
    whatsappDispatchUrl: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setResult(null);
    setIsSubmitting(true);
    try {
      const res = await submitLogisticsShipmentAction({
        senderName,
        senderPhone,
        recipientName,
        recipientPhone,
        shipmentType,
        pickupAddress,
        deliveryAddress,
        destinationState: destinationState.trim() || 'FCT - Abuja',
        packageDescription,
        estimatedWeightKg:
          Number.isFinite(estimatedWeightKg) && estimatedWeightKg > 0
            ? estimatedWeightKg
            : 1,
      });
      if (res.error) {
        setErrorMsg(res.error.message);
        return;
      }
      setResult(res.data);
    } catch {
      setErrorMsg(
        'Unable to create your waybill right now. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-6 sm:p-8">
      <h3
        id="cargo-logistics"
        className="font-display text-lg font-bold text-[#1B1B1D]"
      >
        Send a Parcel or Cargo Shipment
      </h3>
      <p className="mt-1 text-xs text-[#44474E]">
        Same-day Abuja parcel delivery and inter-state van haulage with a
        tracking waybill.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <input
          type="text"
          aria-label="Sender full name"
          placeholder="Sender Name"
          value={senderName}
          onChange={(e) => setSenderName(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        />
        <input
          type="tel"
          aria-label="Sender phone number"
          placeholder="Sender Phone (+234...)"
          value={senderPhone}
          onChange={(e) => setSenderPhone(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        />
        <input
          type="text"
          aria-label="Recipient full name"
          placeholder="Recipient Name"
          value={recipientName}
          onChange={(e) => setRecipientName(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        />
        <input
          type="tel"
          aria-label="Recipient phone number"
          placeholder="Recipient Phone (+234...)"
          value={recipientPhone}
          onChange={(e) => setRecipientPhone(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        />
        <select
          aria-label="Shipment type"
          value={shipmentType}
          onChange={(e) => {
            const nextType = e.target.value as typeof shipmentType;
            setShipmentType(nextType);
            if (nextType === 'INTRA_ABUJA_DISPATCH') {
              setDestinationState('FCT - Abuja');
            }
          }}
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        >
          <option value="INTRA_ABUJA_DISPATCH">Abuja Same-Day Parcel</option>
          <option value="INTER_STATE_CARGO">Inter-State Cargo</option>
          <option value="COMMERCIAL_HAULAGE">Full Van Haulage</option>
        </select>
        <input
          type="number"
          aria-label="Estimated package weight in kilograms"
          min={0.5}
          step={0.5}
          value={estimatedWeightKg}
          onChange={(e) => {
            const parsed = Number(e.target.value);
            setEstimatedWeightKg(
              Number.isFinite(parsed) && parsed > 0 ? parsed : 0.5
            );
          }}
          placeholder="Weight in kg"
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        />
        <input
          type="text"
          aria-label="Pickup address"
          placeholder="Pickup Address (Abuja)"
          value={pickupAddress}
          onChange={(e) => setPickupAddress(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        />
        <input
          type="text"
          aria-label="Delivery address"
          placeholder="Delivery Street Address"
          value={deliveryAddress}
          onChange={(e) => setDeliveryAddress(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        />
        <input
          type="text"
          aria-label="Destination state"
          placeholder="Destination State (e.g. FCT - Abuja, Lagos, Kano)"
          value={destinationState}
          onChange={(e) => setDestinationState(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
        />
        <input
          type="text"
          aria-label="Package description"
          placeholder="What are you sending? (e.g. clothing parcels, documents, boxes)"
          value={packageDescription}
          onChange={(e) => setPackageDescription(e.target.value)}
          required
          className="h-11 rounded-xl border border-black/[0.1] bg-[#FAFAFC] px-3.5 text-xs"
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
            disabled={isSubmitting}
            className="rounded-full bg-[#001026] px-6 py-3 text-xs font-semibold text-white hover:bg-[#0B2545] disabled:opacity-50"
          >
            {isSubmitting
              ? 'Generating Waybill...'
              : 'Create Waybill & Book Delivery'}
          </button>

          {result ? (
            <a
              href={result.whatsappDispatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#10B981] px-5 py-3 text-xs font-semibold text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Waybill {result.waybillNumber} • Confirm on WhatsApp
            </a>
          ) : null}
        </div>
      </form>
    </div>
  );
}
