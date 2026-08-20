# Somae — Premium Landing Website

A cinematic, scroll-driven landing experience for **Somae**, your AI creative
companion. Apple-level product presentation meets playful 3D character design.

## Quick start

```bash
npm install
npm run dev        # start the dev server
npm run build      # type-check + production build
npm run preview    # preview the production build
```

## The experience

One continuous visual story:

1. **Hero** — "Create better. Create faster." Somae floats, breathes, and
   greets you.
2. **The problem** — the traditional workflow (Idea → Prompt → Search → …)
   assembles, then collapses into **Idea → Somae → Done**.
3. **How it works** — add your brand, choose a style, describe your idea;
   the prompt types itself and becomes a visual.
4. **The studio** — a dark room with a physical, depth-based carousel of
   generated visuals.
5. **Templates** — "You don't need the perfect prompt." 3D tilt-on-hover cards.
6. **From idea to visual** — a pinned cinematic: prompt → Somae → orbiting
   creative elements → finished poster.
7. **Why Somae** — "Less prompting. More creating."
8. **Quality** — scattered visuals settle into a clean composition.
9. **Final CTA** — Somae returns; join the private beta.
10. **Footer** — minimal, with Somae peeking over the edge.

On desktop, a single **avatar journey layer** carries Somae through the whole
page with scroll-scrubbed poses and expression crossfades. On mobile and for
reduced-motion users, sections render their own calm inline avatars instead.

## Brand assets

The official avatar lives in `public/assets/avatar/` (optimized WebP, generated
from the shipped extension asset). **Never redraw, recolor, or distort it.**

### Adding expression images

Drop these files into `public/assets/avatar/expressions/`:

| File           | Where it appears                        |
| -------------- | --------------------------------------- |
| `thinking.png` | How-it-works / ideation moments         |
| `happy.png`    | Successful generation (idea → visual)   |
| `excited.png`  | Results / quality showcase              |
| `calm.png`     | Final CTA                               |

Then run `npm run optimize:images`. Until an expression exists, the primary
avatar is used in its place automatically.

## Wiring the beta form

Set `BETA_ENDPOINT` in `src/sections/FinalCTA.tsx` to your waitlist API.
Leave it empty to simulate signups locally (stored in `localStorage`).

## Tech

Vite · React 19 · TypeScript · Tailwind CSS v4 · GSAP + ScrollTrigger ·
Lenis · self-hosted fonts (Plus Jakarta Sans, Inter, Caveat).

Performance: transform/opacity-only animation, optimized WebP assets,
`prefers-reduced-motion` fallbacks, responsive down to small phones.
