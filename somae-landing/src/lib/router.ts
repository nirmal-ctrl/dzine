import { useEffect, useState } from 'react';

/**
 * Tiny history-based router.
 *
 * The site only has two routes ('/' and '/privacy'), so we use the History
 * API directly instead of adding a routing dependency. Browser back/forward
 * works via the `popstate` listener in `usePath`.
 */

let pendingScroll: string | null = null;

/**
 * Navigate to a path. Pass `scrollTo` (a selector like '#demo') to land on a
 * specific section once the target page has mounted.
 */
export function navigate(to: string, opts?: { scrollTo?: string }) {
  pendingScroll = opts?.scrollTo ?? null;
  if (window.location.pathname !== to) {
    window.history.pushState({}, '', to);
  }
  window.dispatchEvent(new Event('popstate'));
}

/** Returns the section selector queued by `navigate(..., { scrollTo })`, if any. */
export function consumePendingScroll(): string | null {
  const target = pendingScroll;
  pendingScroll = null;
  return target;
}

/** Reactive current pathname — re-renders on navigate() and back/forward. */
export function usePath(): string {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}
