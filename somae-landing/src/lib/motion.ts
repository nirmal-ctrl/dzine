/** Motion preferences + shared easing tokens. */

export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const EASE = {
  out: 'power3.out',
  inOut: 'power3.inOut',
  expo: 'expo.out',
  soft: 'sine.inOut',
} as const;
