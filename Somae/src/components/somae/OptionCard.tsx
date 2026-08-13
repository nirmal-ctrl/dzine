import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OptionCardProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    selected: boolean;
    /** Layout of the card content */
    layout?: 'row' | 'column';
    children: React.ReactNode;
}

/**
 * Selectable option card with the Somae selected treatment:
 * blue ring + soft blue tint + checkmark in the top-right corner.
 */
export const OptionCard = React.forwardRef<HTMLButtonElement, OptionCardProps>(
    ({ selected, layout = 'row', className, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                type="button"
                aria-pressed={selected}
                className={cn(
                    'group relative w-full rounded-2xl border bg-white/80 text-left shadow-card backdrop-blur-sm transition-all duration-300',
                    'hover:-translate-y-0.5 hover:border-somae-blue/40 hover:bg-white hover:shadow-card-hover',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-somae-blue/40',
                    selected
                        ? 'border-somae-blue/60 bg-somae-blue-tint/70 shadow-[0_0_0_1px_hsl(var(--somae-blue)/0.35),0_10px_24px_-12px_hsl(var(--somae-blue)/0.35)]'
                        : 'border-border/80',
                    layout === 'row'
                        ? 'flex items-center gap-3 p-3.5'
                        : 'flex flex-col items-center gap-2 px-3 py-4 text-center',
                    className
                )}
                {...props}
            >
                {children}
                {selected && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-somae-blue text-white shadow-[0_2px_8px_-2px_hsl(var(--somae-blue)/0.7)] animate-in zoom-in-50 duration-200">
                        <Check className="h-3 w-3" strokeWidth={3.5} />
                    </span>
                )}
            </button>
        );
    }
);
OptionCard.displayName = 'OptionCard';
