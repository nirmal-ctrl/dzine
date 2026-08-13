# System Patterns

## Architecture

Single React (Vite + TS + Tailwind + shadcn/ui) side-panel app. Views are switched in `App.tsx` via a `View` union: `create | generating | result | settings | activate | crop`.

```
App (single centered column, NO sidebar)
├── License gate (useLicense + LicenseView) — unchanged
├── Header (compact) — æ somae + Beta 01 left; help / settings / close right
├── CreateView      — heading + BrandChip (compact brand control) + 6 sections + Generate
├── GeneratingView  — GlowOrb (Siri-inspired, energy tied to stage) + staged checklist
├── ResultView      — tabs (Results/Variants/History), preview, variants rail,
│                     actions (Download/Remake/More), refinement, feedback
├── BrandDialog     — upload/change/remove logo + brand name (persisted)
├── SettingsView    — API credentials, text model, image engine, license
└── CropView        — crop images picked from any webpage (content script)
```

## Key Patterns

- **Persistence**: `usePersistentState(key, initial)` hook backed by `chrome.storage.local` (falls back to `localStorage` in plain dev). Keys: `somae_brand`, `somae_brief`, `somae_history`, `huenxt_config`.
- **Creative system** (`src/shared/creativeSystem.ts`): internal art direction per style (Premium Editorial / Bold & Vibrant / Minimal Clean / Luxury Modern), per content type and goal. `buildCreativePrompt / buildVariantPrompt / buildRemakePrompt / buildRefinementPrompt / buildSmartPromptRequest` produce the model-ready prompts. Never exposed to the user.
- **Generation pipeline** (`App.tsx::runImageGeneration`): Gemini 3 Pro Image (`gemini-3-pro-image-preview`, supports inline logo + reference + base image, imageSize 1K/2K/4K, aspect ratio per content type) or Imagen 4.0 (text-only fallback, selectable in Settings). Vertex AI mode via `VITE_IS_NOT_API_ACCESS=true`.
- **Logo preservation**: logo is attached as an inline image with an explicit instruction to preserve it accurately (never redesign/reinterpret/modify/replace).
- **History**: `Generation` records (brief snapshot + `GeneratedAsset[]` with kind original/variant/refinement/remake + feedback), capped at 12.
- **Web image picking**: content script (`src/content/index.tsx`) → `IMAGE_SELECTED` → `pending_crop` in storage → CropView → cropped image becomes the brief's reference image.

## Design Tokens

Defined in `src/index.css` + `tailwind.config.js`: sidebar deep navy (`--sidebar*`), main canvas soft off-white, primary Somae blue (`--somae-blue`), warm orange accent (`--somae-orange`, used sparingly), subtle cool-gray borders, soft diffused shadows (`shadow-card`), selected state = blue border + blue tint + checkmark (`OptionCard`).
