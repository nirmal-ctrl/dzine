import { cn } from "@/lib/utils";

/**
 * Somae logo — the æ ligature mark + lowercase wordmark.
 * Renders as pure type so it stays crisp at any size.
 */
export function SomaeLogo({
  className,
  markClassName,
  wordClassName,
  showWord = true,
}: {
  className?: string;
  markClassName?: string;
  wordClassName?: string;
  showWord?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-baseline gap-2 select-none", className)}>
      <span
        aria-hidden
        className={cn(
          "font-serif italic leading-[0.8] tracking-[-0.08em] text-[1.6em] translate-y-[0.08em]",
          markClassName
        )}
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        æ
      </span>
      {showWord && (
        <span
          className={cn(
            "text-[1.15em] font-semibold tracking-[-0.02em] lowercase",
            wordClassName
          )}
        >
          somae
        </span>
      )}
    </span>
  );
}

/** Big standalone æ used on gradient panels / analysis screens */
export function AeMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "font-serif italic leading-none tracking-[-0.08em] select-none",
        className
      )}
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      æ
    </span>
  );
}
