'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Check, ExternalLink } from 'lucide-react';
import type {
  CmsHeroTile,
  CmsPageConfig,
  CmsPageElementSection,
} from '@/types';
import { upsertPageConfigCmsAction } from '@/server/actions/cms';

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

export function PagesCmsClient({
  initialPages,
}: {
  initialPages: CmsPageConfig[];
}) {
  const router = useRouter();
  const [pages, setPages] = useState<CmsPageConfig[]>(initialPages);
  const [selectedPath, setSelectedPath] = useState<CmsPageConfig['path']>(
    initialPages[0]?.path ?? '/'
  );

  const activePage = pages.find((p) => p.path === selectedPath) ?? pages[0];

  const [heroEyebrow, setHeroEyebrow] = useState(
    activePage?.heroEyebrow ?? ''
  );
  const [heroHeadline, setHeroHeadline] = useState(
    activePage?.heroHeadline ?? ''
  );
  const [heroDescription, setHeroDescription] = useState(
    activePage?.heroDescription ?? ''
  );
  const [primaryCtaText, setPrimaryCtaText] = useState(
    activePage?.primaryCtaText ?? ''
  );
  const [primaryCtaHref, setPrimaryCtaHref] = useState(
    activePage?.primaryCtaHref ?? ''
  );
  const [secondaryCtaText, setSecondaryCtaText] = useState(
    activePage?.secondaryCtaText ?? ''
  );
  const [secondaryCtaHref, setSecondaryCtaHref] = useState(
    activePage?.secondaryCtaHref ?? ''
  );
  const [announcementText, setAnnouncementText] = useState(
    activePage?.announcementText ?? ''
  );
  const [heroTiles, setHeroTiles] = useState<CmsHeroTile[]>(
    activePage?.heroTiles ?? []
  );
  const [customSections, setCustomSections] = useState<CmsPageElementSection[]>(
    activePage?.customSections ?? []
  );

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [sectionToDelete, setSectionToDelete] =
    useState<CmsPageElementSection | null>(null);

  function selectPage(path: CmsPageConfig['path']) {
    setSelectedPath(path);
    setFeedback(null);
    const target = pages.find((p) => p.path === path);
    if (!target) return;
    setHeroEyebrow(target.heroEyebrow);
    setHeroHeadline(target.heroHeadline);
    setHeroDescription(target.heroDescription);
    setPrimaryCtaText(target.primaryCtaText);
    setPrimaryCtaHref(target.primaryCtaHref);
    setSecondaryCtaText(target.secondaryCtaText ?? '');
    setSecondaryCtaHref(target.secondaryCtaHref ?? '');
    setAnnouncementText(target.announcementText ?? '');
    setHeroTiles(target.heroTiles);
    setCustomSections(target.customSections);
  }

  function handleAddSection() {
    const newSection: CmsPageElementSection = {
      id: `section-${Date.now()}`,
      eyebrow: 'Store Notice',
      title: 'New Page Section Heading',
      description: 'Write clear information for shoppers on this page.',
      ctaText: 'Shop Collection',
      ctaHref: '/shop/clothes',
      imageUrl: '',
    };
    setCustomSections((prev) => [...prev, newSection]);
  }

  function handleUpdateSection(
    id: string,
    patch: Partial<CmsPageElementSection>
  ) {
    setCustomSections((prev) =>
      prev.map((sec) => (sec.id === id ? { ...sec, ...patch } : sec))
    );
  }

  function handleSectionImageFile(
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleUpdateSection(id, { imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleHeroTileChange(index: number, patch: Partial<CmsHeroTile>) {
    setHeroTiles((prev) =>
      prev.map((tile, idx) => (idx === index ? { ...tile, ...patch } : tile))
    );
  }

  function handleHeroTileFile(
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        handleHeroTileChange(index, { imageUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleSavePage(e: React.FormEvent) {
    e.preventDefault();
    if (!activePage) return;
    setIsSaving(true);
    setFeedback(null);

    try {
      const response = await upsertPageConfigCmsAction({
        path: activePage.path,
        pageName: activePage.pageName,
        heroEyebrow,
        heroHeadline,
        heroDescription,
        primaryCtaText,
        primaryCtaHref,
        secondaryCtaText,
        secondaryCtaHref,
        announcementText,
        heroTiles,
        customSections,
      });

      if (response.error) {
        setFeedback({ type: 'error', message: response.error.message });
        return;
      }

      const updated = response.data;
      setPages((prev) =>
        prev.map((p) => (p.path === updated.path ? updated : p))
      );
      setFeedback({
        type: 'success',
        message: `Saved "${updated.pageName}" (${updated.path}). Changes are live on the storefront.`,
      });
      notifyStorefrontSync();
      router.refresh();
    } catch {
      setFeedback({
        type: 'error',
        message: 'Unable to save page changes right now. Please try again.',
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <aside className="space-y-2 lg:col-span-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          Storefront Pages ({pages.length})
        </p>
        <div className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 bg-white">
          {pages.map((p) => {
            const isSelected = p.path === selectedPath;
            return (
              <button
                key={p.path}
                type="button"
                onClick={() => selectPage(p.path)}
                className={`flex w-full items-center justify-between px-3.5 py-3 text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-neutral-950 font-semibold text-white'
                    : 'text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div>
                  <span className="block">{p.pageName}</span>
                  <span
                    className={`text-[11px] ${
                      isSelected ? 'text-neutral-300' : 'text-neutral-400'
                    }`}
                  >
                    {p.path}
                  </span>
                </div>
                {p.customSections.length > 0 && (
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-neutral-100 text-neutral-600'
                    }`}
                  >
                    {p.customSections.length} sec
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      <div className="lg:col-span-9">
        {activePage ? (
          <form
            onSubmit={handleSavePage}
            className="space-y-6 rounded-lg border border-neutral-200 bg-white p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-4">
              <div>
                <h2 className="text-base font-bold text-neutral-950">
                  Edit Page: {activePage.pageName}
                </h2>
                <p className="text-xs text-neutral-500">
                  Route: <code>{activePage.path}</code>
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={activePage.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  <span>Preview Page</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-md bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
                >
                  <Check className="h-3.5 w-3.5" />
                  {isSaving ? 'Saving...' : 'Save Page Changes'}
                </button>
              </div>
            </div>

            {feedback && (
              <div
                role="status"
                className={`rounded-md border px-4 py-3 text-xs font-medium ${
                  feedback.type === 'success'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                    : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                {feedback.message}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700">
                  Eyebrow / Top Label
                </label>
                <input
                  type="text"
                  value={heroEyebrow}
                  onChange={(e) => setHeroEyebrow(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700">
                  Page Headline (H1)
                </label>
                <input
                  type="text"
                  value={heroHeadline}
                  onChange={(e) => setHeroHeadline(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm font-semibold text-neutral-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700">
                  Lead Description
                </label>
                <textarea
                  rows={3}
                  value={heroDescription}
                  onChange={(e) => setHeroDescription(e.target.value)}
                  required
                  className="mt-1 w-full rounded-md border border-neutral-300 p-3 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Primary Button Label
                </label>
                <input
                  type="text"
                  value={primaryCtaText}
                  onChange={(e) => setPrimaryCtaText(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Primary Button Link
                </label>
                <input
                  type="text"
                  value={primaryCtaHref}
                  onChange={(e) => setPrimaryCtaHref(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Secondary Button Label
                </label>
                <input
                  type="text"
                  value={secondaryCtaText}
                  onChange={(e) => setSecondaryCtaText(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700">
                  Secondary Button Link
                </label>
                <input
                  type="text"
                  value={secondaryCtaHref}
                  onChange={(e) => setSecondaryCtaHref(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700">
                  Sub-Banner / Announcement Line
                </label>
                <input
                  type="text"
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-xs text-neutral-900"
                />
              </div>
            </div>

            {heroTiles.length > 0 && (
              <div className="space-y-3 border-t border-neutral-200 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Hero Banner Imagery &amp; Cards ({heroTiles.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {heroTiles.map((tile, idx) => (
                    <div
                      key={tile.id}
                      className="space-y-2 rounded-md border border-neutral-200 bg-neutral-50 p-3"
                    >
                      <div className="aspect-[16/10] overflow-hidden rounded border border-neutral-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={tile.imageUrl}
                          alt={tile.label}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <input
                        type="text"
                        value={tile.label}
                        onChange={(e) =>
                          handleHeroTileChange(idx, { label: e.target.value })
                        }
                        placeholder="Tile Caption"
                        className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium"
                      />
                      <input
                        type="text"
                        value={tile.href}
                        onChange={(e) =>
                          handleHeroTileChange(idx, { href: e.target.value })
                        }
                        placeholder="Link URL"
                        className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <input
                        type="text"
                        value={tile.imageUrl}
                        onChange={(e) =>
                          handleHeroTileChange(idx, {
                            imageUrl: e.target.value,
                          })
                        }
                        placeholder="Image URL"
                        className="w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                      />
                      <label className="block text-[11px] text-neutral-600">
                        Or upload image file:
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleHeroTileFile(idx, e)}
                          className="mt-1 block w-full text-[11px]"
                        />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 border-t border-neutral-200 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                    Page Sections &amp; Content Blocks ({customSections.length})
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Add promotional banners, store announcements, or editorial
                    blocks with imagery to this page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="inline-flex items-center gap-1 rounded-md border border-neutral-300 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Page Section
                </button>
              </div>

              {customSections.length === 0 ? (
                <p className="rounded-md border border-dashed border-neutral-200 p-6 text-center text-xs text-neutral-500">
                  No custom content blocks on this page yet. Click &ldquo;Add
                  Page Section&rdquo; to add one.
                </p>
              ) : (
                <div className="space-y-4">
                  {customSections.map((sec) => (
                    <div
                      key={sec.id}
                      className="space-y-3 rounded-md border border-neutral-200 bg-neutral-50 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-800">
                          Section: {sec.title || 'Untitled'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setSectionToDelete(sec)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove Section
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Eyebrow Label
                          </label>
                          <input
                            type="text"
                            value={sec.eyebrow ?? ''}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                eyebrow: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Section Heading
                          </label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                title: e.target.value,
                              })
                            }
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-semibold"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Body Copy
                          </label>
                          <textarea
                            rows={2}
                            value={sec.description}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                description: e.target.value,
                              })
                            }
                            required
                            className="mt-1 w-full rounded border border-neutral-300 bg-white p-2.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Button Label (Optional)
                          </label>
                          <input
                            type="text"
                            value={sec.ctaText ?? ''}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                ctaText: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Button Link URL (Optional)
                          </label>
                          <input
                            type="text"
                            value={sec.ctaHref ?? ''}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                ctaHref: e.target.value,
                              })
                            }
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Section Image URL (Optional)
                          </label>
                          <input
                            type="text"
                            value={sec.imageUrl ?? ''}
                            onChange={(e) =>
                              handleUpdateSection(sec.id, {
                                imageUrl: e.target.value,
                              })
                            }
                            placeholder="https://..."
                            className="mt-1 w-full rounded border border-neutral-300 bg-white px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-medium text-neutral-600">
                            Or Upload Image File
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleSectionImageFile(sec.id, e)}
                            className="mt-1.5 block w-full text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        ) : null}
      </div>

      {sectionToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-md space-y-4 rounded-lg border border-neutral-200 bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-950">
              Delete &ldquo;{sectionToDelete.title}&rdquo;?
            </h3>
            <p className="text-xs text-neutral-600">
              Delete {sectionToDelete.title}? This cannot be undone once you
              save the page.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSectionToDelete(null)}
                className="rounded-md border border-neutral-300 px-3.5 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomSections((prev) =>
                    prev.filter((s) => s.id !== sectionToDelete.id)
                  );
                  setSectionToDelete(null);
                }}
                className="rounded-md bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
