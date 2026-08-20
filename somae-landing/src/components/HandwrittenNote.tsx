import { cn } from '@/lib/cn';

type HandwrittenNoteProps = {
  children: string;
  className?: string;
  /** Draw a small hand-drawn curved arrow under the note. */
  arrow?: 'left' | 'right' | 'down' | 'none';
  rotate?: number;
};

/**
 * Small handwritten annotations in Somae's playful voice
 * ("Hi there! I'm Somae!") with an optional hand-drawn arrow.
 */
export function HandwrittenNote({
  children,
  className,
  arrow = 'none',
  rotate = -3,
}: HandwrittenNoteProps) {
  return (
    <div
      aria-hidden
      className={cn('pointer-events-none select-none', className)}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      <p className="font-hand text-[clamp(18px,1.6vw,24px)] font-semibold whitespace-pre-line text-somae-ink/80">
        {children}
      </p>
      {arrow !== 'none' && (
        <svg
          viewBox="0 0 60 44"
          className={cn(
            'mt-1 h-8 w-11 text-somae-ink/70',
            arrow === 'left' && '-scale-x-100',
            arrow === 'down' && 'rotate-[100deg]',
          )}
          fill="none"
        >
          <path
            d="M6 6 C 22 30, 38 34, 52 30 M 52 30 l -9 -6 M 52 30 l -2 10"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}
