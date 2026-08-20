/**
 * Somae avatar asset manifest.
 *
 * The primary avatar is the single source of truth for the character.
 * Expression images are OPTIONAL: drop `thinking.png`, `happy.png`,
 * `excited.png` or `calm.png` into `public/assets/avatar/expressions/`,
 * run `npm run optimize:images`, and they are picked up automatically.
 * Until then every expression gracefully falls back to the primary avatar
 * (handled by the `onError` fallback in the Avatar components) — the
 * character is never redrawn, recolored, or distorted.
 */

export type SomaeExpression = 'default' | 'thinking' | 'happy' | 'excited' | 'calm';

const AVATAR_BASE = '/assets/avatar';

export const AVATAR_SRC: Record<SomaeExpression, string> = {
  default: `${AVATAR_BASE}/avatar-992.webp`,
  thinking: `${AVATAR_BASE}/expressions/thinking.webp`,
  happy: `${AVATAR_BASE}/expressions/happy.webp`,
  excited: `${AVATAR_BASE}/expressions/excited.webp`,
  calm: `${AVATAR_BASE}/expressions/calm.webp`,
};

export const AVATAR_SRC_SET = `${AVATAR_BASE}/avatar-512.webp 512w, ${AVATAR_BASE}/avatar-992.webp 992w`;

export const AVATAR_SMALL = `${AVATAR_BASE}/avatar-256.webp`;

export const LOGO_SRC = '/assets/logo/logo-256.webp';

export const ALL_EXPRESSIONS: SomaeExpression[] = [
  'default',
  'thinking',
  'happy',
  'excited',
  'calm',
];
