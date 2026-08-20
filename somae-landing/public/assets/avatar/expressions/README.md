# Somae expression images

Drop the expressive Somae avatar images here using these exact names:

- `thinking.png` — used in ideation / "how it works" moments
- `happy.png` — used when a visual is successfully generated
- `excited.png` — used for the final result / showcase moments
- `calm.png` — used near the final CTA and footer

Then run:

```bash
npm run optimize:images
```

Each PNG is converted to an optimized `*.webp` next to the original, and the
site picks it up automatically (see `src/lib/avatars.ts`). Until an expression
image exists, the primary Somae avatar is used in its place — the character is
never redrawn, recolored, or distorted.
