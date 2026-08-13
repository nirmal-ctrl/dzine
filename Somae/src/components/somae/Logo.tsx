import { cn } from '@/lib/utils';

interface LogoProps {
    /** light = for dark surfaces, dark = for light surfaces */
    tone?: 'light' | 'dark';
    showBadge?: boolean;
    className?: string;
}

/** Somae wordmark — "æ somae" + Beta 01 badge */
export function Logo({ tone = 'dark', showBadge = true, className }: LogoProps) {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <span
                className={cn(
                    'text-[20px] font-extrabold leading-none tracking-[-0.03em]',
                    tone === 'light' ? 'text-white' : 'text-somae-ink'
                )}
            >
                <span className="text-somae-blue">æ</span>&nbsp;somae
            </span>
            {showBadge && (
                <span className="rounded-full bg-somae-blue px-2 py-[3.5px] text-[10px] font-semibold leading-none tracking-wide text-white shadow-[0_2px_8px_-2px_hsl(var(--somae-blue)/0.6)]">
                    Beta 01
                </span>
            )}
        </div>
    );
}
