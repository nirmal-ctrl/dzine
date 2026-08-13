import { ImagePlus } from 'lucide-react';
import type { BrandProfile } from '@/shared/types';

interface BrandChipProps {
    brand: BrandProfile;
    onClick: () => void;
}

/**
 * Compact connected-brand indicator — [Logo] name • Active | Change.
 * Opens the brand dialog to upload / replace / remove the logo.
 */
export function BrandChip({ brand, onClick }: BrandChipProps) {
    const hasLogo = Boolean(brand.logoDataUrl);
    const brandName = brand.name.trim() || 'Your Brand';

    return (
        <div className="glass-soft inline-flex max-w-full items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-2 shadow-soft ring-1 ring-white/70">
            {/* Logo preview */}
            <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-black/5">
                {hasLogo ? (
                    <img
                        src={brand.logoDataUrl!}
                        alt={brandName}
                        className="h-full w-full object-contain"
                    />
                ) : (
                    <ImagePlus className="h-3.5 w-3.5 text-somae-ink/40" />
                )}
            </span>

            {/* Name + status */}
            <span className="flex min-w-0 items-center gap-1.5">
                <span className="max-w-[200px] truncate text-[13px] font-semibold text-somae-ink">
                    {brandName}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-[11px] font-medium text-somae-ink/50">
                    <span
                        className={
                            hasLogo ? 'h-1.5 w-1.5 rounded-full bg-somae-blue' : 'h-1.5 w-1.5 rounded-full bg-somae-ink/25'
                        }
                    />
                    {hasLogo ? 'Active' : 'Not set up'}
                </span>
            </span>

            {/* Divider */}
            <span className="h-4 w-px bg-somae-ink/10" />

            {/* Change action */}
            <button
                type="button"
                onClick={onClick}
                className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-somae-blue transition-colors duration-300 hover:bg-somae-blue-tint"
            >
                {hasLogo ? 'Change' : 'Add logo'}
            </button>
        </div>
    );
}
