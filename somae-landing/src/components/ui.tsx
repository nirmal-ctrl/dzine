import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { scrollToId } from '@/lib/scroll';

/** Small uppercase pill label above section headings ("HOW IT WORKS"). */
export function SectionTag({
  children,
  dark = false,
  className,
}: {
  children: ReactNode;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[10.5px] font-bold tracking-[0.18em] uppercase',
        dark
          ? 'bg-white/10 text-white/80 ring-1 ring-white/15'
          : 'bg-somae-mist text-somae-ink/60 ring-1 ring-somae-blue/15',
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-somae-blue animate-pulse-dot" />
      {children}
    </span>
  );
}

type PillButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: 'primary' | 'ghost' | 'light';
  className?: string;
  withArrow?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
};

/** The Somae pill button — one shape, three weights. */
export function PillButton({
  children,
  href,
  variant = 'primary',
  className,
  withArrow = false,
  type = 'button',
  onClick,
}: PillButtonProps) {
  const styles = cn(
    'group inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-full px-7 py-3.5 text-[14.5px] font-semibold transition-all duration-300 active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-somae-blue',
    variant === 'primary' &&
      'bg-somae-ink text-white hover:-translate-y-0.5 hover:shadow-lift',
    variant === 'ghost' &&
      'bg-transparent text-somae-ink ring-1 ring-somae-ink/15 hover:-translate-y-0.5 hover:ring-somae-ink/30',
    variant === 'light' &&
      'bg-white text-somae-ink shadow-chip hover:-translate-y-0.5 hover:shadow-lift',
    className,
  );

  const inner = (
    <>
      {children}
      {withArrow && (
        <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
      )}
    </>
  );

  if (href) {
    return (
      <button className={styles} onClick={() => scrollToId(href)} type={type}>
        {inner}
      </button>
    );
  }
  return (
    <button className={styles} type={type} onClick={onClick}>
      {inner}
    </button>
  );
}
