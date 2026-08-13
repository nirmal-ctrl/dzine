export type InspirationCategory = 'layout' | 'color' | 'typography' | 'elements';

export interface ImageAsset {
    id: string;
    dataUrl: string;
    category: InspirationCategory;
}

export interface StrategyContext {
    goal: string;
    platform: string;
    audience: string;
    additionalReq: string;
}

export interface AppConfig {
    apiKey: string;
    model: string;
    endpoint: string;
    projectId?: string;
    location?: string;
    googleCloudToken?: string;
    /** Image generation engine: Gemini 3 Pro Image (supports references) or Imagen 4.0 (text-only) */
    imageEngine?: 'gemini' | 'imagen';
}

export interface PendingCrop {
    dataUrl: string;
    timestamp: number;
}

// Generation Trace Types
export type StepStatus = 'pending' | 'in-progress' | 'complete' | 'error';

export interface TraceStep {
    id: string;
    category?: InspirationCategory;
    status: StepStatus;
    title: string;
    images?: ImageAsset[];
    prompt?: string;
    response?: string;
    timestamp: number;
    duration?: number;
    error?: string;
}

// Imagen Configuration Types
export type ImageGenerationModel = 'imagen-4.0' | 'gemini-3-pro-image' | 'nano-banana-2';

export interface ImagenConfig {
    model: ImageGenerationModel;
    numberOfImages: number; // 1-4
    imageSize: '1K' | '2K' | '4K';
    aspectRatio: 'auto' | '1:1' | '3:4' | '4:3' | '9:16' | '16:9' | '3:2' | '2:3' | '4:5' | '5:4' | '21:9';
    personGeneration: 'dont_allow' | 'allow_adult' | 'allow_all';
    // Gemini 3 Pro Image specific parameters
    temperature?: number; // 0.0-2.0, controls randomness
    topP?: number; // 0.0-1.0, nucleus sampling (default 0.95)
}

// Auth & License Types
export interface UserInfo {
    uid: string;
    email: string | null;
}

export interface LicenseStatus {
    valid: boolean;
    updatesUntil: Date | null;
    daysRemaining: number | null;
}

// ─────────────────────────────────────────────────────────────
// Somae — Private Beta 01 (Creative Workflow)
// ─────────────────────────────────────────────────────────────

export type ContentTypeId = 'instagram' | 'linkedin' | 'facebook' | 'more';

export type MarketingGoalId = 'launch' | 'sale' | 'gtm' | 'offer';

export type CreativeStyleId = 'premium' | 'bold' | 'minimal' | 'luxury';

export type QualityTierId = 'standard' | 'high' | '4k';

export type FeedbackRating = 'great' | 'good' | 'not-bad' | 'bad';

/** Persisted brand profile — uploaded once, reused for every generation */
export interface BrandProfile {
    name: string;
    logoDataUrl: string | null;
    updatedAt: number;
}

/** The user's creative brief (Create screen state) */
export interface CreativeBrief {
    contentType: ContentTypeId;
    goal: MarketingGoalId;
    description: string;
    style: CreativeStyleId;
    referenceDataUrl: string | null;
    quality: QualityTierId;
}

export type GeneratedAssetKind = 'original' | 'variant' | 'refinement' | 'remake';

/** A single generated image within a generation session */
export interface GeneratedAsset {
    id: string;
    dataUrl: string;
    kind: GeneratedAssetKind;
    /** The refinement instruction that produced this asset (if any) */
    refinementNote?: string;
    createdAt: number;
    feedback?: FeedbackRating;
}

/** A generation session — the brief snapshot plus every asset produced from it */
export interface Generation {
    id: string;
    createdAt: number;
    brief: CreativeBrief;
    assets: GeneratedAsset[];
}
