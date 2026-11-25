import { MessageCircle } from 'lucide-react';
import { buildWhatsAppUrl } from '@/lib/whatsapp';
import type { CorporateDivisionId } from '@/types';
import { cn } from '@/lib/utils';

interface WhatsAppConciergeButtonProps {
  division: CorporateDivisionId;
  label?: string;
  contextMessage: string;
  className?: string;
  variant?: 'emerald' | 'mtn-gold' | 'obsidian';
}

export function WhatsAppConciergeButton({
  label = 'Chat on WhatsApp',
  contextMessage,
  className,
  variant = 'emerald',
}: WhatsAppConciergeButtonProps) {
  const url = buildWhatsAppUrl(contextMessage);

  const variantClasses: Record<
    NonNullable<WhatsAppConciergeButtonProps['variant']>,
    string
  > = {
    emerald: 'bg-[#10B981] hover:bg-[#059669] text-white',
    'mtn-gold': 'bg-[#FFCC00] hover:bg-[#E6B800] text-[#1D1D1F]',
    obsidian: 'bg-[#1D1D1F] hover:bg-black/85 text-white',
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold transition shadow-xs',
        variantClasses[variant],
        className
      )}
    >
      <MessageCircle className="h-4 w-4" />
      <span>{label}</span>
    </a>
  );
}
