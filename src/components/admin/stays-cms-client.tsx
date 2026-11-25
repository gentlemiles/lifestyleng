'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FolderKanban,
  MapPin,
  BedDouble,
  ExternalLink,
} from 'lucide-react';
import type {
  StayAmenityGroup,
  StayCategoryItem,
  StayPropertyView,
} from '@/types';
import { formatKoboToNaira, koboToNairaWhole } from '@/lib/money';
import {
  deleteStayCategoryCmsAction,
  deleteStayPropertyCmsAction,
  upsertStayCategoryCmsAction,
  upsertStayPropertyCmsAction,
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

interface RoomDraft {
  id: string;
  name: string;
  roomSizeSqm: string;
  ensuiteSizeSqm: string;
  bedType: string;
  occupancy: string;
  nightlyRateNaira: string;
  imageUrl: string;
  description: string;
}

interface AmenityGroupDraft {
  id: string;
  title: string;
  itemsText: string;
}

const DEFAULT_AMENITY_GROUPS: AmenityGroupDraft[] = [
  {
    id: 'ag-comfort',
    title: 'Comfort & Living',
    itemsText:
      'Fully furnished and tastefully arranged apartment\nCosy living room with comfortable seating and warm blankets for relaxation',
  },
  {
    id: 'ag-recreation',
    title: 'Recreation & Entertainment',
    itemsText:
      'Table soccer for fun and friendly competition\nTraditional Ayo board game\nCollection of inspirational and interesting books for reading and relaxation',
  },
  {
    id: 'ag-dining',
    title: 'Dining & Kitchen Facilities',
    itemsText:
      'Complete dining set for comfortable dining\nCoffee maker for freshly brewed coffee\nFully equipped kitchen featuring a microwave, oven and gas burner\nFilled gas cylinder provided\nKitchen smoke/heat extractor for ventilation',
  },
  {
    id: 'ag-connectivity',
    title: 'Connectivity & Entertainment',
    itemsText:
      'Fast MTN FibreX Wi-Fi for seamless internet connectivity\nSmart Cable TV with access to Netflix and YouTube',
  },
  {
    id: 'ag-power',
    title: 'Power Supply',
    itemsText:
      '24/7 electricity supported by solar panels and battery backup to ensure uninterrupted comfort',
  },
  {
    id: 'ag-security',
    title: 'Security',
    itemsText:
      '24/7 security personnel on-site\nOutdoor security cameras for additional monitoring\nSecure entrance with a security-code access system',
  },
  {
    id: 'ag-housekeeping',
    title: 'Housekeeping Services',
    itemsText:
      'Professional cleaning and general housekeeping three times a week to maintain a clean, fresh and comfortable environment',
  },
];

export function StaysCmsClient({
  initialProperties,
  initialCategories,
}: {
  initialProperties: StayPropertyView[];
  initialCategories: StayCategoryItem[];
}) {
  const router = useRouter();
  const [properties, setProperties] =
    useState<StayPropertyView[]>(initialProperties);
  const [categories, setCategories] =
    useState<StayCategoryItem[]>(initialCategories);
  const [selectedCategoryFilter, setSelectedCategoryFilter] =
    useState<string>('ALL');

  // Apartment Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState(
    initialCategories[0]?.name ?? 'Short-Let Duplex'
  );
  const [estateName, setEstateName] = useState('Prince & Princess Estate');
  const [district, setDistrict] = useState('Kaura District, Abuja');
  const [address, setAddress] = useState(
    'House 43, 1st Crescent, Off Drive 2, Prince & Princess Estate, First gate, opposite Kaura Market, Kaura District'
  );
  const [bedrooms, setBedrooms] = useState('4');
  const [bathrooms, setBathrooms] = useState('5');
  const [maxGuests, setMaxGuests] = useState('8');
  const [livingRoomSizeSqm, setLivingRoomSizeSqm] = useState('22');
  const [defaultEnsuiteSizeSqm, setDefaultEnsuiteSizeSqm] = useState('3');
  const [nightlyRateNaira, setNightlyRateNaira] = useState('120000');
  const [weeklyRateNaira, setWeeklyRateNaira] = useState('780000');
  const [monthlyRateNaira, setMonthlyRateNaira] = useState('2950000');
  const [cautionDepositNaira, setCautionDepositNaira] = useState('50000');
  const [aboutIntro, setAboutIntro] = useState(
    'Experience comfort, convenience and relaxation in our fully furnished apartment, thoughtfully designed to provide a cosy, homely and enjoyable stay for individuals, families and business travellers.'
  );
  const [ourPromise, setOurPromise] = useState(
    'A comfortable home away from home, where convenience meets relaxation and every detail is designed to make your stay enjoyable.'
  );
  const [amenityGroupsDraft, setAmenityGroupsDraft] = useState<
    AmenityGroupDraft[]
  >(DEFAULT_AMENITY_GROUPS);
  const [roomsDraft, setRoomsDraft] = useState<RoomDraft[]>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [amenitiesText, setAmenitiesText] = useState(
    '4 Rooms All En-Suite\n2 Double Beds & 4 Single Beds\nMax 8 Persons\nNo Pets Allowed\nCan Be Rented Per Room or Whole Apartment'
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [propertyToDelete, setPropertyToDelete] =
    useState<StayPropertyView | null>(null);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Categories CRUD Modal State
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null
  );
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryDesc, setEditCategoryDesc] = useState('');
  const [categoryToDelete, setCategoryToDelete] =
    useState<StayCategoryItem | null>(null);
  const [reassignTargetName, setReassignTargetName] = useState('');
  const [categoryFeedback, setCategoryFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);

  const filteredProperties =
    selectedCategoryFilter === 'ALL'
      ? properties
      : properties.filter((p) => p.category === selectedCategoryFilter);

  function openCreate() {
    setEditingId(undefined);
    setFormError(null);
    setTitle('');
    setSubtitle('4 rooms all en-suite • Rent per room or whole apartment');
    setCategory(categories[0]?.name ?? 'Short-Let Duplex');
    setEstateName('Prince & Princess Estate');
    setDistrict('Kaura District, Abuja');
    setAddress(
      'House 43, 1st Crescent, Off Drive 2, Prince & Princess Estate, First gate, opposite Kaura Market, Kaura District'
    );
    setBedrooms('4');
    setBathrooms('5');
    setMaxGuests('8');
    setLivingRoomSizeSqm('22');
    setDefaultEnsuiteSizeSqm('3');
    setNightlyRateNaira('120000');
    setWeeklyRateNaira('780000');
    setMonthlyRateNaira('2950000');
    setCautionDepositNaira('50000');
    setAboutIntro(
      'Experience comfort, convenience and relaxation in our fully furnished apartment, thoughtfully designed to provide a cosy, homely and enjoyable stay for individuals, families and business travellers.'
    );
    setOurPromise(
      'A comfortable home away from home, where convenience meets relaxation and every detail is designed to make your stay enjoyable.'
    );
    setAmenityGroupsDraft(DEFAULT_AMENITY_GROUPS);
    setRoomsDraft([
      {
        id: `room-${Date.now()}-1`,
        name: 'Deluxe Room 1',
        roomSizeSqm: '15',
        ensuiteSizeSqm: '3',
        bedType: '1 Queen-size bed',
        occupancy: '2',
        nightlyRateNaira: '58000',
        imageUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        description: '15 sqm en-suite bedroom with 1 Queen-size bed.',
      },
    ]);
    setImageUrl(
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'
    );
    setAmenitiesText(
      '4 Rooms All En-Suite\n2 Double Beds & 4 Single Beds\nMax 8 Persons\nNo Pets Allowed\nCan Be Rented Per Room or Whole Apartment'
    );
    setIsModalOpen(true);
  }

  function openEdit(prop: StayPropertyView) {
    setEditingId(prop.id);
    setFormError(null);
    setTitle(prop.title);
    setSubtitle(prop.subtitle);
    setCategory(prop.category || categories[0]?.name || 'Short-Let Duplex');
    setEstateName(prop.estateName);
    setDistrict(prop.district);
    setAddress(prop.address);
    setBedrooms(String(prop.bedrooms));
    setBathrooms(String(prop.bathrooms));
    setMaxGuests(String(prop.maxGuests));
    setLivingRoomSizeSqm(String(prop.livingRoomSizeSqm || 22));
    setDefaultEnsuiteSizeSqm(String(prop.defaultEnsuiteSizeSqm || 3));
    setNightlyRateNaira(String(koboToNairaWhole(prop.nightlyRateKobo)));
    setWeeklyRateNaira(String(koboToNairaWhole(prop.weeklyRateKobo)));
    setMonthlyRateNaira(String(koboToNairaWhole(prop.monthlyRateKobo)));
    setCautionDepositNaira(String(koboToNairaWhole(prop.cautionDepositKobo)));
    setAboutIntro(prop.aboutIntro || '');
    setOurPromise(prop.ourPromise || '');
    setAmenityGroupsDraft(
      prop.amenityGroups.length > 0
        ? prop.amenityGroups.map((g) => ({
            id: g.id,
            title: g.title,
            itemsText: g.items.join('\n'),
          }))
        : DEFAULT_AMENITY_GROUPS
    );
    setRoomsDraft(
      prop.rooms.map((rm) => ({
        id: rm.id,
        name: rm.name,
        roomSizeSqm: String(rm.roomSizeSqm),
        ensuiteSizeSqm: String(rm.ensuiteSizeSqm),
        bedType: rm.bedType,
        occupancy: String(rm.occupancy),
        nightlyRateNaira: String(koboToNairaWhole(rm.nightlyRateKobo)),
        imageUrl: rm.imageUrl,
        description: rm.description ?? '',
      }))
    );
    setImageUrl(prop.images[0] ?? '');
    setAmenitiesText(prop.amenities.join('\n'));
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

  function handleAddRoomDraft() {
    setRoomsDraft((prev) => [
      ...prev,
      {
        id: `room-${Date.now()}-${prev.length + 1}`,
        name: `Room ${prev.length + 1}`,
        roomSizeSqm: '14',
        ensuiteSizeSqm: defaultEnsuiteSizeSqm || '3',
        bedType: '1 Queen-size bed',
        occupancy: '2',
        nightlyRateNaira: '55000',
        imageUrl:
          imageUrl ||
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        description: '',
      },
    ]);
  }

  function handleUpdateRoomDraft(id: string, patch: Partial<RoomDraft>) {
    setRoomsDraft((prev) =>
      prev.map((rm) => (rm.id === id ? { ...rm, ...patch } : rm))
    );
  }

  function handleRoomFileUpload(
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateRoomDraft(id, { imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveRoomDraft(id: string) {
    setRoomsDraft((prev) => prev.filter((rm) => rm.id !== id));
  }

  function handleAddAmenityGroup() {
    setAmenityGroupsDraft((prev) => [
      ...prev,
      {
        id: `ag-${Date.now()}`,
        title: 'New Amenity Category',
        itemsText: 'Amenity detail 1',
      },
    ]);
  }

  function handleUpdateAmenityGroup(
    id: string,
    patch: Partial<AmenityGroupDraft>
  ) {
    setAmenityGroupsDraft((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...patch } : g))
    );
  }

  function handleRemoveAmenityGroup(id: string) {
    setAmenityGroupsDraft((prev) => prev.filter((g) => g.id !== id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSaving(true);
    setFeedback(null);

    const parsedAmenityGroups: StayAmenityGroup[] = amenityGroupsDraft
      .map((g) => ({
        id: g.id,
        title: g.title.trim(),
        items: g.itemsText
          .split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      }))
      .filter((g) => g.title.length > 0 && g.items.length > 0);

    const parsedRooms = roomsDraft.map((r) => {
      const roomSqm = Number(r.roomSizeSqm);
      const ensuiteSqm = Number(r.ensuiteSizeSqm);
      const occ = Number(r.occupancy);
      const nightly = Number(r.nightlyRateNaira);
      return {
        id: r.id,
        name: r.name.trim(),
        roomSizeSqm: Number.isFinite(roomSqm) && roomSqm > 0 ? roomSqm : 14,
        ensuiteSizeSqm:
          Number.isFinite(ensuiteSqm) && ensuiteSqm >= 0 ? ensuiteSqm : 3,
        bedType: r.bedType.trim() || '1 Queen-size bed',
        occupancy: Number.isInteger(occ) && occ >= 1 ? occ : 2,
        nightlyRateNaira:
          Number.isFinite(nightly) && nightly > 0 ? nightly : 50000,
        imageUrl: r.imageUrl.trim() || imageUrl.trim(),
        description: r.description.trim() || undefined,
      };
    });

    try {
      const res = await upsertStayPropertyCmsAction({
        id: editingId,
        title,
        subtitle,
        category,
        estateName,
        district,
        address,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        maxGuests: Number(maxGuests),
        livingRoomSizeSqm: Number(livingRoomSizeSqm) || 22,
        defaultEnsuiteSizeSqm:
          Number.isFinite(Number(defaultEnsuiteSizeSqm)) &&
          Number(defaultEnsuiteSizeSqm) >= 0
            ? Number(defaultEnsuiteSizeSqm)
            : 3,
        nightlyRateNaira: Number(nightlyRateNaira),
        weeklyRateNaira: Number(weeklyRateNaira),
        monthlyRateNaira: Number(monthlyRateNaira),
        cautionDepositNaira: Number(cautionDepositNaira),
        aboutIntro,
        ourPromise,
        amenityGroups: parsedAmenityGroups,
        rooms: parsedRooms,
        imageUrl,
        amenitiesText,
      });

      if (res.error) {
        setFormError(res.error.message);
        return;
      }

      const saved = res.data;
      setProperties((prev) => {
        const exists = prev.some((p) => p.id === saved.id);
        return exists
          ? prev.map((p) => (p.id === saved.id ? saved : p))
          : [...prev, saved];
      });
      setIsModalOpen(false);
      setFeedback({
        type: 'success',
        message: `Saved apartment "${saved.title}" (${saved.rooms.length} room options). Live on /stays.`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setFormError('Unable to save apartment right now. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!propertyToDelete) return;
    setIsDeletingProperty(true);
    try {
      const res = await deleteStayPropertyCmsAction({
        id: propertyToDelete.id,
      });
      if (res.error) {
        setFeedback({ type: 'error', message: res.error.message });
        setPropertyToDelete(null);
        return;
      }
      const deletedId = propertyToDelete.id;
      const deletedTitle = propertyToDelete.title;
      setProperties((prev) => prev.filter((p) => p.id !== deletedId));
      setFeedback({
        type: 'success',
        message: `Deleted "${deletedTitle}".`,
      });
      setPropertyToDelete(null);
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setFeedback({
        type: 'error',
        message: 'Unable to delete apartment right now. Please try again.',
      });
    } finally {
      setIsDeletingProperty(false);
    }
  }

  // --- Categories CRUD Handlers ---
  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    setCategoryFeedback(null);
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryFeedback({
        type: 'error',
        message: 'Category name cannot be empty.',
      });
      return;
    }
    if (
      categories.some((c) => c.name.trim().toLowerCase() === trimmed.toLowerCase())
    ) {
      setCategoryFeedback({
        type: 'error',
        message: `A category named "${trimmed}" already exists.`,
      });
      return;
    }

    setIsCategorySubmitting(true);
    try {
      const res = await upsertStayCategoryCmsAction({
        name: trimmed,
        description: newCategoryDesc.trim(),
        isActive: true,
      });

      if (res.error) {
        setCategoryFeedback({ type: 'error', message: res.error.message });
        return;
      }

      setCategories((prev) => [...prev, res.data.category]);
      setNewCategoryName('');
      setNewCategoryDesc('');
      setCategoryFeedback({
        type: 'success',
        message: `Created category "${res.data.category.name}". Available in apartment dropdowns and storefront filters.`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setCategoryFeedback({
        type: 'error',
        message: 'Unable to create category right now. Please try again.',
      });
    } finally {
      setIsCategorySubmitting(false);
    }
  }

  function startEditingCategory(cat: StayCategoryItem) {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
    setEditCategoryDesc(cat.description);
    setCategoryFeedback(null);
  }

  async function handleUpdateCategory(cat: StayCategoryItem) {
    setCategoryFeedback(null);
    const trimmed = editCategoryName.trim();
    if (!trimmed) {
      setCategoryFeedback({
        type: 'error',
        message: 'Category name cannot be empty.',
      });
      return;
    }
    if (
      categories.some(
        (c) =>
          c.id !== cat.id &&
          c.name.trim().toLowerCase() === trimmed.toLowerCase()
      )
    ) {
      setCategoryFeedback({
        type: 'error',
        message: `A category named "${trimmed}" already exists.`,
      });
      return;
    }

    setIsCategorySubmitting(true);
    try {
      const res = await upsertStayCategoryCmsAction({
        id: cat.id,
        name: trimmed,
        description: editCategoryDesc.trim(),
        isActive: cat.isActive,
      });

      if (res.error) {
        setCategoryFeedback({ type: 'error', message: res.error.message });
        return;
      }

      const updatedCat = res.data.category;
      setCategories((prev) =>
        prev.map((c) => (c.id === updatedCat.id ? updatedCat : c))
      );

      if (cat.name !== updatedCat.name) {
        setProperties((prev) =>
          prev.map((p) =>
            p.category === cat.name ? { ...p, category: updatedCat.name } : p
          )
        );
        if (category === cat.name) {
          setCategory(updatedCat.name);
        }
        if (selectedCategoryFilter === cat.name) {
          setSelectedCategoryFilter(updatedCat.name);
        }
      }

      setEditingCategoryId(null);
      setCategoryFeedback({
        type: 'success',
        message:
          res.data.propagatedApartmentsCount > 0
            ? `Renamed to "${updatedCat.name}" and updated ${res.data.propagatedApartmentsCount} assigned apartment(s).`
            : `Updated category "${updatedCat.name}".`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setCategoryFeedback({
        type: 'error',
        message: 'Unable to update category right now. Please try again.',
      });
    } finally {
      setIsCategorySubmitting(false);
    }
  }

  function promptDeleteCategory(cat: StayCategoryItem) {
    setCategoryToDelete(cat);
    const fallback =
      categories.find((c) => c.id !== cat.id)?.name ?? 'Uncategorized';
    setReassignTargetName(fallback);
    setCategoryFeedback(null);
  }

  async function handleConfirmDeleteCategory() {
    if (!categoryToDelete) return;
    setIsCategorySubmitting(true);
    try {
      const res = await deleteStayCategoryCmsAction({
        id: categoryToDelete.id,
        reassignToCategoryName: reassignTargetName,
      });

      if (res.error) {
        setCategoryFeedback({ type: 'error', message: res.error.message });
        setCategoryToDelete(null);
        return;
      }

      const deletedName = categoryToDelete.name;
      const { deletedId, reassignedApartmentsCount, reassignedToCategory } =
        res.data;

      setCategories((prev) => prev.filter((c) => c.id !== deletedId));
      if (reassignedApartmentsCount > 0) {
        setProperties((prev) =>
          prev.map((p) =>
            p.category === deletedName
              ? { ...p, category: reassignedToCategory }
              : p
          )
        );
      }
      if (selectedCategoryFilter === deletedName) {
        setSelectedCategoryFilter('ALL');
      }
      setCategoryToDelete(null);
      setCategoryFeedback({
        type: 'success',
        message:
          reassignedApartmentsCount > 0
            ? `Deleted category "${deletedName}" and reassigned ${reassignedApartmentsCount} apartment(s) to "${reassignedToCategory}".`
            : `Deleted category "${deletedName}".`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setCategoryFeedback({
        type: 'error',
        message: 'Unable to delete category right now. Please try again.',
      });
    } finally {
      setIsCategorySubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-950">
            Short-Let Apartments, Individual Rooms &amp; Categories (
            {properties.length})
          </h1>
          <p className="text-xs text-neutral-500">
            Manage apartments, room-by-room sizes &amp; nightly rates, living
            room dimensions, structured amenity groups, and apartment
            categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setCategoryFeedback(null);
              setIsCategoriesModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            <FolderKanban className="h-4 w-4" />
            Manage Categories ({categories.length})
          </button>

          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 rounded-md bg-neutral-950 px-4 py-2 text-xs font-semibold text-white hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            Add Apartment
          </button>
        </div>
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
            className="text-neutral-500 hover:text-neutral-900"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => setSelectedCategoryFilter('ALL')}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
            selectedCategoryFilter === 'ALL'
              ? 'bg-neutral-950 text-white'
              : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
          }`}
        >
          All Categories ({properties.length})
        </button>
        {categories.map((cat) => {
          const count = properties.filter(
            (p) => p.category === cat.name
          ).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryFilter(cat.name)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                selectedCategoryFilter === cat.name
                  ? 'bg-neutral-950 text-white'
                  : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Apartments Cards Grid */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {filteredProperties.map((prop) => (
          <div
            key={prop.id}
            className="flex flex-col justify-between rounded-lg border border-neutral-200 bg-white p-5"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded border border-neutral-200 bg-neutral-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prop.images[0] ?? ''}
                      alt={prop.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="inline-block rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-800">
                      {prop.category}
                    </span>
                    <h2 className="mt-1 text-sm font-bold text-neutral-950">
                      {prop.title}
                    </h2>
                    <p className="text-[11px] text-neutral-500">
                      {prop.estateName} • {prop.district}
                    </p>
                  </div>
                </div>
              </div>

              <p className="flex items-start gap-1.5 rounded bg-neutral-50 p-2.5 text-xs text-neutral-700 border border-neutral-200/70">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-500" />
                <span>{prop.address}</span>
              </p>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded border border-neutral-200 p-2">
                  <span className="block text-[10px] text-neutral-500">
                    Whole Apt Rate
                  </span>
                  <strong className="tabular-nums text-neutral-950">
                    {formatKoboToNaira(prop.nightlyRateKobo)}/night
                  </strong>
                </div>
                <div className="rounded border border-neutral-200 p-2">
                  <span className="block text-[10px] text-neutral-500">
                    Living Room
                  </span>
                  <strong className="tabular-nums text-neutral-950">
                    {prop.livingRoomSizeSqm} sqm
                  </strong>
                </div>
                <div className="rounded border border-neutral-200 p-2">
                  <span className="block text-[10px] text-neutral-500">
                    Ensuite Baths
                  </span>
                  <strong className="tabular-nums text-neutral-950">
                    {prop.defaultEnsuiteSizeSqm} sqm each
                  </strong>
                </div>
              </div>

              {prop.rooms.length > 0 && (
                <div className="space-y-1.5 border-t border-neutral-200 pt-2.5">
                  <p className="flex items-center gap-1 text-[11px] font-semibold text-neutral-700">
                    <BedDouble className="h-3.5 w-3.5" />
                    Individual Rooms ({prop.rooms.length})
                  </p>
                  <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                    {prop.rooms.map((rm) => (
                      <div
                        key={rm.id}
                        className="rounded border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[11px]"
                      >
                        <div className="flex items-center justify-between font-semibold text-neutral-900">
                          <span>{rm.name}</span>
                          <span className="tabular-nums">
                            {formatKoboToNaira(rm.nightlyRateKobo)}
                          </span>
                        </div>
                        <p className="text-[10px] text-neutral-500">
                          {rm.roomSizeSqm} sqm • Ensuite {rm.ensuiteSizeSqm} sqm
                          • {rm.bedType} • {rm.occupancy} pax
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-neutral-200 pt-3">
              <Link
                href={prop.isFlagship ? '/stays' : `/stays/${prop.slug}`}
                className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-950"
              >
                <span>View on Storefront</span>
                <ExternalLink className="h-3 w-3" />
              </Link>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(prop)}
                  className="inline-flex items-center gap-1 rounded border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                  <Pencil className="h-3 w-3" />
                  Edit Apartment &amp; Rooms
                </button>
                <button
                  type="button"
                  onClick={() => setPropertyToDelete(prop)}
                  className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Apartment & Rooms Create / Edit Modal */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="apartment-editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        >
          <div className="my-8 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h2
                id="apartment-editor-title"
                className="text-base font-bold text-neutral-950"
              >
                {editingId
                  ? `Edit Apartment: ${title}`
                  : 'Add New Short-Let Apartment'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close apartment editor"
                className="text-neutral-500 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-6 text-xs">
              {formError && (
                <div
                  role="alert"
                  className="rounded border border-red-200 bg-red-50 px-3.5 py-2.5 font-medium text-red-800"
                >
                  {formError}
                </div>
              )}

              {/* Section 1: Core Property & Location Details */}
              <div className="space-y-3">
                <h3 className="font-bold uppercase tracking-wider text-neutral-700">
                  1. Property Identity, Category &amp; Full Street Address
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700">
                      Apartment Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Category *
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 w-full rounded border border-neutral-300 bg-white px-3 py-2"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-neutral-700">
                      Subtitle / Summary Line *
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Estate Name *
                    </label>
                    <input
                      type="text"
                      value={estateName}
                      onChange={(e) => setEstateName(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-neutral-700">
                      District *
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-neutral-700">
                      Exact Street Address &amp; Landmark *
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                      placeholder="House 43, 1st Crescent, Off Drive 2, Prince & Princess Estate, First gate, opposite Kaura Market, Kaura District"
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Spatial Dimensions & Whole-Apartment Rates */}
              <div className="space-y-3 border-t border-neutral-200 pt-4">
                <h3 className="font-bold uppercase tracking-wider text-neutral-700">
                  2. Shared Space Dimensions &amp; Whole-Apartment Rates
                </h3>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Bedrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bedrooms}
                      onChange={(e) => setBedrooms(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Bathrooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Max Guests
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={maxGuests}
                      onChange={(e) => setMaxGuests(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Living Room (sqm) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={livingRoomSizeSqm}
                      onChange={(e) => setLivingRoomSizeSqm(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Ensuite Size (sqm) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={defaultEnsuiteSizeSqm}
                      onChange={(e) => setDefaultEnsuiteSizeSqm(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Whole Apt Nightly (₦) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={nightlyRateNaira}
                      onChange={(e) => setNightlyRateNaira(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Weekly Rate (₦) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={weeklyRateNaira}
                      onChange={(e) => setWeeklyRateNaira(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Monthly Rate (₦) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={monthlyRateNaira}
                      onChange={(e) => setMonthlyRateNaira(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-neutral-700">
                      Caution Deposit (₦)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={cautionDepositNaira}
                      onChange={(e) => setCautionDepositNaira(e.target.value)}
                      required
                      className="mt-1 w-full rounded border border-neutral-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700">
                    Primary Apartment Photo URL *
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
              </div>

              {/* Section 3: Individual Rooms CRUD */}
              <div className="space-y-3 border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-neutral-700">
                      3. Individual Room Cards &amp; Dimensions (
                      {roomsDraft.length})
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Configure each room&apos;s name, size (sqm), ensuite size
                      (sqm), bed type, occupancy, photo, and nightly rate.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRoomDraft}
                    className="inline-flex items-center gap-1 rounded border border-neutral-300 bg-white px-3 py-1.5 font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Room
                  </button>
                </div>

                <div className="space-y-3">
                  {roomsDraft.map((rm) => (
                    <div
                      key={rm.id}
                      className="rounded border border-neutral-200 bg-neutral-50 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-neutral-900">
                          {rm.name || 'Unnamed Room'} ({rm.roomSizeSqm} sqm • ₦
                          {rm.nightlyRateNaira}/night)
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveRoomDraft(rm.id)}
                          className="inline-flex items-center gap-1 text-red-600 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove Room
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-6">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Room Name *
                          </label>
                          <input
                            type="text"
                            value={rm.name}
                            onChange={(e) =>
                              handleUpdateRoomDraft(rm.id, {
                                name: e.target.value,
                              })
                            }
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Room Size (sqm) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={rm.roomSizeSqm}
                            onChange={(e) =>
                              handleUpdateRoomDraft(rm.id, {
                                roomSizeSqm: e.target.value,
                              })
                            }
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Ensuite (sqm) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={rm.ensuiteSizeSqm}
                            onChange={(e) =>
                              handleUpdateRoomDraft(rm.id, {
                                ensuiteSizeSqm: e.target.value,
                              })
                            }
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Occupancy (Pax) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={rm.occupancy}
                            onChange={(e) =>
                              handleUpdateRoomDraft(rm.id, {
                                occupancy: e.target.value,
                              })
                            }
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Nightly Rate (₦) *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={rm.nightlyRateNaira}
                            onChange={(e) =>
                              handleUpdateRoomDraft(rm.id, {
                                nightlyRateNaira: e.target.value,
                              })
                            }
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Bed Type *
                          </label>
                          <input
                            type="text"
                            value={rm.bedType}
                            onChange={(e) =>
                              handleUpdateRoomDraft(rm.id, {
                                bedType: e.target.value,
                              })
                            }
                            placeholder="e.g. 1 Queen-size bed or 2 Single beds"
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Room Photo URL *
                          </label>
                          <input
                            type="text"
                            value={rm.imageUrl}
                            onChange={(e) =>
                              handleUpdateRoomDraft(rm.id, {
                                imageUrl: e.target.value,
                              })
                            }
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Or Upload Room Photo
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleRoomFileUpload(rm.id, e)}
                            className="mt-1.5 block w-full text-[11px]"
                          />
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Room Description (Optional)
                          </label>
                          <input
                            type="text"
                            value={rm.description}
                            onChange={(e) =>
                              handleUpdateRoomDraft(rm.id, {
                                description: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 4: Structured "About the Apartment" & Categorized Amenities */}
              <div className="space-y-3 border-t border-neutral-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold uppercase tracking-wider text-neutral-700">
                      4. Structured &ldquo;About the Apartment&rdquo; &amp;
                      Amenity Categories
                    </h3>
                    <p className="text-[11px] text-neutral-500">
                      Edit the intro overview, categorized facilities, and
                      &ldquo;Our Promise&rdquo; statement.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddAmenityGroup}
                    className="inline-flex items-center gap-1 rounded border border-neutral-300 bg-white px-3 py-1.5 font-semibold text-neutral-800 hover:bg-neutral-50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Amenity Group
                  </button>
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700">
                    About the Apartment — Intro Paragraph
                  </label>
                  <textarea
                    rows={2}
                    value={aboutIntro}
                    onChange={(e) => setAboutIntro(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 p-2.5"
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {amenityGroupsDraft.map((group) => (
                    <div
                      key={group.id}
                      className="rounded border border-neutral-200 bg-neutral-50 p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={group.title}
                          onChange={(e) =>
                            handleUpdateAmenityGroup(group.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder="Group Title (e.g. Comfort & Living)"
                          className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveAmenityGroup(group.id)}
                          aria-label={`Remove ${group.title}`}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <textarea
                        rows={3}
                        value={group.itemsText}
                        onChange={(e) =>
                          handleUpdateAmenityGroup(group.id, {
                            itemsText: e.target.value,
                          })
                        }
                        placeholder="One amenity item per line..."
                        className="w-full rounded border border-neutral-300 bg-white p-2 text-[11px]"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block font-semibold text-neutral-700">
                    Our Promise Statement
                  </label>
                  <textarea
                    rows={2}
                    value={ourPromise}
                    onChange={(e) => setOurPromise(e.target.value)}
                    className="mt-1 w-full rounded border border-neutral-300 p-2.5"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-neutral-200 pt-4">
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
                  className="inline-flex items-center gap-1 rounded bg-neutral-950 px-5 py-2 font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSaving ? 'Saving...' : 'Save Apartment & Rooms'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CMS Categories Full CRUD Modal */}
      {isCategoriesModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="categories-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4"
        >
          <div className="my-8 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-neutral-200 bg-white p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div>
                <h2
                  id="categories-modal-title"
                  className="text-base font-bold text-neutral-950"
                >
                  Apartment Categories ({categories.length})
                </h2>
                <p className="text-xs text-neutral-500">
                  Create, rename, or remove apartment categories. Changes sync
                  immediately with apartment forms and storefront filters.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCategoriesModalOpen(false);
                  setCategoryToDelete(null);
                  setEditingCategoryId(null);
                }}
                aria-label="Close categories modal"
                className="text-neutral-500 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {categoryFeedback && (
              <div
                role="status"
                className={`rounded border px-3.5 py-2.5 text-xs font-medium ${
                  categoryFeedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                {categoryFeedback.message}
              </div>
            )}

            {/* Create New Category Form */}
            <form
              onSubmit={handleCreateCategory}
              className="rounded-md border border-neutral-200 bg-neutral-50 p-4 space-y-3 text-xs"
            >
              <span className="block font-bold text-neutral-800">
                Add New Category
              </span>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-12">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category Name (e.g. Serviced Studio)"
                  aria-label="New category name"
                  className="sm:col-span-5 rounded border border-neutral-300 bg-white px-3 py-2"
                />
                <input
                  type="text"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  placeholder="Short description (optional)"
                  aria-label="New category description"
                  className="sm:col-span-5 rounded border border-neutral-300 bg-white px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={isCategorySubmitting}
                  className="sm:col-span-2 inline-flex items-center justify-center gap-1 rounded bg-neutral-950 px-3 py-2 font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </form>

            {/* Existing Categories List */}
            <div className="divide-y divide-neutral-200 rounded-md border border-neutral-200">
              {categories.map((cat) => {
                const assignedCount = properties.filter(
                  (p) => p.category === cat.name
                ).length;
                const isEditingThis = editingCategoryId === cat.id;

                return (
                  <div key={cat.id} className="p-3.5 text-xs">
                    {isEditingThis ? (
                      <div className="space-y-2.5">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-600">
                              Category Name *
                            </label>
                            <input
                              type="text"
                              value={editCategoryName}
                              onChange={(e) =>
                                setEditCategoryName(e.target.value)
                              }
                              className="mt-1 w-full rounded border border-neutral-300 px-2.5 py-1.5 font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-neutral-600">
                              Description
                            </label>
                            <input
                              type="text"
                              value={editCategoryDesc}
                              onChange={(e) =>
                                setEditCategoryDesc(e.target.value)
                              }
                              className="mt-1 w-full rounded border border-neutral-300 px-2.5 py-1.5"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-neutral-500">
                            Renaming will automatically update {assignedCount}{' '}
                            assigned apartment(s).
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingCategoryId(null)}
                              className="rounded border border-neutral-300 px-2.5 py-1 font-medium text-neutral-700"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              disabled={isCategorySubmitting}
                              onClick={() => handleUpdateCategory(cat)}
                              className="rounded bg-neutral-950 px-3 py-1 font-semibold text-white"
                            >
                              Save Rename
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-950">
                              {cat.name}
                            </span>
                            <span className="rounded bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                              {assignedCount} apartment(s)
                            </span>
                          </div>
                          {cat.description && (
                            <p className="mt-0.5 text-[11px] text-neutral-500">
                              {cat.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => startEditingCategory(cat)}
                            className="inline-flex items-center gap-1 rounded border border-neutral-300 px-2.5 py-1 text-[11px] font-semibold text-neutral-800 hover:bg-neutral-50"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => promptDeleteCategory(cat)}
                            className="inline-flex items-center gap-1 rounded border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 hover:bg-red-100"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Category Deletion Confirmation & Safe Reassignment Prompt */}
            {categoryToDelete && (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 space-y-3 text-xs">
                <h3 className="font-bold text-red-950">
                  Delete Category &ldquo;{categoryToDelete.name}&rdquo;?
                </h3>
                {(() => {
                  const assignedCount = properties.filter(
                    (p) => p.category === categoryToDelete.name
                  ).length;
                  const otherCategories = categories.filter(
                    (c) => c.id !== categoryToDelete.id
                  );

                  return assignedCount > 0 ? (
                    <div className="space-y-2 text-red-900">
                      <p>
                        <strong>{assignedCount} apartment(s)</strong> are
                        currently assigned to{' '}
                        <strong>{categoryToDelete.name}</strong>. Choose a
                        category below to safely reassign them before deletion:
                      </p>
                      <select
                        value={reassignTargetName}
                        onChange={(e) => setReassignTargetName(e.target.value)}
                        className="w-full rounded border border-red-300 bg-white px-3 py-1.5 font-semibold text-neutral-900"
                      >
                        {otherCategories.map((c) => (
                          <option key={c.id} value={c.name}>
                            Reassign to: {c.name}
                          </option>
                        ))}
                        <option value="Uncategorized">
                          Reassign to: Uncategorized
                        </option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-red-900">
                      No apartments are currently assigned to this category.
                      This action cannot be undone.
                    </p>
                  );
                })()}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCategoryToDelete(null)}
                    className="rounded border border-neutral-300 bg-white px-3 py-1.5 font-medium text-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isCategorySubmitting}
                    onClick={handleConfirmDeleteCategory}
                    className="rounded bg-red-600 px-3.5 py-1.5 font-semibold text-white hover:bg-red-700"
                  >
                    {isCategorySubmitting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Apartment Confirmation Modal */}
      {propertyToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-950">
              Delete {propertyToDelete.title}?
            </h3>
            <p className="text-xs text-neutral-600">
              Delete <strong>{propertyToDelete.title}</strong>? This cannot be
              undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeletingProperty}
                onClick={() => setPropertyToDelete(null)}
                className="rounded border border-neutral-300 px-3.5 py-1.5 text-xs font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingProperty}
                onClick={handleConfirmDelete}
                className="rounded bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
              >
                {isDeletingProperty ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
