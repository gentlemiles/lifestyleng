'use client';

import { cn } from '@/lib/utils';

export interface SegmentedPillarOption<T extends string> {
  id: T;
  label: string;
  badge?: string;
}

interface SegmentedPillarControlProps<T extends string> {
  options: ReadonlyArray<SegmentedPillarOption<T>>;
  value: T;
  onChange: (nextValue: T) => void;
  className?: string;
  ariaLabel?: string;
}

export function SegmentedPillarControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ariaLabel = 'Select service pillar',
}: SegmentedPillarControlProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex flex-wrap items-center gap-1 rounded-full bg-[#E8E8ED] p-1',
        className
      )}
    >
      {options.map((option) => {
        const isActive = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              'relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-white text-[#1D1D1F] shadow-sm font-semibold'
                : 'text-[#6E6E73] hover:text-[#1D1D1F]'
            )}
          >
            <span>{option.label}</span>
            {option.badge ? (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  isActive
                    ? 'bg-[#F5F5F7] text-[#1D1D1F]'
                    : 'bg-black/[0.05] text-[#6E6E73]'
                )}
              >
                {option.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
