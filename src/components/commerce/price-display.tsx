import { formatKoboToNaira } from '@/lib/money';
import { cn } from '@/lib/utils';

export interface PriceDisplayProps {
  amountKobo: number;
  compareAtKobo?: number | null;
  periodSuffix?: '/ night' | '/ week' | '/ month' | '/ day' | '/ hr';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export { formatKoboToNaira };

export function PriceDisplay({
  amountKobo,
  compareAtKobo,
  periodSuffix,
  size = 'md',
  className,
}: PriceDisplayProps) {
  const formattedPrimary = formatKoboToNaira(amountKobo);
  const hasDiscount =
    typeof compareAtKobo === 'number' && compareAtKobo > amountKobo;

  const sizeStyles: Record<NonNullable<PriceDisplayProps['size']>, string> = {
    sm: 'text-sm font-semibold',
    md: 'text-base font-bold',
    lg: 'text-xl font-bold',
    hero: 'text-3xl sm:text-4xl font-bold tracking-tight',
  };

  return (
    <div
      className={cn(
        'inline-flex flex-wrap items-baseline gap-2 font-display tabular-nums text-[#1D1D1F]',
        className
      )}
    >
      <span className={sizeStyles[size]}>{formattedPrimary}</span>
      {periodSuffix ? (
        <span className="text-xs font-normal text-[#6E6E73]">
          {periodSuffix}
        </span>
      ) : null}
      {hasDiscount && compareAtKobo ? (
        <span className="text-xs text-[#86868B] line-through">
          {formatKoboToNaira(compareAtKobo)}
        </span>
      ) : null}
    </div>
  );
}
