'use client';

import { useState } from 'react';
import {
  BedDouble,
  Check,
  MapPin,
  Maximize2,
  Bath,
  Users,
} from 'lucide-react';
import type { StayPropertyView } from '@/types';
import { formatKoboToNaira } from '@/lib/money';
import { StayBookingWidget } from './stay-booking-widget';

export function ApartmentDetailSection({
  property,
}: {
  property: StayPropertyView;
}) {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  return (
    <div className="space-y-10">
      {/* Photo Gallery */}
      <div className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white">
        <div className="grid h-auto grid-cols-1 gap-2 lg:h-[440px] lg:grid-cols-4">
          <div className="relative h-[260px] overflow-hidden bg-[#EAE7EA] lg:col-span-2 lg:h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={property.images[0] ?? ''}
              alt={property.title}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="grid h-[280px] grid-cols-2 gap-2 lg:col-span-2 lg:h-full">
            {[
              { img: property.images[1], label: 'Living Room' },
              { img: property.images[2], label: 'Deluxe Suite' },
              { img: property.images[3], label: 'Kitchen & Dining' },
              { img: property.images[4], label: 'Recreation & Lounge' },
            ].map((slot) => (
              <div
                key={slot.label}
                className="relative overflow-hidden bg-[#EAE7EA]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slot.img ?? property.images[0] ?? ''}
                  alt={slot.label}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-semibold text-[#1B1B1D]">
                  {slot.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <section className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-7">
          {/* Exact Address & Quick Summary Card */}
          <div className="space-y-4 rounded-2xl border border-black/[0.06] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-block rounded-full bg-[#F5F5F7] px-3 py-1 text-xs font-semibold text-[#006A6A]">
                {property.category} • {property.estateName}
              </span>
              <span className="text-xs font-medium text-[#6E6E73]">
                {property.district}
              </span>
            </div>

            <div className="flex items-start gap-2.5 rounded-xl border border-black/[0.06] bg-[#FAFAFC] p-3.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#006A6A]" />
              <div>
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-[#74777F]">
                  Property Address &amp; Location
                </span>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-[#1B1B1D]">
                  {property.address}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 text-xs sm:grid-cols-3">
              <div className="rounded-xl border border-black/[0.05] bg-[#FAFAFC] p-3">
                <span className="block text-[11px] text-[#74777F]">Rooms</span>
                <strong className="text-[#1B1B1D]">
                  {property.bedrooms} rooms all en-suite
                </strong>
              </div>
              <div className="rounded-xl border border-black/[0.05] bg-[#FAFAFC] p-3">
                <span className="block text-[11px] text-[#74777F]">
                  Living Room Size
                </span>
                <strong className="text-[#1B1B1D]">
                  {property.livingRoomSizeSqm} sqm
                </strong>
              </div>
              <div className="rounded-xl border border-black/[0.05] bg-[#FAFAFC] p-3">
                <span className="block text-[11px] text-[#74777F]">
                  Ensuite Bathrooms
                </span>
                <strong className="text-[#1B1B1D]">
                  {property.defaultEnsuiteSizeSqm} sqm across all rooms
                </strong>
              </div>
              <div className="rounded-xl border border-black/[0.05] bg-[#FAFAFC] p-3">
                <span className="block text-[11px] text-[#74777F]">
                  Max Capacity
                </span>
                <strong className="text-[#1B1B1D]">
                  Max {property.maxGuests} persons
                </strong>
              </div>
              <div className="rounded-xl border border-black/[0.05] bg-[#FAFAFC] p-3">
                <span className="block text-[11px] text-[#74777F]">
                  Booking Flexibility
                </span>
                <strong className="text-[#006A6A]">
                  Per room or whole apartment
                </strong>
              </div>
              <div className="rounded-xl border border-black/[0.05] bg-[#FAFAFC] p-3">
                <span className="block text-[11px] text-[#74777F]">
                  Pet Policy
                </span>
                <strong className="text-[#BA1A1A]">No pets allowed</strong>
              </div>
            </div>
          </div>

          {/* Individual Room Cards & Comparison (Requirement 1) */}
          {property.rooms.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
                    Individual Rooms &amp; Nightly Rates
                  </h2>
                  <p className="mt-0.5 text-xs text-[#44474E]">
                    Compare room sizes, bed setups, and nightly rates to book
                    individual rooms or the entire {property.bedrooms}-bedroom
                    apartment.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRoomId(null)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    selectedRoomId === null
                      ? 'bg-[#001026] text-white'
                      : 'border border-black/[0.1] bg-white text-[#1B1B1D] hover:bg-[#F5F5F7]'
                  }`}
                >
                  Book Whole Apartment ({formatKoboToNaira(property.nightlyRateKobo)}
                  /night)
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {property.rooms.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  return (
                    <div
                      key={room.id}
                      className={`flex flex-col justify-between overflow-hidden rounded-2xl border bg-white transition ${
                        isSelected
                          ? 'border-[#001026] ring-2 ring-[#001026]/10'
                          : 'border-black/[0.08]'
                      }`}
                    >
                      <div>
                        <div className="relative aspect-[16/10] overflow-hidden bg-[#F5F5F7]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={room.imageUrl || property.images[0] || ''}
                            alt={room.name}
                            className="h-full w-full object-cover"
                          />
                          <span className="absolute right-3 top-3 rounded-full bg-[#001026]/90 px-3 py-1 text-xs font-bold text-white tabular-nums">
                            {formatKoboToNaira(room.nightlyRateKobo)} / night
                          </span>
                        </div>

                        <div className="p-4 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h3 className="font-display text-base font-bold text-[#1B1B1D]">
                              {room.name}
                            </h3>
                            <span className="rounded-full bg-[#F5F5F7] px-2.5 py-0.5 text-[11px] font-semibold text-[#1B1B1D]">
                              {room.roomSizeSqm} sqm
                            </span>
                          </div>

                          <p className="text-xs font-medium leading-relaxed text-[#1B1B1D]">
                            Ensuite bathroom ({room.ensuiteSizeSqm} sqm) | Room
                            Size: {room.roomSizeSqm} sqm | Bed Type:{' '}
                            {room.bedType} | Occupancy: {room.occupancy} persons
                            | Cost per Night:{' '}
                            <strong className="tabular-nums">
                              {formatKoboToNaira(room.nightlyRateKobo)}
                            </strong>
                          </p>

                          {room.description && (
                            <p className="text-xs text-[#44474E]">
                              {room.description}
                            </p>
                          )}

                          <div className="grid grid-cols-2 gap-2 border-t border-black/[0.06] pt-2.5 text-[11px] text-[#44474E]">
                            <span className="flex items-center gap-1">
                              <Maximize2 className="h-3.5 w-3.5 text-[#006A6A]" />
                              Room: {room.roomSizeSqm} sqm
                            </span>
                            <span className="flex items-center gap-1">
                              <Bath className="h-3.5 w-3.5 text-[#006A6A]" />
                              Ensuite: {room.ensuiteSizeSqm} sqm
                            </span>
                            <span className="flex items-center gap-1">
                              <BedDouble className="h-3.5 w-3.5 text-[#006A6A]" />
                              {room.bedType}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5 text-[#006A6A]" />
                              {room.occupancy} persons
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-black/[0.06] bg-[#FAFAFC] p-3">
                        <a
                          href="#stay-booking-widget"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedRoomId(room.id);
                            document
                              .getElementById('stay-booking-widget')
                              ?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`flex w-full items-center justify-center rounded-full py-2 text-xs font-semibold transition ${
                            isSelected
                              ? 'bg-[#006A6A] text-white'
                              : 'bg-[#001026] text-white hover:bg-[#0B2545]'
                          }`}
                        >
                          {isSelected
                            ? `Selected: ${room.name} (${formatKoboToNaira(room.nightlyRateKobo)}/night)`
                            : `Select ${room.name} • ${formatKoboToNaira(room.nightlyRateKobo)}/night`}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Apartment & Shared Space Dimensions Breakdown (Requirement 3) */}
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 space-y-4">
            <div>
              <h2 className="font-display text-xl font-bold text-[#1B1B1D]">
                Apartment &amp; Shared Space Dimensions
              </h2>
              <p className="mt-0.5 text-xs text-[#44474E]">
                Verified spatial breakdown of shared living areas, bedrooms, and
                private en-suite bathrooms.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#006A6A]">
                  Shared Living Space
                </span>
                <p className="mt-1 font-display text-lg font-bold text-[#1B1B1D]">
                  {property.livingRoomSizeSqm} sqm Living Room
                </p>
                <p className="mt-0.5 text-xs text-[#44474E]">
                  Main furnished lounge, dining set, Smart Cable TV, table
                  soccer, and board games area.
                </p>
              </div>

              <div className="rounded-xl border border-black/[0.06] bg-[#FAFAFC] p-4">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#006A6A]">
                  Private Bathrooms
                </span>
                <p className="mt-1 font-display text-lg font-bold text-[#1B1B1D]">
                  {property.defaultEnsuiteSizeSqm} sqm Ensuite Bathrooms
                </p>
                <p className="mt-0.5 text-xs text-[#44474E]">
                  Dedicated {property.defaultEnsuiteSizeSqm} sqm private
                  en-suite bathroom inside every bedroom.
                </p>
              </div>
            </div>

            {property.rooms.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-black/[0.06] bg-[#F5F5F7] text-[#44474E]">
                    <tr>
                      <th className="px-3.5 py-2.5 font-semibold">Room</th>
                      <th className="px-3.5 py-2.5 font-semibold">Room Size</th>
                      <th className="px-3.5 py-2.5 font-semibold">
                        Ensuite Bathroom
                      </th>
                      <th className="px-3.5 py-2.5 font-semibold">Bed Type</th>
                      <th className="px-3.5 py-2.5 font-semibold">Occupancy</th>
                      <th className="px-3.5 py-2.5 font-semibold">
                        Nightly Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.06]">
                    {property.rooms.map((rm) => (
                      <tr key={rm.id}>
                        <td className="px-3.5 py-2.5 font-semibold text-[#1B1B1D]">
                          {rm.name}
                        </td>
                        <td className="px-3.5 py-2.5 tabular-nums">
                          {rm.roomSizeSqm} sqm
                        </td>
                        <td className="px-3.5 py-2.5 tabular-nums">
                          {rm.ensuiteSizeSqm} sqm
                        </td>
                        <td className="px-3.5 py-2.5">{rm.bedType}</td>
                        <td className="px-3.5 py-2.5">
                          {rm.occupancy} persons
                        </td>
                        <td className="px-3.5 py-2.5 font-bold tabular-nums text-[#1B1B1D]">
                          {formatKoboToNaira(rm.nightlyRateKobo)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Structured "About the Apartment" Section (Requirement 2) */}
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold text-[#1B1B1D]">
                About the Apartment
              </h2>
              {property.aboutIntro && (
                <p className="text-sm leading-relaxed text-[#44474E]">
                  {property.aboutIntro}
                </p>
              )}
            </div>

            {property.amenityGroups.length > 0 && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {property.amenityGroups.map((group) => (
                  <div
                    key={group.id}
                    className="rounded-xl border border-black/[0.06] bg-[#FAFAFC] p-4 space-y-2"
                  >
                    <h3 className="font-display text-sm font-bold text-[#1B1B1D]">
                      {group.title}
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#44474E]">
                      {group.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#006A6A]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {property.ourPromise && (
              <div className="rounded-xl border border-[#006A6A]/20 bg-[#F5F5F7] p-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-[#006A6A]">
                  Our Promise
                </span>
                <p className="mt-1 text-xs font-medium leading-relaxed text-[#1B1B1D]">
                  {property.ourPromise}
                </p>
              </div>
            )}
          </div>

          {/* House Rules */}
          <div className="rounded-2xl border border-black/[0.06] bg-white p-6 space-y-4">
            <h2 className="font-display text-base font-bold text-[#1B1B1D]">
              House Rules
            </h2>
            <div className="grid grid-cols-1 gap-4 text-xs md:grid-cols-2">
              <div>
                <p className="font-semibold text-[#1B1B1D]">
                  Check-In &amp; Check-Out
                </p>
                <p className="mt-0.5 text-[#44474E]">
                  Check-in from 2:00 PM. Check-out by 11:00 AM.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1B1B1D]">Guest ID</p>
                <p className="mt-0.5 text-[#44474E]">
                  Valid government ID (NIN, Passport, or Driver’s License)
                  required at check-in.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1B1B1D]">No Parties</p>
                <p className="mt-0.5 text-[#44474E]">
                  Quiet hours are 10:00 PM – 7:00 AM. No loud parties or events.
                </p>
              </div>
              <div>
                <p className="font-semibold text-[#1B1B1D]">
                  No Smoking &amp; No Pets
                </p>
                <p className="mt-0.5 text-[#44474E]">
                  No pets allowed. Smoking is not permitted indoors.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Booking Widget */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <StayBookingWidget
            property={property}
            selectedRoomId={selectedRoomId}
            onSelectRoomId={setSelectedRoomId}
          />
        </div>
      </section>
    </div>
  );
}
