# Progress

## What Works

- ✅ License gate (validate against backend, device hash, deactivate) — unchanged
- ✅ Brand setup: logo upload + name, persisted (`somae_brand`), shown in sidebar with Active status
- ✅ Create screen: content type / goal / description (1000-char counter) / style / reference (drag-drop, upload, pick-from-page + crop) / quality (Standard 1024², High 1536², 4K Ultra 2048², default 4K)
- ✅ Smart Prompt: restructures rough notes into a clear brief via the configured text model
- ✅ Structured generation pipeline: internal creative system per style; logo preservation instruction; reference image passed to the model
- ✅ Premium staged loading screen synced to the real pipeline, with error state
- ✅ Result screen: preview card (loading/failure/full-preview states), ‹ n/N › navigation, variants rail + New Variants, Download / Remake / More (Regenerate, Edit brief, Duplicate brief, Delete generation)
- ✅ Conversational refinement with suggestion chips — current image sent as context, result appended as a new asset
- ✅ Feedback per asset (Great/Good/Not bad/Bad), persisted in history
- ✅ History tab: past generations, reloadable; capped at 12
- ✅ Settings: API key / Vertex AI config, text model, image engine, license management
- ✅ Build (`tsc -b && vite build`) passes; lint clean except pre-existing shadcn export-pattern errors

## What's Left

- Manual end-to-end QA in Chrome with real API credentials
- Optional: bundle code-splitting

## Evolution

- v0 (Huenxt): strategy form + inspiration board + generation trace UI
- v1 (Somae Private Beta 01): reference-driven redesign — guided creative workflow, brand persistence, variants/refinement/feedback loop
