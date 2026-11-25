import Link from 'next/link';
import type { CmsPageElementSection } from '@/types';

interface CmsCustomSectionsProps {
  sections: CmsPageElementSection[];
}

export function CmsCustomSections({ sections }: CmsCustomSectionsProps) {
  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Additional Page Content"
      className="border-t border-neutral-200 bg-white py-12"
    >
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        {sections.map((section) => (
          <div
            key={section.id}
            className="grid grid-cols-1 items-center gap-8 border border-neutral-200 bg-[#FAFAFA] p-6 sm:p-8 lg:grid-cols-12"
          >
            <div
              className={
                section.imageUrl ? 'lg:col-span-7' : 'lg:col-span-12'
              }
            >
              {section.eyebrow && (
                <p className="text-xs font-medium uppercase tracking-widest text-neutral-500">
                  {section.eyebrow}
                </p>
              )}
              <h2 className="mt-2 font-serif text-2xl font-normal tracking-tight text-neutral-950 sm:text-3xl">
                {section.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-neutral-600">
                {section.description}
              </p>
              {section.ctaText && section.ctaHref && (
                <div className="mt-5">
                  <Link
                    href={section.ctaHref}
                    className="inline-flex h-10 items-center justify-center bg-neutral-950 px-5 text-xs font-medium uppercase tracking-widest text-white transition-colors hover:bg-neutral-800"
                  >
                    {section.ctaText}
                  </Link>
                </div>
              )}
            </div>

            {section.imageUrl && (
              <div className="lg:col-span-5">
                <div className="aspect-[16/10] overflow-hidden border border-neutral-200 bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={section.imageUrl}
                    alt={section.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
