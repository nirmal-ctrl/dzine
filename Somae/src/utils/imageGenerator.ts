export interface DesignSpec {
    headline?: string;
    subheadline?: string;
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    accentColor?: string;
    layout?: 'centered' | 'left-aligned' | 'split' | 'minimal';
    style?: string;
    typography?: string;
}

/**
 * Parse AI-generated design recipe text into structured design specifications
 */
export function parseDesignSpec(aiResponse: string): DesignSpec {
    const spec: DesignSpec = {};

    // Extract headline
    const headlineMatch = aiResponse.match(/headline[:\s]+["']?([^"\n]+)["']?/i);
    if (headlineMatch) spec.headline = headlineMatch[1].trim();

    // Extract subheadline
    const subheadlineMatch = aiResponse.match(/subheadline[:\s]+["']?([^"\n]+)["']?/i);
    if (subheadlineMatch) spec.subheadline = subheadlineMatch[1].trim();

    // Extract colors - look for hex codes
    const hexColors = aiResponse.match(/#[0-9A-Fa-f]{6}/g) || [];
    if (hexColors.length > 0) spec.primaryColor = hexColors[0];
    if (hexColors.length > 1) spec.secondaryColor = hexColors[1];
    if (hexColors.length > 2) spec.accentColor = hexColors[2];

    // Extract layout type
    if (/centered|center/i.test(aiResponse)) spec.layout = 'centered';
    else if (/left|align.*left/i.test(aiResponse)) spec.layout = 'left-aligned';
    else if (/split|two.*column/i.test(aiResponse)) spec.layout = 'split';
    else spec.layout = 'minimal';

    // Default colors if not found
    spec.primaryColor = spec.primaryColor || '#6366f1';
    spec.secondaryColor = spec.secondaryColor || '#8b5cf6';
    spec.backgroundColor = spec.backgroundColor || '#ffffff';
    spec.accentColor = spec.accentColor || '#ec4899';

    return spec;
}

/**
 * Generate a canvas-based design mockup from design specifications
 */
export function generateDesignMockup(
    spec: DesignSpec,
    platform: string,
    width: number = 1080,
    height: number = 1080
): string {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('Failed to get canvas context');
    }

    // Background
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, spec.backgroundColor || '#ffffff');
    gradient.addColorStop(1, adjustColorBrightness(spec.primaryColor || '#6366f1', 0.95));
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add subtle pattern/texture
    ctx.fillStyle = spec.primaryColor || '#6366f1';
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const radius = Math.random() * 100 + 50;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Layout-specific rendering
    switch (spec.layout) {
        case 'centered':
            renderCenteredLayout(ctx, spec, width, height);
            break;
        case 'left-aligned':
            renderLeftAlignedLayout(ctx, spec, width, height);
            break;
        case 'split':
            renderSplitLayout(ctx, spec, width, height);
            break;
        default:
            renderMinimalLayout(ctx, spec, width, height);
    }

    // Add platform badge
    renderPlatformBadge(ctx, platform, width, height);

    return canvas.toDataURL('image/png');
}

function renderCenteredLayout(
    ctx: CanvasRenderingContext2D,
    spec: DesignSpec,
    width: number,
    height: number
) {
    const centerX = width / 2;
    const centerY = height / 2;

    // Decorative circle
    ctx.fillStyle = spec.primaryColor || '#6366f1';
    ctx.globalAlpha = 0.1;
    ctx.beginPath();
    ctx.arc(centerX, centerY - 100, 300, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Headline
    ctx.fillStyle = spec.primaryColor || '#1f2937';
    ctx.font = 'bold 72px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const headline = spec.headline || 'Your Design';
    wrapText(ctx, headline, centerX, centerY - 50, width - 200, 90);

    // Subheadline
    if (spec.subheadline) {
        ctx.fillStyle = spec.secondaryColor || '#6b7280';
        ctx.font = '32px Inter, system-ui, sans-serif';
        wrapText(ctx, spec.subheadline, centerX, centerY + 80, width - 200, 45);
    }

    // Accent line
    ctx.strokeStyle = spec.accentColor || '#ec4899';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 150);
    ctx.lineTo(centerX + 100, centerY + 150);
    ctx.stroke();
}

function renderLeftAlignedLayout(
    ctx: CanvasRenderingContext2D,
    spec: DesignSpec,
    width: number,
    height: number
) {
    const leftMargin = 100;
    const topMargin = height / 3;

    // Accent bar
    ctx.fillStyle = spec.accentColor || '#ec4899';
    ctx.fillRect(leftMargin, topMargin - 20, 8, 200);

    // Headline
    ctx.fillStyle = spec.primaryColor || '#1f2937';
    ctx.font = 'bold 64px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const headline = spec.headline || 'Your Design';
    wrapText(ctx, headline, leftMargin + 40, topMargin, width - leftMargin - 100, 80);

    // Subheadline
    if (spec.subheadline) {
        ctx.fillStyle = spec.secondaryColor || '#6b7280';
        ctx.font = '28px Inter, system-ui, sans-serif';
        wrapText(ctx, spec.subheadline, leftMargin + 40, topMargin + 120, width - leftMargin - 100, 40);
    }

    // Decorative element
    ctx.fillStyle = spec.primaryColor || '#6366f1';
    ctx.globalAlpha = 0.15;
    ctx.fillRect(width - 400, 0, 400, height);
    ctx.globalAlpha = 1;
}

function renderSplitLayout(
    ctx: CanvasRenderingContext2D,
    spec: DesignSpec,
    width: number,
    height: number
) {
    const splitX = width / 2;

    // Left side - colored
    ctx.fillStyle = spec.primaryColor || '#6366f1';
    ctx.fillRect(0, 0, splitX, height);

    // Right side content
    const rightMargin = splitX + 80;
    const topMargin = height / 3;

    ctx.fillStyle = spec.secondaryColor || '#1f2937';
    ctx.font = 'bold 56px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const headline = spec.headline || 'Your Design';
    wrapText(ctx, headline, rightMargin, topMargin, width - rightMargin - 80, 70);

    if (spec.subheadline) {
        ctx.fillStyle = '#6b7280';
        ctx.font = '26px Inter, system-ui, sans-serif';
        wrapText(ctx, spec.subheadline, rightMargin, topMargin + 100, width - rightMargin - 80, 38);
    }

    // Left side decorative text
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.2;
    ctx.font = 'bold 120px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DESIGN', splitX / 2, height / 2);
    ctx.globalAlpha = 1;
}

function renderMinimalLayout(
    ctx: CanvasRenderingContext2D,
    spec: DesignSpec,
    width: number,
    height: number
) {
    const margin = 120;
    const topMargin = height / 2.5;

    // Headline
    ctx.fillStyle = spec.primaryColor || '#1f2937';
    ctx.font = 'bold 68px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    const headline = spec.headline || 'Your Design';
    wrapText(ctx, headline, margin, topMargin, width - margin * 2, 85);

    // Subheadline
    if (spec.subheadline) {
        ctx.fillStyle = spec.secondaryColor || '#6b7280';
        ctx.font = '30px Inter, system-ui, sans-serif';
        wrapText(ctx, spec.subheadline, margin, topMargin + 110, width - margin * 2, 42);
    }

    // Minimal accent
    ctx.fillStyle = spec.accentColor || '#ec4899';
    ctx.fillRect(margin, topMargin - 30, 60, 6);
}

function renderPlatformBadge(
    ctx: CanvasRenderingContext2D,
    platform: string,
    width: number,
    height: number
) {
    const badgeText = platform.toUpperCase();
    const padding = 20;
    const fontSize = 16;

    ctx.font = `bold ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'left';
    const textWidth = ctx.measureText(badgeText).width;

    const badgeX = width - textWidth - padding * 2 - 40;
    const badgeY = height - 60;

    // Badge background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(badgeX, badgeY, textWidth + padding * 2, 40);

    // Badge text
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, badgeX + padding, badgeY + 20);
}

function wrapText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && i > 0) {
            ctx.fillText(line, x, currentY);
            line = words[i] + ' ';
            currentY += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, currentY);
}

function adjustColorBrightness(color: string, factor: number): string {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Adjust brightness
    const newR = Math.min(255, Math.floor(r * factor));
    const newG = Math.min(255, Math.floor(g * factor));
    const newB = Math.min(255, Math.floor(b * factor));

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
