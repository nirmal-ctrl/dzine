import { useEffect, useMemo, useRef, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Copy,
    Download,
    Frown,
    ImageOff,
    Loader2,
    Maximize2,
    Meh,
    MoreHorizontal,
    PenLine,
    Plus,
    RefreshCw,
    RotateCcw,
    Send,
    Sparkles,
    ThumbsUp,
    Trash2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FeedbackRating, GeneratedAsset, Generation } from '@/shared/types';
import {
    REFINEMENT_SUGGESTIONS,
    getContentType,
    getGoal,
    getStyle,
} from '@/shared/creativeSystem';
import { Dialog, DialogContent } from '@/components/ui/dialog';

type ResultTab = 'results' | 'variants' | 'history';

const FEEDBACK_OPTIONS: { id: FeedbackRating; label: string; icon: typeof ThumbsUp }[] = [
    { id: 'great', label: 'Great', icon: ThumbsUp },
    { id: 'good', label: 'Good', icon: ThumbsUp },
    { id: 'not-bad', label: 'Not bad', icon: Meh },
    { id: 'bad', label: 'Bad', icon: Frown },
];

interface ResultViewProps {
    generation: Generation;
    history: Generation[];
    activeAssetId: string;
    onSelectAsset: (assetId: string) => void;
    onOpenGeneration: (generationId: string) => void;
    onEditBrief: () => void;
    onDownload: (asset: GeneratedAsset) => void;
    onRemake: () => void;
    onDuplicateBrief: () => void;
    onDeleteGeneration: () => void;
    onNewVariant: () => void;
    onRefine: (instruction: string) => void;
    onFeedback: (assetId: string, rating: FeedbackRating) => void;
    /** True while a remake / variant / refinement request is in flight */
    working: boolean;
    workingLabel: string;
}

export function ResultView({
    generation,
    history,
    activeAssetId,
    onSelectAsset,
    onOpenGeneration,
    onEditBrief,
    onDownload,
    onRemake,
    onDuplicateBrief,
    onDeleteGeneration,
    onNewVariant,
    onRefine,
    onFeedback,
    working,
    workingLabel,
}: ResultViewProps) {
    const [tab, setTab] = useState<ResultTab>('results');
    const [moreOpen, setMoreOpen] = useState(false);
    const [refinement, setRefinement] = useState('');
    const [previewOpen, setPreviewOpen] = useState(false);
    const moreRef = useRef<HTMLDivElement>(null);

    const assets = generation.assets;
    const activeIndex = Math.max(
        0,
        assets.findIndex((a) => a.id === activeAssetId)
    );
    const activeAsset = assets[activeIndex];

    const pastGenerations = useMemo(
        () => history.filter((g) => g.id !== generation.id),
        [history, generation.id]
    );

    // Close the More menu on outside click
    useEffect(() => {
        if (!moreOpen) return;
        const handler = (e: MouseEvent) => {
            if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
                setMoreOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [moreOpen]);

    const stepAsset = (delta: number) => {
        const next = (activeIndex + delta + assets.length) % assets.length;
        onSelectAsset(assets[next].id);
    };

    const submitRefinement = (text: string) => {
        const instruction = text.trim();
        if (!instruction || working) return;
        onRefine(instruction);
        setRefinement('');
    };

    const aspectRatio = getContentType(generation.brief.contentType).aspectRatio;
    const aspectCss = aspectRatio.replace(':', ' / ');

    return (
        <div className="bg-somae-result min-h-full">
            <div className="mx-auto w-full max-w-[860px] px-5 pb-10 pt-4 min-[900px]:px-8">
                {/* Header */}
                <header className="flex flex-wrap items-start justify-between gap-3 animate-fade-up">
                    <div>
                        <h1 className="text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-somae-ink min-[900px]:text-[30px]">
                            Your design is ready! <span aria-hidden>🎉</span>
                        </h1>
                        <p className="mt-1.5 text-sm font-medium text-somae-ink/55">
                            Here are some designs we created for you.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onEditBrief}
                        className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-somae-ink shadow-soft ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98]"
                    >
                        <PenLine className="h-3.5 w-3.5" />
                        Edit Brief
                    </button>
                </header>

                {/* Tabs — segmented pill control */}
                <div className="mt-5 animate-fade-up" style={{ animationDelay: '40ms' }}>
                    <div className="inline-flex items-center gap-1 rounded-full bg-white/80 p-1 shadow-soft ring-1 ring-black/[0.04] backdrop-blur-sm">
                        {(['results', 'variants', 'history'] as ResultTab[]).map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setTab(t)}
                                className={cn(
                                    'rounded-full px-4 py-2 text-[13px] font-semibold capitalize transition-all duration-300',
                                    tab === t
                                        ? 'bg-somae-blue text-white shadow-[0_4px_12px_-4px_hsl(var(--somae-blue)/0.7)]'
                                        : 'text-somae-ink/50 hover:text-somae-ink'
                                )}
                            >
                                {t}
                                {t === 'variants' && assets.length > 1 && (
                                    <span
                                        className={cn(
                                            'ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                            tab === t
                                                ? 'bg-white/25 text-white'
                                                : 'bg-muted text-muted-foreground'
                                        )}
                                    >
                                        {assets.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Results tab ─────────────────────────────────────── */}
                {tab === 'results' && activeAsset && (
                    <div className="mt-5 animate-fade-up" style={{ animationDelay: '60ms' }}>
                        <div className="flex flex-col gap-5 min-[700px]:flex-row">
                            {/* Main preview */}
                            <div className="min-w-0 flex-1">
                                {/* Navigation */}
                                <div className="mb-2.5 flex items-center justify-end gap-1.5">
                                    <button
                                        type="button"
                                        aria-label="Previous design"
                                        onClick={() => stepAsset(-1)}
                                        disabled={assets.length < 2}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-somae-ink/50 shadow-soft ring-1 ring-black/[0.04] transition-all duration-300 hover:text-somae-ink hover:shadow-card-hover disabled:opacity-40"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>
                                    <span className="min-w-[42px] text-center text-xs font-semibold tabular-nums text-somae-ink/50">
                                        {activeIndex + 1}/{assets.length}
                                    </span>
                                    <button
                                        type="button"
                                        aria-label="Next design"
                                        onClick={() => stepAsset(1)}
                                        disabled={assets.length < 2}
                                        className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-somae-ink/50 shadow-soft ring-1 ring-black/[0.04] transition-all duration-300 hover:text-somae-ink hover:shadow-card-hover disabled:opacity-40"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>

                                <PreviewCard
                                    key={activeAsset.id}
                                    asset={activeAsset}
                                    aspectCss={aspectCss}
                                    working={working}
                                    workingLabel={workingLabel}
                                    onExpand={() => setPreviewOpen(true)}
                                />

                                {/* Actions */}
                                <div className="mt-4 flex items-center gap-2.5">
                                    <button
                                        type="button"
                                        onClick={() => onDownload(activeAsset)}
                                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#22cbff] to-somae-blue text-sm font-semibold text-white shadow-cta transition-all duration-300 hover:-translate-y-0.5 hover:brightness-105 hover:shadow-lift active:scale-[0.98]"
                                    >
                                        <Download className="h-4 w-4" />
                                        Download
                                    </button>
                                    <button
                                        type="button"
                                        onClick={onRemake}
                                        disabled={working}
                                        className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white text-sm font-semibold text-somae-ink shadow-soft ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover active:scale-[0.98] disabled:opacity-50"
                                    >
                                        <RefreshCw className={cn('h-4 w-4', working && 'animate-spin')} />
                                        Remake
                                    </button>

                                    {/* More menu */}
                                    <div ref={moreRef} className="relative">
                                        <button
                                            type="button"
                                            aria-label="More actions"
                                            onClick={() => setMoreOpen((o) => !o)}
                                            className={cn(
                                                'flex h-11 w-12 items-center justify-center rounded-full bg-white text-somae-ink/50 shadow-soft ring-1 ring-black/[0.04] transition-all duration-300 hover:text-somae-ink hover:shadow-card-hover',
                                                moreOpen && 'text-somae-ink shadow-card-hover'
                                            )}
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </button>
                                        {moreOpen && (
                                            <div className="absolute bottom-[52px] right-0 z-30 w-48 overflow-hidden rounded-2xl bg-white py-1.5 shadow-pop ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-150">
                                                <MenuItem
                                                    icon={RotateCcw}
                                                    label="Regenerate"
                                                    onClick={() => {
                                                        setMoreOpen(false);
                                                        onRemake();
                                                    }}
                                                />
                                                <MenuItem
                                                    icon={PenLine}
                                                    label="Edit brief"
                                                    onClick={() => {
                                                        setMoreOpen(false);
                                                        onEditBrief();
                                                    }}
                                                />
                                                <MenuItem
                                                    icon={Copy}
                                                    label="Duplicate brief"
                                                    onClick={() => {
                                                        setMoreOpen(false);
                                                        onDuplicateBrief();
                                                    }}
                                                />
                                                <div className="mx-3 my-1.5 h-px bg-border" />
                                                <MenuItem
                                                    icon={Trash2}
                                                    label="Delete generation"
                                                    danger
                                                    onClick={() => {
                                                        setMoreOpen(false);
                                                        onDeleteGeneration();
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Variant rail */}
                            <div className="w-full shrink-0 min-[700px]:w-[104px]">
                                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin min-[700px]:max-h-[520px] min-[700px]:flex-col min-[700px]:overflow-y-auto min-[700px]:overflow-x-hidden min-[700px]:pb-0">
                                    {assets.map((asset, i) => (
                                        <button
                                            key={asset.id}
                                            type="button"
                                            onClick={() => onSelectAsset(asset.id)}
                                            className={cn(
                                                'relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 min-[700px]:h-[88px] min-[700px]:w-full',
                                                asset.id === activeAssetId
                                                    ? 'shadow-[0_0_0_2px_hsl(var(--somae-blue)),0_10px_20px_-8px_hsl(var(--somae-blue)/0.4)]'
                                                    : 'shadow-soft ring-1 ring-black/[0.04] hover:-translate-y-0.5 hover:shadow-card-hover'
                                            )}
                                        >
                                            <img
                                                src={asset.dataUrl}
                                                alt={`Design ${i + 1}`}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                        </button>
                                    ))}

                                    {/* New Variants */}
                                    <button
                                        type="button"
                                        onClick={onNewVariant}
                                        disabled={working}
                                        className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed border-somae-ink/15 bg-white/60 text-somae-ink/45 transition-all duration-300 hover:border-somae-blue/40 hover:bg-somae-blue-tint/60 hover:text-somae-blue disabled:opacity-50 min-[700px]:h-[88px] min-[700px]:w-full"
                                    >
                                        {working ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                        <span className="px-1 text-center text-[10px] font-semibold leading-tight">
                                            New Variants
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* ── Refinement ─────────────────────────────────── */}
                        <section className="glass-soft mt-6 rounded-[24px] p-5 shadow-soft ring-1 ring-white/70">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-somae-blue" />
                                <h3 className="text-[13px] font-semibold text-somae-ink">
                                    What would you like to change?
                                </h3>
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    type="text"
                                    value={refinement}
                                    onChange={(e) => setRefinement(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') submitRefinement(refinement);
                                    }}
                                    placeholder="e.g. Make it more premium, use less text…"
                                    disabled={working}
                                    className="h-11 min-w-0 flex-1 rounded-full bg-white/80 px-4 text-sm text-somae-ink shadow-inner ring-1 ring-black/[0.04] placeholder:text-somae-ink/35 focus:outline-none focus:ring-2 focus:ring-somae-blue/40 disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => submitRefinement(refinement)}
                                    disabled={!refinement.trim() || working}
                                    className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-somae-blue px-5 text-sm font-semibold text-white shadow-cta transition-all duration-300 hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
                                >
                                    {working ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                    <span className="hidden min-[520px]:inline">Refine</span>
                                </button>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {REFINEMENT_SUGGESTIONS.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        disabled={working}
                                        onClick={() => submitRefinement(suggestion)}
                                        className="rounded-full bg-white/70 px-3.5 py-1.5 text-[11px] font-medium text-somae-ink/55 ring-1 ring-black/[0.04] transition-all duration-300 hover:bg-somae-blue-tint hover:text-somae-blue-dark hover:ring-somae-blue/30 disabled:opacity-50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ── Feedback ───────────────────────────────────── */}
                        <section className="mt-6">
                            <h3 className="text-[13px] font-semibold text-somae-ink">
                                How do you like this result?
                            </h3>
                            <div className="mt-2.5 flex flex-wrap gap-2">
                                {FEEDBACK_OPTIONS.map((option) => {
                                    const Icon = option.icon;
                                    const selected = activeAsset.feedback === option.id;
                                    return (
                                        <button
                                            key={option.id}
                                            type="button"
                                            onClick={() => onFeedback(activeAsset.id, option.id)}
                                            className={cn(
                                                'flex items-center gap-2 rounded-full px-4 py-2.5 text-[13px] font-semibold transition-all duration-300 active:scale-[0.97]',
                                                selected
                                                    ? 'bg-somae-blue text-white shadow-[0_6px_16px_-6px_hsl(var(--somae-blue)/0.7)]'
                                                    : 'bg-white text-somae-ink/55 shadow-soft ring-1 ring-black/[0.04] hover:-translate-y-0.5 hover:text-somae-ink hover:shadow-card-hover'
                                            )}
                                        >
                                            <Icon
                                                className={cn(
                                                    'h-4 w-4',
                                                    selected && option.id === 'good' && '-scale-y-100'
                                                )}
                                            />
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Tip */}
                        <div className="mt-6 flex justify-center">
                            <p className="glass-faint inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11.5px] font-medium text-somae-ink/55 shadow-soft ring-1 ring-white/60">
                                <Sparkles className="h-3.5 w-3.5 text-somae-blue" />
                                Tip: You can generate more variants or refine your brief to get
                                better results.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Variants tab ────────────────────────────────────── */}
                {tab === 'variants' && (
                    <div className="mt-5 animate-fade-up">
                        {assets.length === 0 ? (
                            <EmptyState message="No designs in this generation yet." />
                        ) : (
                            <div className="grid grid-cols-2 gap-4 min-[640px]:grid-cols-3">
                                {assets.map((asset, i) => (
                                    <button
                                        key={asset.id}
                                        type="button"
                                        onClick={() => {
                                            onSelectAsset(asset.id);
                                            setTab('results');
                                        }}
                                        className="group overflow-hidden rounded-2xl bg-white text-left shadow-soft ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
                                    >
                                        <div className="relative aspect-square w-full overflow-hidden bg-muted/30">
                                            <img
                                                src={asset.dataUrl}
                                                alt={`Variant ${i + 1}`}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="flex items-center justify-between px-3.5 py-2.5">
                                            <span className="text-xs font-semibold text-somae-ink">
                                                Design {i + 1}
                                            </span>
                                            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold capitalize text-muted-foreground">
                                                {asset.kind}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={onNewVariant}
                                    disabled={working}
                                    className="flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-somae-ink/15 bg-white/60 text-somae-ink/45 transition-all duration-300 hover:border-somae-blue/40 hover:bg-somae-blue-tint/60 hover:text-somae-blue disabled:opacity-50"
                                >
                                    {working ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Plus className="h-5 w-5" />
                                    )}
                                    <span className="text-xs font-semibold">New Variants</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── History tab ─────────────────────────────────────── */}
                {tab === 'history' && (
                    <div className="mt-5 animate-fade-up">
                        {pastGenerations.length === 0 ? (
                            <EmptyState message="Your previous generations will appear here." />
                        ) : (
                            <div className="space-y-2.5">
                                {pastGenerations.map((g) => {
                                    const cover = g.assets[g.assets.length - 1];
                                    return (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => {
                                                onOpenGeneration(g.id);
                                                setTab('results');
                                            }}
                                            className="flex w-full items-center gap-4 rounded-2xl bg-white p-3 text-left shadow-soft ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
                                        >
                                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-muted/30 ring-1 ring-black/[0.04]">
                                                {cover && (
                                                    <img
                                                        src={cover.dataUrl}
                                                        alt=""
                                                        className="h-full w-full object-cover"
                                                        loading="lazy"
                                                    />
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-[13px] font-semibold text-somae-ink">
                                                    {getContentType(g.brief.contentType).label}{' '}
                                                    {getContentType(g.brief.contentType).sublabel} ·{' '}
                                                    {getGoal(g.brief.goal).label}
                                                </p>
                                                <p className="mt-0.5 text-xs text-muted-foreground">
                                                    {getStyle(g.brief.style).label} · {g.assets.length}{' '}
                                                    design{g.assets.length === 1 ? '' : 's'} ·{' '}
                                                    {new Date(g.createdAt).toLocaleDateString(undefined, {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-somae-ink/30" />
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Full preview dialog */}
                <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                    <DialogContent className="max-w-3xl border-border bg-card p-3">
                        {activeAsset && (
                            <img
                                src={activeAsset.dataUrl}
                                alt="Full preview"
                                className="max-h-[80vh] w-full rounded-xl object-contain"
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

// ── Preview card with loading / failure states ───────────────

function PreviewCard({
    asset,
    aspectCss,
    working,
    workingLabel,
    onExpand,
}: {
    asset: GeneratedAsset;
    aspectCss: string;
    working: boolean;
    workingLabel: string;
    onExpand: () => void;
}) {
    // State resets per asset via the `key` prop on <PreviewCard>
    const [loaded, setLoaded] = useState(false);
    const [failed, setFailed] = useState(false);

    return (
        <div
            className="group relative w-full overflow-hidden rounded-[28px] bg-white shadow-lift ring-1 ring-black/[0.04]"
            style={{ aspectRatio: aspectCss }}
        >
            {/* Loading skeleton */}
            {!loaded && !failed && (
                <div className="absolute inset-0 animate-pulse-soft bg-muted/60" />
            )}

            {failed ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                    <p className="text-xs">This design could not be displayed.</p>
                </div>
            ) : (
                <img
                    src={asset.dataUrl}
                    alt="Generated design"
                    onLoad={() => setLoaded(true)}
                    onError={() => setFailed(true)}
                    className={cn(
                        'absolute inset-0 h-full w-full cursor-zoom-in object-cover transition-opacity duration-500',
                        loaded ? 'opacity-100' : 'opacity-0'
                    )}
                    onClick={onExpand}
                />
            )}

            {/* Expand affordance */}
            {loaded && !failed && !working && (
                <button
                    type="button"
                    aria-label="Open full preview"
                    onClick={onExpand}
                    className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-all duration-300 hover:bg-black/60 group-hover:opacity-100"
                >
                    <Maximize2 className="h-4 w-4" />
                </button>
            )}

            {/* Working overlay */}
            {working && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/70 backdrop-blur-[2px]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-somae-blue/10 ring-1 ring-somae-blue/20">
                        <Loader2 className="h-5 w-5 animate-spin text-somae-blue" />
                    </div>
                    <p className="text-[13px] font-medium text-somae-ink">
                        {workingLabel}
                        <span className="animate-pulse-soft">…</span>
                    </p>
                </div>
            )}
        </div>
    );
}

// ── Small pieces ─────────────────────────────────────────────

function MenuItem({
    icon: Icon,
    label,
    onClick,
    danger,
}: {
    icon: typeof RotateCcw;
    label: string;
    onClick: () => void;
    danger?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-[13px] font-medium transition-colors duration-200',
                danger
                    ? 'text-destructive hover:bg-destructive/10'
                    : 'text-somae-ink hover:bg-muted'
            )}
        >
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}

function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-somae-ink/15 bg-white/50 py-14 text-center">
            <Sparkles className="h-5 w-5 text-somae-blue/50" />
            <p className="text-[13px] font-medium text-muted-foreground">{message}</p>
        </div>
    );
}
