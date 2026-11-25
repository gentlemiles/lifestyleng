'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import type { FleetVehicleView } from '@/types';
import { formatKoboToNaira, koboToNairaWhole } from '@/lib/money';
import {
  deleteFleetVehicleCmsAction,
  upsertFleetVehicleCmsAction,
} from '@/server/actions/cms';

function notifyStorefrontSync() {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('lifestyleng_cms_sync');
      channel.postMessage({ type: 'CMS_UPDATED', timestamp: Date.now() });
      channel.close();
    }
    window.localStorage.setItem('lifestyleng_cms_sync_ts', String(Date.now()));
  } catch {
    // Ignore broadcast errors
  }
}

export function LogisticsCmsClient({
  initialVehicles,
}: {
  initialVehicles: FleetVehicleView[];
}) {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<FleetVehicleView[]>(initialVehicles);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [name, setName] = useState('');
  const [category, setCategory] =
    useState<FleetVehicleView['category']>('EXECUTIVE_SEDAN');
  const [passengerCapacity, setPassengerCapacity] = useState('4');
  const [luggageCapacity, setLuggageCapacity] = useState('3');
  const [hourlyRateNaira, setHourlyRateNaira] = useState('15000');
  const [dailyRateNaira, setDailyRateNaira] = useState('45000');
  const [airportRateNaira, setAirportRateNaira] = useState('35000');
  const [interStateRateNaira, setInterStateRateNaira] = useState('95000');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [vehicleToDelete, setVehicleToDelete] =
    useState<FleetVehicleView | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  function openCreate() {
    setEditingId(undefined);
    setFormError(null);
    setName('');
    setCategory('EXECUTIVE_SEDAN');
    setPassengerCapacity('4');
    setLuggageCapacity('3');
    setHourlyRateNaira('15000');
    setDailyRateNaira('45000');
    setAirportRateNaira('35000');
    setInterStateRateNaira('95000');
    setImageUrl(
      'https://images.unsplash.com/photo-1550355291-bbee04a92027?auto=format&fit=crop&w=1000&q=85'
    );
    setIsAvailable(true);
    setIsModalOpen(true);
  }

  function openEdit(v: FleetVehicleView) {
    setEditingId(v.id);
    setFormError(null);
    setName(v.name);
    setCategory(v.category);
    setPassengerCapacity(String(v.passengerCapacity));
    setLuggageCapacity(String(v.luggageCapacity));
    setHourlyRateNaira(String(koboToNairaWhole(v.hourlyRateKobo)));
    setDailyRateNaira(String(koboToNairaWhole(v.dailyIntraCityRateKobo)));
    setAirportRateNaira(String(koboToNairaWhole(v.airportTransferRateKobo)));
    setInterStateRateNaira(String(koboToNairaWhole(v.interStateDailyRateKobo)));
    setImageUrl(v.imageUrl);
    setIsAvailable(v.isAvailable);
    setIsModalOpen(true);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await upsertFleetVehicleCmsAction({
        id: editingId,
        name,
        category,
        passengerCapacity: Number(passengerCapacity),
        luggageCapacity: Number(luggageCapacity),
        hourlyRateNaira: Number(hourlyRateNaira),
        dailyIntraCityRateNaira: Number(dailyRateNaira),
        airportTransferRateNaira: Number(airportRateNaira),
        interStateDailyRateNaira: Number(interStateRateNaira),
        imageUrl,
        isAvailable,
      });

      if (res.error) {
        setFormError(res.error.message);
        return;
      }

      const saved = res.data;
      setVehicles((prev) => {
        const exists = prev.some((v) => v.id === saved.id);
        return exists
          ? prev.map((v) => (v.id === saved.id ? saved : v))
          : [...prev, saved];
      });
      setIsModalOpen(false);
      setFeedback({
        type: 'success',
        message: `Saved vehicle "${saved.name}". Live on /car-hire.`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setFormError('Unable to save vehicle right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!vehicleToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteFleetVehicleCmsAction({ id: vehicleToDelete.id });
      if (res.error) {
        setFeedback({ type: 'error', message: res.error.message });
        setVehicleToDelete(null);
        return;
      }
      const deletedId = vehicleToDelete.id;
      const deletedName = vehicleToDelete.name;
      setVehicles((prev) => prev.filter((v) => v.id !== deletedId));
      setFeedback({
        type: 'success',
        message: `Deleted "${deletedName}".`,
      });
      setVehicleToDelete(null);
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setFeedback({
        type: 'error',
        message: 'Unable to delete vehicle right now. Please try again.',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-950">
            Car Hire Fleet &amp; Airport Transfer Vehicles ({vehicles.length})
          </h1>
          <p className="text-xs text-neutral-500">
            Manage chauffeur vehicles, Abuja daily rates, ABV airport rates, and
            photos.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-1.5 rounded-md bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
        >
          <Plus className="h-4 w-4" />
          Add Vehicle
        </button>
      </div>

      {feedback && (
        <div
          role="status"
          className={`flex items-center justify-between rounded-md border px-4 py-3 text-xs font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
              : 'border-red-200 bg-red-50 text-red-900'
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Dismiss notification"
            className="text-neutral-500 hover:text-neutral-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-4"
          >
            <div className="space-y-2">
              <div className="aspect-[16/10] overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={v.imageUrl}
                  alt={v.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="block text-[11px] font-semibold text-neutral-500">
                {v.category} • {v.passengerCapacity} Passengers •{' '}
                {v.luggageCapacity} Bags
              </span>
              <h2 className="text-sm font-bold text-neutral-950">{v.name}</h2>
              <p className="text-xs text-neutral-600 tabular-nums">
                Abuja Daily: {formatKoboToNaira(v.dailyIntraCityRateKobo)} • ABV
                Airport: {formatKoboToNaira(v.airportTransferRateKobo)} •
                Inter-State: {formatKoboToNaira(v.interStateDailyRateKobo)}
              </p>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2 border-t border-neutral-200 pt-3">
              <button
                type="button"
                onClick={() => openEdit(v)}
                className="inline-flex items-center gap-1 rounded border border-neutral-300 px-2.5 py-1 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                <Pencil className="h-3 w-3" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => setVehicleToDelete(v)}
                className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        >
          <div className="my-8 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2 className="text-base font-bold text-neutral-950">
                {editingId ? 'Edit Vehicle' : 'Add Vehicle'}
              </h2>
              <button
                type="button"
                aria-label="Close vehicle modal"
                onClick={() => setIsModalOpen(false)}
                className="text-neutral-500 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
              {formError && (
                <div
                  role="alert"
                  className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800"
                >
                  {formError}
                </div>
              )}
              <div>
                <label className="block font-semibold text-neutral-700">
                  Vehicle Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-neutral-700">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as FleetVehicleView['category'])
                  }
                  className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2"
                >
                  <option value="EXECUTIVE_SEDAN">Executive Sedan</option>
                  <option value="LUXURY_SUV">Luxury SUV</option>
                  <option value="EXECUTIVE_BUS">Executive Bus / Van</option>
                  <option value="HAULAGE_VAN">Cargo &amp; Haulage Van</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <label className="block font-semibold text-neutral-700">
                    Hourly Rate (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={hourlyRateNaira}
                    onChange={(e) => setHourlyRateNaira(e.target.value)}
                    required
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700">
                    Abuja Daily (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dailyRateNaira}
                    onChange={(e) => setDailyRateNaira(e.target.value)}
                    required
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700">
                    ABV Airport (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={airportRateNaira}
                    onChange={(e) => setAirportRateNaira(e.target.value)}
                    required
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700">
                    Inter-State (₦) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={interStateRateNaira}
                    onChange={(e) => setInterStateRateNaira(e.target.value)}
                    required
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-neutral-700">
                    Passenger Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={passengerCapacity}
                    onChange={(e) => setPassengerCapacity(e.target.value)}
                    required
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-neutral-700">
                    Luggage Capacity (Bags)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={luggageCapacity}
                    onChange={(e) => setLuggageCapacity(e.target.value)}
                    required
                    className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-neutral-700">
                  Image URL *
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  required
                  className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1.5 block w-full text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded border border-neutral-300 px-4 py-2 font-medium text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1 rounded bg-neutral-950 px-4 py-2 font-semibold text-white"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSaving ? 'Saving...' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {vehicleToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-950">
              Delete {vehicleToDelete.name}?
            </h3>
            <p className="text-xs text-neutral-600">
              Delete <strong>{vehicleToDelete.name}</strong>? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setVehicleToDelete(null)}
                className="rounded border border-neutral-300 px-3.5 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="rounded bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
