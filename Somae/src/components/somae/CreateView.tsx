import { useEffect, useRef, useState } from 'react';
import {
    Check,
    ChevronDown,
    Ellipsis,
    Facebook,
    Gift,
    Image as ImageIcon,
    Instagram,
    Linkedin,
    Loader2,
    Megaphone,
    MousePointerClick,
    Rocket,
    Sparkles,
    Tag,
    WandSparkles,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BrandProfile, CreativeBrief, QualityTierId } from '@/shared/types';
import {
    CONTENT_TYPES,
    CREATIVE_STYLES,
    MARKETING_GOALS,
    QUALITY_TIERS,
    getQuality,
} from '@/shared/creativeSystem';
import { OptionCard } from '@/components/somae/OptionCard';
import { BrandChip } from '@/components/somae/BrandChip';
import { SomaeAvatar } from '@/components/somae/SomaeAvatar';

const MAX_DESCRIPTION = 1000;

const CONTENT_TYPE_ICONS = {
    instagram: Instagram,
    linkedin: Linkedin,
    facebook: Facebook,
    more: Ellipsis,
} as const;

const GOAL_ICONS = {
    launch: Rocket,
    sale: Tag,
    gtm: Megaphone,
    offer: Gift,
} as const;

/** Platform tiles keep their real brand identity (never recolored) */
const PLATFORM_TILE: Record<string, { background: string; color: string }> = {
    instagram: {
        background:
            'linear-gradient(45deg, #feda75 0%, #fa7e1e 28%, #d62976 55%, #962fbf 78%, #4f5bd5 100%)',
        color: '#ffffff',
    },
    linkedin: { background: '#0a66c2', color: '#ffffff' },
    facebook: { background: '#1877f2', color: '#ffffff' },
    more: { background: 'rgb(12 12 12 / 0.06)', color: 'rgb(12 12 12 / 0.55)' },
};

/** Gradient art direction per creative style — the image is the hero */
const STYLE_ART: Record<string, string> = {
    premium:
        'linear-gradient(135deg, #0d2438 0%, #10486b 42%, #08c2ff 130%)',
    bold: 'linear-gradient(135deg, #ff5f6d 0%, #ff8a5c 55%, #ffc371 100%)',
    minimal: 'linear-gradient(135deg, #fdfaf4 0%, #f0e9db 60%, #e3d8c3 100%)',
    luxury: 'linear-gradient(135deg, #101010 0%, #26221c 55%, #57493a 100%)',
};

const STYLE_ART_LABEL: Record<string, string> = {
    premium: 'text-white/90',
    bold: 'text-white/90',
    minimal: 'text-somae-ink/50',
    luxury: 'text-white/80',
};

/** Short labels for the quality dropdown (per product spec) */
const QUALITY_SHORT: Record<QualityTierId, string> = {
    standard: '720p',
    high: '1080p',
    '4k': '4K',
};

const DESCRIPTION_PLACEHOLDER = 'Describe what you want Somae to create…';

interface CreateViewProps {
    brief: CreativeBrief;
    brand: BrandProfile;
    /** Opens the brand dialog (upload / replace / remove logo) */
    onBrandClick: () => void;
    onBriefChange: (patch: Partial<CreativeBrief>) => void;
    onGenerate: () => void;
    /** Smart Prompt — improves/restructures the entered text. Returns the improved text. */
    onSmartPrompt: (text: string) => Promise<string>;
    /** Opens the webpage image-picking flow (content script) */
    onPickFromPage: () => void;
}

export function CreateView({
    brief,
    brand,
    onBrandClick,
    onBriefChange,
    onGenerate,
    onSmartPrompt,
    onPickFromPage,
}: CreateViewProps) {
    const [smartLoading, setSmartLoading] = useState(false);
    const [smartError, setSmartError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [qualityOpen, setQualityOpen] = useState(false);
    const referenceInputRef = useRef<HTMLInputElement>(null);
    const qualityRef = useRef<HTMLDivElement>(null);

    const descriptionLength = brief.description.length;
    const activeQuality = getQuality(brief.quality);

    // Close the quality dropdown on outside click
    useEffect(() => {
        if (!qualityOpen) return;
        const handler = (e: MouseEvent) => {
            if (qualityRef.current && !qualityRef.current.contains(e.target as Node)) {
                setQualityOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [qualityOpen]);

    const handleSmartPrompt = async () => {
        setSmartError(null);
        setSmartLoading(true);
        try {
            const improved = await onSmartPrompt(brief.description);
            if (improved) {
                onBriefChange({ description: improved.slice(0, MAX_DESCRIPTION) });
            }
        } catch (e) {
            setSmartError((e as Error).message || 'Smart Prompt failed');
        } finally {
            setSmartLoading(false);
        }
    };

    const handleReferenceFile = (file: File) => {
        if (!file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;
            if (dataUrl) onBriefChange({ referenceDataUrl: dataUrl });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-somae-create relative min-h-full overflow-hidden">
            <div className="relative mx-auto w-full max-w-[680px] px-5 pb-10 pt-4 min-[900px]:px-8">
                {/* ── Hero ─────────────────────────────────────────── */}
                <header className="relative animate-fade-up">
                    {/* Somae companion — large ambient character anchored RIGHT,
                        partially cropped by the viewport edge, always BEHIND the UI */}
                    <div
                        aria-hidden
                        className="pointer-events-none absolute -right-16 top-1 z-0 h-[240px] w-[220px] overflow-hidden min-[520px]:-right-24 min-[520px]:h-[280px] min-[520px]:w-[260px]"
                    >
                        <SomaeAvatar className="w-full drop-shadow-[0_20px_36px_rgb(8_194_255/0.20)]" />
                    </div>

                    {/* Foreground content — always above the avatar, never covered */}
                    <div className="relative z-10 max-w-[62%]">
                        <h1 className="text-[30px] font-extrabold leading-[1.12] tracking-[-0.03em] text-somae-ink min-[900px]:text-[34px]">
                            What do you want to
                            <br />
                            <span className="text-somae-blue">create today?</span>{' '}
                            <span aria-hidden>✨</span>
                        </h1>
                        <p className="mt-2.5 text-sm font-medium text-somae-ink/55">
                            AI marketing content, 10x faster.
                        </p>
                    </div>

                    {/* Brand chip — own full-width row, name never clipped */}
                    <div className="relative z-10 mt-4 w-fit max-w-full">
                        <BrandChip brand={brand} onClick={onBrandClick} />
                    </div>
                </header>

                {/* ── Creative brief — clear gap below the brand selector ── */}
                <section
                    className="relative z-10 mt-6 animate-fade-up"
                    style={{ animationDelay: '60ms' }}
                >
                    <div
                        className={cn(
                            'glass-soft relative rounded-[24px] p-5 shadow-lift ring-1 ring-white/70 transition-shadow duration-300',
                            'focus-within:shadow-[0_0_0_2px_hsl(var(--somae-blue)/0.45),0_22px_48px_-16px_rgb(8_194_255/0.28)]'
                        )}
                    >
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                            <h2 className="whitespace-nowrap text-[13px] font-semibold text-somae-ink">
                                Tell Somae more about your content
                            </h2>
                            {/* Smart Prompt — compact inline action */}
                            <button
                                type="button"
                                onClick={handleSmartPrompt}
                                disabled={smartLoading}
                                className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-[11.5px] font-semibold text-somae-blue-dark shadow-soft ring-1 ring-somae-blue/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover hover:ring-somae-blue/40 disabled:opacity-60"
                            >
                                {smartLoading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-somae-blue" />
                                ) : (
                                    <WandSparkles className="h-3.5 w-3.5 text-somae-blue" />
                                )}
                                {smartLoading ? 'Improving…' : 'Smart Prompt'}
                            </button>
                        </div>

                        <textarea
                            value={brief.description}
                            onChange={(e) =>
                                onBriefChange({ description: e.target.value.slice(0, MAX_DESCRIPTION) })
                            }
                            placeholder={DESCRIPTION_PLACEHOLDER}
                            rows={3}
                            className="w-full resize-none rounded-2xl bg-white/60 p-3.5 pb-7 text-sm leading-relaxed text-somae-ink shadow-inner ring-1 ring-black/[0.03] placeholder:text-somae-ink/35 focus:outline-none"
                        />
                        <div className="pointer-events-none absolute bottom-[24px] left-7 right-7 flex items-center justify-between">
                            <span className="text-[11px] tabular-nums text-somae-ink/40">
                                {descriptionLength}/{MAX_DESCRIPTION}
                            </span>
                            <Sparkles className="h-4 w-4 text-somae-blue/50" />
                        </div>
                    </div>
                    {smartError && (
                        <p className="mt-2 text-xs font-medium text-destructive">{smartError}</p>
                    )}
                </section>

                {/* ── Content formats ──────────────────────────────── */}
                <section className="mt-8 animate-fade-up" style={{ animationDelay: '100ms' }}>
                    <SectionLabel>What are you creating?</SectionLabel>
                    <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-4">
                        {CONTENT_TYPES.map((type) => {
                            const Icon = CONTENT_TYPE_ICONS[type.id];
                            const selected = brief.contentType === type.id;
                            return (
                                <OptionCard
                                    key={type.id}
                                    selected={selected}
                                    onClick={() => onBriefChange({ contentType: type.id })}
                                >
                                    <span
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl shadow-sm"
                                        style={PLATFORM_TILE[type.id]}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 pr-3">
                                        <span
                                            className={cn(
                                                'block truncate text-[13px] font-semibold leading-tight',
                                                selected ? 'text-somae-blue-dark' : 'text-somae-ink'
                                            )}
                                        >
                                            {type.label}
                                        </span>
                                        <span className="block text-[11px] text-muted-foreground">
                                            {type.sublabel}
                                        </span>
                                    </span>
                                </OptionCard>
                            );
                        })}
                    </div>
                </section>

                {/* ── Goals ────────────────────────────────────────── */}
                <section className="mt-7 animate-fade-up" style={{ animationDelay: '140ms' }}>
                    <SectionLabel>What is your goal?</SectionLabel>
                    <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-4">
                        {MARKETING_GOALS.map((goal) => {
                            const Icon = GOAL_ICONS[goal.id];
                            const selected = brief.goal === goal.id;
                            const [first, ...rest] = goal.label.split(' / ');
                            return (
                                <OptionCard
                                    key={goal.id}
                                    selected={selected}
                                    onClick={() => onBriefChange({ goal: goal.id })}
                                >
                                    <span
                                        className={cn(
                                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                                            selected
                                                ? 'bg-somae-blue text-white'
                                                : 'bg-muted text-muted-foreground group-hover:text-somae-blue'
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    <span className="min-w-0 pr-3">
                                        <span
                                            className={cn(
                                                'block truncate text-[13px] font-semibold leading-tight',
                                                selected ? 'text-somae-blue-dark' : 'text-somae-ink'
                                            )}
                                        >
                                            {first}
                                        </span>
                                        {rest.length > 0 && (
                                            <span className="block truncate text-[11px] text-muted-foreground">
                                                / {rest.join(' / ')}
                                            </span>
                                        )}
                                    </span>
                                </OptionCard>
                            );
                        })}
                    </div>
                </section>

                {/* ── Creative style — image-first cards ───────────── */}
                <section className="mt-7 animate-fade-up" style={{ animationDelay: '180ms' }}>
                    <SectionLabel>Creative Style</SectionLabel>
                    <div className="grid grid-cols-2 gap-3 min-[520px]:grid-cols-4">
                        {CREATIVE_STYLES.map((style) => {
                            const selected = brief.style === style.id;
                            const words = style.label.split(' ');
                            const firstLine = words.slice(0, -1).join(' ');
                            const lastLine = words[words.length - 1];
                            return (
                                <button
                                    key={style.id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => onBriefChange({ style: style.id })}
                                    className={cn(
                                        'group relative overflow-hidden rounded-2xl text-left transition-all duration-300',
                                        'hover:-translate-y-0.5 hover:shadow-card-hover',
                                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-somae-blue/40',
                                        selected
                                            ? 'shadow-[0_0_0_2px_hsl(var(--somae-blue)),0_14px_28px_-12px_hsl(var(--somae-blue)/0.4)]'
                                            : 'shadow-card'
                                    )}
                                >
                                    {/* Style artwork */}
                                    <span
                                        className="relative block h-[74px] w-full"
                                        style={{ background: STYLE_ART[style.id] }}
                                    >
                                        <Sparkles
                                            className={cn(
                                                'absolute bottom-2 right-2 h-3.5 w-3.5',
                                                STYLE_ART_LABEL[style.id]
                                            )}
                                        />
                                    </span>
                                    <span className="block bg-white px-3 py-2.5">
                                        <span
                                            className={cn(
                                                'block text-[11.5px] font-semibold leading-snug',
                                                selected ? 'text-somae-blue-dark' : 'text-somae-ink'
                                            )}
                                        >
                                            {firstLine}
                                            <br />
                                            {lastLine}
                                        </span>
                                    </span>
                                    {selected && (
                                        <span className="absolute right-2 top-2 flex h-[20px] w-[20px] items-center justify-center rounded-full bg-somae-blue text-white shadow-[0_2px_8px_-2px_hsl(var(--somae-blue)/0.7)] animate-in zoom-in-50 duration-200">
                                            <Check className="h-3 w-3" strokeWidth={3.5} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </section>

                {/* ── Reference image ──────────────────────────────── */}
                <section className="mt-7 animate-fade-up" style={{ animationDelay: '220ms' }}>
                    <SectionLabel>
                        Add Reference{' '}
                        <span className="font-normal text-muted-foreground">(optional)</span>
                    </SectionLabel>

                    {brief.referenceDataUrl ? (
                        <div className="glass-soft flex items-center gap-4 rounded-2xl p-3.5 shadow-soft ring-1 ring-white/70">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
                                <img
                                    src={brief.referenceDataUrl}
                                    alt="Reference"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-[13px] font-semibold text-somae-ink">
                                    Reference attached
                                </p>
                                <p className="mt-0.5 text-xs text-muted-foreground">
                                    Somae will draw composition and mood cues from this image.
                                </p>
                            </div>
                            <div className="flex shrink-0 flex-col gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => referenceInputRef.current?.click()}
                                    className="rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-somae-ink shadow-soft ring-1 ring-black/5 transition-all duration-300 hover:shadow-card-hover"
                                >
                                    Replace
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onBriefChange({ referenceDataUrl: null })}
                                    className="flex items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                    Remove
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={() => referenceInputRef.current?.click()}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') referenceInputRef.current?.click();
                            }}
                            onDragOver={(e) => {
                                e.preventDefault();
                                setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={(e) => {
                                e.preventDefault();
                                setDragOver(false);
                                const file = e.dataTransfer.files?.[0];
                                if (file) handleReferenceFile(file);
                            }}
                            className={cn(
                                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed px-4 py-7 text-center transition-all duration-300',
                                dragOver
                                    ? 'border-somae-blue bg-somae-blue-tint/60 shadow-soft'
                                    : 'border-somae-ink/15 bg-white/50 hover:border-somae-blue/40 hover:bg-somae-blue-tint/40'
                            )}
                        >
                            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-somae-blue shadow-soft">
                                <ImageIcon className="h-5 w-5" strokeWidth={1.9} />
                            </span>
                            <p className="text-[13px] font-medium text-somae-ink">
                                Drag & drop an image or{' '}
                                <span className="font-semibold text-somae-blue underline underline-offset-2">
                                    click to upload
                                </span>
                            </p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onPickFromPage();
                                }}
                                className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-somae-blue"
                            >
                                <MousePointerClick className="h-3.5 w-3.5" />
                                or pick an image from the current page
                            </button>
                        </div>
                    )}

                    <input
                        ref={referenceInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleReferenceFile(file);
                            e.target.value = '';
                        }}
                    />
                </section>

                {/* ── Quality dropdown + Generate ──────────────────── */}
                <section
                    className="mt-8 flex items-end gap-3 animate-fade-up"
                    style={{ animationDelay: '260ms' }}
                >
                    {/* Quality — real interactive dropdown */}
                    <div ref={qualityRef} className="relative shrink-0">
                        <span className="mb-1.5 block text-[12px] font-semibold text-somae-ink/60">
                            Quality
                        </span>
                        <button
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded={qualityOpen}
                            onClick={() => setQualityOpen((o) => !o)}
                            className={cn(
                                'glass-soft flex w-[132px] items-center justify-between gap-2 rounded-2xl px-3.5 py-2.5 text-left shadow-soft ring-1 ring-white/70 transition-all duration-300',
                                'hover:shadow-card-hover',
                                qualityOpen && 'ring-somae-blue/40 shadow-card-hover'
                            )}
                        >
                            <span>
                                <span className="block text-[13px] font-semibold leading-tight text-somae-ink">
                                    {activeQuality.label}
                                </span>
                                <span className="block text-[10.5px] tabular-nums text-muted-foreground">
                                    {activeQuality.resolutionLabel}
                                </span>
                            </span>
                            <ChevronDown
                                className={cn(
                                    'h-4 w-4 shrink-0 text-somae-ink/40 transition-transform duration-300',
                                    qualityOpen && 'rotate-180'
                                )}
                            />
                        </button>

                        {qualityOpen && (
                            <div
                                role="listbox"
                                className="absolute bottom-[calc(100%+8px)] left-0 z-30 w-full min-w-[132px] overflow-hidden rounded-2xl bg-white p-1.5 shadow-pop ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150"
                            >
                                {QUALITY_TIERS.map((tier) => {
                                    const selected = brief.quality === tier.id;
                                    return (
                                        <button
                                            key={tier.id}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() => {
                                                onBriefChange({ quality: tier.id });
                                                setQualityOpen(false);
                                            }}
                                            className={cn(
                                                'flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-colors duration-200',
                                                selected
                                                    ? 'bg-somae-blue-tint text-somae-blue-dark'
                                                    : 'text-somae-ink hover:bg-muted'
                                            )}
                                        >
                                            <span>
                                                <span className="block text-[13px] font-semibold leading-tight">
                                                    {QUALITY_SHORT[tier.id]}
                                                </span>
                                                <span className="block text-[10px] tabular-nums text-muted-foreground">
                                                    {tier.resolutionLabel}
                                                </span>
                                            </span>
                                            {selected && (
                                                <Check className="h-3.5 w-3.5 text-somae-blue" strokeWidth={3} />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Primary CTA */}
                    <button
                        type="button"
                        onClick={onGenerate}
                        className="flex h-[52px] flex-1 items-center justify-center gap-2.5 rounded-full bg-gradient-to-b from-[#22cbff] to-somae-blue text-[15.5px] font-semibold text-white shadow-cta transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-somae-blue/40 active:scale-[0.98]"
                    >
                        <Sparkles className="h-[18px] w-[18px]" />
                        Generate Design
                    </button>
                </section>

                <p
                    className="mt-3.5 text-center text-xs font-medium text-somae-ink/45 animate-fade-up"
                    style={{ animationDelay: '300ms' }}
                >
                    Somae will automatically use your logo in the design.{' '}
                    <span aria-hidden>💙</span>
                </p>
            </div>
        </div>
    );
}

function SectionLabel({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2 className={cn('mb-2.5 text-[13px] font-semibold text-somae-ink', className)}>
            {children}
        </h2>
    );
}
