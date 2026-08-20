export type ClassValue = string | false | null | undefined;

/** Tiny className joiner — no dependency needed. */
export function cn(...parts: ClassValue[]): string {
  return parts.filter(Boolean).join(' ');
}
