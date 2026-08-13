# Active Context

## Current Focus

Layout refinement (v1.1): sidebar REMOVED per updated direction — compact top `Header` (æ somae + Beta 01 left; help/settings/close right), brand control is now a compact `BrandChip` pill under the Create heading (opens `BrandDialog`), no permanent step navigation. `GeneratingView` gained an original Siri-inspired pure-CSS `GlowOrb` (deep blue core, cyan/violet light, halo; energy levels low/medium/high/settling tied to the checklist stage; orb CSS lives at the bottom of `src/index.css`). `Sidebar.tsx` deleted. Build ✓.

## Recent Changes

- Rebranded Huenxt → Somae (manifest, index.html, package.json, settings/license copy).
- New design system: light theme tokens, Somae blue primary, orange secondary accent, dark navy sidebar tokens; removed forced dark mode.
- New components in `src/components/somae/`: `Logo`, `Sidebar`, `BrandDialog`, `OptionCard`, `CreateView`, `GeneratingView`, `ResultView`.
- New `src/shared/creativeSystem.ts` — internal creative direction + prompt builders (input layer → creative system layer → generation request).
- New `src/hooks/usePersistentState.ts` — chrome.storage-backed state.
- `App.tsx` fully rewritten: create → generating → result flow, remake/variant/refine, feedback, history (cap 12), brand persistence, Smart Prompt, crop flow now feeds the reference image.
- SettingsView: added Image Engine select (Gemini 3 Pro Image vs Imagen 4.0), restyled.
- Deleted legacy: CategoryCard, GeneratedImageView, GenerationTraceView, sections/* (Strategy/Inspiration/ImagenConfig), utils/imageGenerator, utils/imagenPromptBuilder.

## Known Notes

- `npm install` blocked some postinstall scripts (esbuild etc.) via allow-scripts — build still works; run `npm approve-scripts` if esbuild binary issues appear on a fresh machine.
- Lint: only pre-existing shadcn `react-refresh/only-export-components` errors in `ui/badge.tsx` / `ui/button.tsx` remain (untouched, standard shadcn pattern).
- Bundle ~648 kB (Google GenAI SDK) — fine for an extension.

## Next Steps

- Manual QA in Chrome: load `dist/` as unpacked extension, run full flow (brand → brief → generate → variants → refine → download → feedback).
- Consider code-splitting the GenAI SDK if startup time matters.

## Local Dev Backend (license validation)

- No system Postgres/Docker on this machine → embedded Postgres lives in `dzine/devtools/` (`node start-db.mjs`, port 5432, db `somae`, user/pass postgres/postgres, data persisted in `devtools/data/db`).
- Webapp (`dzine/Somae-webapp`) runs on :3000 and serves `/api/validate-license` (CORS enabled for cross-origin extension/dev-preview calls).
- Create a license: `cd Somae-webapp && node scripts/create-license.mjs <email> <name>` → prints `QKZ-…` key.
- Check/clean a license: `node scripts/license-status.mjs <KEY> [--remove-test-devices]`.
- Dev license created: `QKZ-873F-74E2-2ACD-4DD7` (LIFETIME, 2 devices).
- Extension dev preview license bypass: `http://localhost:5173/?preview=1` (dev-only, inert in production builds).
