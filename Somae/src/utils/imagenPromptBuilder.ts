import type { ImageAsset, InspirationCategory, StrategyContext } from '@/shared/types';

/**
 * Generate category-specific analysis prompts for Gemini
 */
export function getCategoryAnalysisPrompt(category: InspirationCategory): string {
    const prompts: Record<InspirationCategory, string> = {
        layout: `
<role>
  You are an Expert Visual Architect dealing with the philosophy of "inevitable design" (inspired by Jony Ive).
  You value breath, purposeful negative space, and logical order.
</role>
<context>
   You are analyzing a reference image to extract its spatial DNA.
</context>
<instructions>
  1. **Analyze** the relationship between positive elements and negative space (the "breath").
  2. **Deconstruct** the rhythm and pacing of information flow.
  3. **Assess** the tension between rigid alignment and organic movement.
  4. **Synthesize** how the structure creates a sense of order or necessity.
</instructions>
<constraints>
  - Tone: Sophisticated, architectural, insightful.
  - Avoid generic terms like "clean" or "nice layout". Use "airy", "rhythmic", "grid-locked".
  - Focus on *why* the layout works, not just *what* it is.
</constraints>
<output_format>
  Return a concise paragraph analyzing the layout's "physics" and flow.
</output_format>`,

        color: `
<role>
  You are a Master Colorist focusing on materiality, atmosphere, and emotional weight.
</role>
<context>
  You are analyzing a reference image to extract its atmospheric qualities.
</context>
<instructions>
  1. **Analyze** the temperature and mood (e.g., ethereal, industrial, earthen).
  2. **Touch** the colors: Describe their tactile quality (matte, glossy, luminous, textile).
  3. **Observe** how light interacts with specific hues on the surface.
  4. **Synthesize** the emotional weight and precise relationship between background and accents.
</instructions>
<constraints>
  - Tone: Evocative, precise, sensory.
  - Avoid just listing hex codes. Explain the *feeling* of the color relationships.
</constraints>
<output_format>
  Return a concise paragraph describing the palette's material reality and mood.
</output_format>`,

        typography: `
<role>
  You are a Typographic Craftsman obsessed with voice, integrity, and scale.
  You believe type is both a structural element and a decorative voice.
</role>
<context>
  You are analyzing a reference image to extract its typographic character.
</context>
<instructions>
  1. **Identify** the specific character of the typefaces (humanist, geometric, authoritative?).
  2. **Measure** the hierarchy and scale relationships (how size guides the eye).
  3. **Feel** the texture: weight, tracking, leading, and spacing.
  4. **Synthesize** the balance between readability and expressiveness.
</instructions>
<constraints>
  - Tone: Professional, discerning, exact.
  - Focus on the "voice" of the type, not just the font family name.
</constraints>
<output_format>
  Return a concise paragraph capturing the typography's integrity and hierarchy.
</output_format>`,

        elements: `
<role>
  You are a Design Curator focusing on motifs, reduction, and narrative focus.
  You believe every element must serve a purpose or be removed.
</role>
<context>
  You are analyzing a reference image to identify key graphical drivers.
</context>
<instructions>
  1. **Inspect** the nature of imagery (photography, illustration) and UI components.
  2. **Evaluate** the honesty of materials (borders, shadows, corner radii).
  3. **Detect** recurring motifs or patterns that act as a signature.
  4. **Synthesize** how these elements support the core narrative without clutter.
</instructions>
<constraints>
  - Tone: Curatorial, critical, essentialist.
  - Avoid listing every icon. Focus on the *style* of ornamentation.
</constraints>
<output_format>
  Return a concise paragraph analyzing the graphical language and elemental style.
</output_format>`
    };

    return prompts[category];
}

/**
 * Synthesize insights from all categories into an Imagen prompt
 */
export function synthesizeImagenPrompt(
    categoryInsights: Record<InspirationCategory, string>,
    strategy: StrategyContext
): string {
    const { goal, platform, audience, additionalReq } = strategy;

    // Extract key elements from each category
    const layoutInsights = categoryInsights.layout || 'balanced composition';
    const colorInsights = categoryInsights.color || 'vibrant, harmonious colors';
    const typographyInsights = categoryInsights.typography || 'clean, professional typography';
    const elementsInsights = categoryInsights.elements || 'engaging visual elements';

    // Build the Imagen prompt
    const prompt = `Create a professional ${platform.toLowerCase()} social media post design for ${goal.toLowerCase()}, targeting ${audience.toLowerCase()}.

Design specifications:
- Layout: ${layoutInsights}
- Colors: ${colorInsights}
- Typography: ${typographyInsights}
- Elements: ${elementsInsights}

${additionalReq ? `Additional requirements: ${additionalReq}` : ''}

The design should be:
- High-quality and professional
- Visually striking and attention-grabbing
- Optimized for ${platform}
- Appropriate for ${audience} audience
- Aligned with the goal of ${goal.toLowerCase()}

Create a cohesive, polished design that combines all these elements harmoniously.`;

    return prompt;
}

/**
 * Get aspect ratio for platform
 */
export function getAspectRatioForPlatform(platform: string): '1:1' | '9:16' | '16:9' | '3:4' | '4:3' {
    const platformLower = platform.toLowerCase();

    if (platformLower.includes('story')) {
        return '9:16';
    } else if (platformLower.includes('twitter') || platformLower.includes('x') ||
        platformLower.includes('linkedin') || platformLower.includes('website')) {
        return '16:9';
    } else if (platformLower.includes('instagram feed')) {
        return '1:1';
    } else if (platformLower.includes('blog')) {
        return '4:3';
    }

    return '1:1'; // default
}

/**
 * Group images by category
 */
export function groupImagesByCategory(images: ImageAsset[]): Record<InspirationCategory, ImageAsset[]> {
    const grouped: Record<InspirationCategory, ImageAsset[]> = {
        layout: [],
        color: [],
        typography: [],
        elements: []
    };

    images.forEach(image => {
        // Handle migration/fallback for old categories if necessary, 
        // strictly though we assume data is valid or we might drop old cats.
        // For robustness, let's just push if key exists, else maybe default or ignore.
        if (grouped[image.category]) {
            grouped[image.category].push(image);
        }
    });

    return grouped;
}
