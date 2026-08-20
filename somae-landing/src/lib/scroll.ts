import type Lenis from 'lenis';

/** Shared Lenis instance so nav links can smooth-scroll to sections. */
let lenis: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenis = instance;
}

export function getLenis() {
  return lenis;
}

export function scrollToId(selector: string) {
  const el = document.querySelector(selector);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el as HTMLElement, { offset: -64, duration: 1.6 });
  } else {
    (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
