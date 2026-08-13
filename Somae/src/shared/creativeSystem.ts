import type {
    BrandProfile,
    ContentTypeId,
    CreativeBrief,
    CreativeStyleId,
    MarketingGoalId,
    QualityTierId,
} from '@/shared/types';

/**
 * ─────────────────────────────────────────────────────────────
 * SOMAE CREATIVE SYSTEM
 *
 * The extension never sends the user's raw text straight to the
 * image model. Instead it runs a structured pipeline:
 *
 *   INPUT LAYER          → brief fields, brand logo, reference
 *   CREATIVE SYSTEM LAYER → internal art direction per style
 *   GENERATION REQUEST   → one optimized, model-ready prompt
 *
 * Everything below is internal. The user never sees prompt
 * construction — they only express marketing intent.
 * ─────────────────────────────────────────────────────────────
 */

// ── Content types ────────────────────────────────────────────

export interface ContentTypeDef {
    id: ContentTypeId;
    label: string;
    sublabel: string;
    aspectRatio: '1:1' | '4:3' | '16:9' | '9:16';
    guidance: string;
}

export const CONTENT_TYPES: ContentTypeDef[] = [
    {
        id: 'instagram',
        label: 'Instagram',
        sublabel: 'Post',
        aspectRatio: '1:1',
        guidance:
            'Square Instagram feed post. Thumb-stopping composition, readable at small sizes, mobile-first, strong focal point.',
    },
    {
        id: 'linkedin',
        label: 'LinkedIn',
        sublabel: 'Post',
        aspectRatio: '4:3',
        guidance:
            'Professional LinkedIn post creative. Credible, polished, business-appropriate tone with clear information hierarchy.',
    },
    {
        id: 'facebook',
        label: 'Facebook',
        sublabel: 'Post',
        aspectRatio: '4:3',
        guidance:
            'Facebook feed creative. Friendly, high-contrast, immediately legible while scrolling, clear call to action.',
    },
    {
        id: 'more',
        label: 'More',
        sublabel: 'Formats',
        aspectRatio: '1:1',
        guidance:
            'Versatile marketing creative that adapts cleanly across placements. Balanced, safe composition with a strong focal point.',
    },
];

// ── Marketing goals ──────────────────────────────────────────

export interface MarketingGoalDef {
    id: MarketingGoalId;
    label: string;
    guidance: string;
}

export const MARKETING_GOALS: MarketingGoalDef[] = [
    {
        id: 'launch',
        label: 'Launch Product',
        guidance:
            'Product launch announcement. Build anticipation and clarity: hero the product, confident headline, "introducing / is here" energy, clean supporting details.',
    },
    {
        id: 'sale',
        label: 'Sale / Discount',
        guidance:
            'Sale or discount promotion. Make the offer the visual anchor: bold price/discount treatment, urgency cues, high contrast CTA area.',
    },
    {
        id: 'gtm',
        label: 'GTM / Campaign',
        guidance:
            'Go-to-market campaign creative. Narrative-driven key visual: brand-forward, campaign tagline treatment, cohesive series-ready look.',
    },
    {
        id: 'offer',
        label: 'Offer / Promotion',
        guidance:
            'Special offer or promotion. Value-first framing: highlight the benefit, gift/incentive feel, inviting and action-oriented composition.',
    },
];

// ── Creative styles (internal art direction) ─────────────────

export interface CreativeStyleDef {
    id: CreativeStyleId;
    label: string;
    /** Internal creative direction — never shown to the user */
    direction: string;
    avoid: string;
}

export const CREATIVE_STYLES: CreativeStyleDef[] = [
    {
        id: 'premium',
        label: 'Premium Editorial',
        direction:
            'Sophisticated editorial composition with premium visual hierarchy, generous intentional negative space, cinematic product presentation, refined typographic pairing, controlled color story, magazine-grade layout discipline.',
        avoid:
            'Avoid clutter, generic AI aesthetics, excessive decorative elements, stock-photo clichés, cramped spacing.',
    },
    {
        id: 'bold',
        label: 'Bold & Vibrant',
        direction:
            'Energetic composition with strong contrast, expressive layout, bold visual hierarchy, saturated confident color, attention-grabbing campaign presentation, dynamic movement.',
        avoid:
            'Avoid muted palettes, timid layouts, weak contrast, over-crowding that dilutes the focal message.',
    },
    {
        id: 'minimal',
        label: 'Minimal Clean',
        direction:
            'Simplicity and whitespace first. Clear hierarchy, restrained visual elements, clean modern composition, precise alignment, quiet confidence, one idea per frame.',
        avoid:
            'Avoid ornamentation, heavy textures, busy backgrounds, competing focal points.',
    },
    {
        id: 'luxury',
        label: 'Luxury Modern',
        direction:
            'Sophisticated high-end aesthetic, refined typography, elegant directional lighting, premium materials and finishes, restrained but unmistakably luxurious visual direction.',
        avoid:
            'Avoid loud colors, discount-bin energy, clutter, playful gimmicks, cheap gradients.',
    },
];

// ── Quality tiers ────────────────────────────────────────────

export interface QualityTierDef {
    id: QualityTierId;
    label: string;
    resolutionLabel: string;
    imageSize: '1K' | '2K' | '4K';
}

export const QUALITY_TIERS: QualityTierDef[] = [
    { id: 'standard', label: 'Standard', resolutionLabel: '1024 × 1024', imageSize: '1K' },
    { id: 'high', label: 'High', resolutionLabel: '1536 × 1536', imageSize: '2K' },
    { id: '4k', label: '4K Ultra', resolutionLabel: '2048 × 2048', imageSize: '4K' },
];

// ── Defaults ─────────────────────────────────────────────────

export const DEFAULT_BRIEF: CreativeBrief = {
    contentType: 'instagram',
    goal: 'launch',
    description: '',
    style: 'premium',
    referenceDataUrl: null,
    quality: '4k',
};

export const DEFAULT_BRAND: BrandProfile = {
    name: '',
    logoDataUrl: null,
    updatedAt: 0,
};

// ── Lookup helpers ───────────────────────────────────────────

export function getContentType(id: ContentTypeId): ContentTypeDef {
    return CONTENT_TYPES.find((c) => c.id === id) ?? CONTENT_TYPES[0];
}

export function getGoal(id: MarketingGoalId): MarketingGoalDef {
    return MARKETING_GOALS.find((g) => g.id === id) ?? MARKETING_GOALS[0];
}

export function getStyle(id: CreativeStyleId): CreativeStyleDef {
    return CREATIVE_STYLES.find((s) => s.id === id) ?? CREATIVE_STYLES[0];
}

export function getQuality(id: QualityTierId): QualityTierDef {
    return QUALITY_TIERS.find((q) => q.id === id) ?? QUALITY_TIERS[2];
}

export function getAspectRatioForContentType(id: ContentTypeId): string {
    return getContentType(id).aspectRatio;
}

// ── Prompt construction (internal) ───────────────────────────

const LOGO_PRESERVATION =
    'The attached brand logo is provided as a reference asset. Preserve the uploaded logo accurately — do not redesign, reinterpret, modify, recolor, or replace it. Place it naturally and legibly within the composition where a brand mark belongs.';

function brandBlock(brand: BrandProfile): string {
    const hasLogo = Boolean(brand.logoDataUrl);
    const name = brand.name.trim() || 'the brand';
    if (!hasLogo) {
        return `BRAND: The creative is for "${name}". No logo asset was supplied — use an elegant typographic brand treatment for the name "${name}" instead.`;
    }
    return `BRAND: The creative is for "${name}". ${LOGO_PRESERVATION}`;
}

function referenceBlock(brief: CreativeBrief): string {
    if (!brief.referenceDataUrl) return '';
    return `VISUAL REFERENCE: An additional reference image is attached. Draw composition, mood, and art-direction cues from it while keeping the output original and on-brief. Do not copy any text or logos from the reference.`;
}

/**
 * Build the optimized generation request from the structured brief.
 * Combines user intent, marketing goal, content type, creative style,
 * reference image, brand logo and quality into one model-ready prompt.
 */
export function buildCreativePrompt(brief: CreativeBrief, brand: BrandProfile): string {
    const contentType = getContentType(brief.contentType);
    const goal = getGoal(brief.goal);
    const style = getStyle(brief.style);
    const description = brief.description.trim();

    return `You are Somae, an expert AI marketing creative director producing production-ready marketing visuals.

TASK: Design a ${contentType.label} ${contentType.sublabel.toLowerCase()} creative.
FORMAT GUIDANCE: ${contentType.guidance}

MARKETING GOAL — ${goal.label}: ${goal.guidance}

${description ? `CLIENT BRIEF:\n${description}\n` : 'CLIENT BRIEF: None provided — infer a strong, credible concept from the goal and brand.\n'}
CREATIVE DIRECTION — ${style.label}: ${style.direction}
${style.avoid}

${brandBlock(brand)}
${referenceBlock(brief)}

OUTPUT REQUIREMENTS:
- A single finished marketing creative, ready to publish.
- Crisp, legible typography; no garbled or placeholder text.
- Cohesive color story aligned to the brand and goal.
- Professional production quality, sharp details, clean edges.
- Compose for a ${contentType.aspectRatio} canvas.`;
}

/** Variant: same brief, fresh interpretation */
export function buildVariantPrompt(brief: CreativeBrief, brand: BrandProfile, variantIndex: number): string {
    return `${buildCreativePrompt(brief, brand)}

VARIATION ${variantIndex + 1}: Create a distinctly fresh interpretation of this brief — explore a different composition, layout structure, or visual angle while keeping the brand, message, and creative direction fully intact.`;
}

/** Remake: same brief, new take (used by the Remake / Regenerate actions) */
export function buildRemakePrompt(brief: CreativeBrief, brand: BrandProfile): string {
    return `${buildCreativePrompt(brief, brand)}

REMAKE: Produce a new version of this design. Keep the brief and creative direction identical, but re-compose the layout and details so it feels like a fresh execution, not a duplicate.`;
}

/** Refinement: iterate on the current image with a conversational instruction */
export function buildRefinementPrompt(instruction: string, brief: CreativeBrief, brand: BrandProfile): string {
    const style = getStyle(brief.style);
    return `You are Somae, an expert AI marketing creative director. The first attached image is the current approved-direction design.

REFINEMENT REQUEST: ${instruction.trim()}

Apply this refinement to the current design while preserving everything else that already works — the brand identity, the ${style.label.toLowerCase()} creative direction (${style.direction}), and the core message stay intact unless the request says otherwise.

${brand.logoDataUrl ? LOGO_PRESERVATION : ''}

OUTPUT: A single updated marketing creative with crisp, legible typography and production-quality finish.`;
}

/** Smart Prompt: restructure the user's rough notes into a clear creative brief */
export function buildSmartPromptRequest(raw: string, brief: CreativeBrief): string {
    const contentType = getContentType(brief.contentType);
    const goal = getGoal(brief.goal);
    return `You are Somae's brief-writing assistant. Rewrite the user's rough notes into a clear, structured creative brief for a ${contentType.label} ${contentType.sublabel.toLowerCase()} whose goal is "${goal.label}".

Rules:
- Keep the original meaning, facts, product names, and offers exactly.
- Improve structure, clarity, and specificity — make it easy for a designer (human or AI) to execute.
- Cover: what is being promoted, key message/benefit, tone, and a strong clear CTA.
- Plain text, 2–4 short sentences or a compact bullet list. Max 90 words. No preamble, no quotes.

USER'S ROUGH NOTES:
${raw.trim()}`;
}

/** Suggested refinements shown under the result */
export const REFINEMENT_SUGGESTIONS = [
    'Make it more premium',
    'Use less text',
    'Make the product larger',
    'Try a darker composition',
    'Make the typography bolder',
    'Create a more minimal version',
];
