import { useEffect, useRef, useState } from 'react';
import lottie from 'lottie-web';
import { AlertCircle, Check, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import avatarFloat from '@/assets/avatar_float.json';

const STEPS = [
    'Understanding your creative brief',
    'Applying your selected style',
    'Preparing your brand asset',
    'Generating your visual',
    'Finalizing your result',
];

/** How long the pre-API steps take to tick through (ms) */
const STEP_DELAYS = [650, 700, 750];

/** Linear progress per step (matches the reference bar) */
const PROGRESS_BY_STEP = [18, 36, 54, 76, 100];

interface GeneratingViewProps {
    /** True once the backend request has resolved successfully */
    apiDone: boolean;
    /** Set when the generation failed */
    error: string | null;
    /** Called after the final step animation completes */
    onComplete: () => void;
    onCancel: () => void;
}

/**
 * The Somae checklist generation experience — restored exactly per the
 * approved reference. The official Lottie companion is the hero above
 * the status card; the checklist tracks the real pipeline and the page
 * only leaves once the backend has actually resolved.
 */
export function GeneratingView({ apiDone, error, onComplete, onCancel }: GeneratingViewProps) {
    const lottieRef = useRef<HTMLDivElement>(null);
    const [currentStep, setCurrentStep] = useState(0);

    // ── Official Somae Lottie — autoplay + loop, destroyed on exit ──
    useEffect(() => {
        if (!lottieRef.current) return;
        const anim = lottie.loadAnimation({
            container: lottieRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            animationData: avatarFloat,
        });
        return () => anim.destroy();
    }, []);

    // ── Tick through the pre-API steps ──
    useEffect(() => {
        if (error) return;
        if (currentStep < STEP_DELAYS.length) {
            const timer = setTimeout(
                () => setCurrentStep((s) => s + 1),
                STEP_DELAYS[currentStep]
            );
            return () => clearTimeout(timer);
        }
    }, [currentStep, error]);

    // ── "Generating your visual" holds until the API resolves ──
    useEffect(() => {
        if (error || !apiDone || currentStep !== STEP_DELAYS.length) return;
        const timer = setTimeout(() => setCurrentStep(4), 400);
        return () => clearTimeout(timer);
    }, [apiDone, currentStep, error]);

    // ── Completion — purely state-driven, so it can never get stuck ──
    useEffect(() => {
        if (error || currentStep !== 4) return;
        const timer = setTimeout(() => onComplete(), 750);
        return () => clearTimeout(timer);
    }, [currentStep, error, onComplete]);

    if (error) {
        return (
            <div className="relative flex h-full items-center justify-center bg-white p-6">
                <div className="glass-soft w-full max-w-sm rounded-[24px] p-7 text-center shadow-lift ring-1 ring-black/[0.04] animate-fade-up">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                    </div>
                    <h2 className="mt-4 text-[15px] font-semibold text-somae-ink">
                        Something interrupted the magic
                    </h2>
                    <p className="mt-1.5 break-words text-xs leading-relaxed text-muted-foreground">
                        {error}
                    </p>
                    <button
                        type="button"
                        className="mt-5 h-11 w-full rounded-full bg-somae-blue text-sm font-semibold text-white shadow-cta transition-all duration-300 hover:brightness-105 active:scale-[0.98]"
                        onClick={onCancel}
                    >
                        Back to brief
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-white px-6 py-8">
            {/* Subtle slow-moving blue atmosphere — the page still reads white */}
            <div
                aria-hidden
                className="ambient-orb absolute left-1/2 top-[6%] h-[380px] w-[380px] -translate-x-1/2 rounded-full bg-[#08c2ff]/[0.12] blur-[100px]"
            />

            {/* Hero — official Somae Lottie, tucked naturally behind the card */}
            <div
                ref={lottieRef}
                role="img"
                aria-label="Somae is creating your design"
                className="relative z-0 -mb-7 w-[300px] shrink-0 animate-fade-up min-[420px]:w-[330px]"
            />

            {/* Checklist card — the visual anchor */}
            <div
                className="glass-soft relative z-10 w-full max-w-sm rounded-[24px] p-6 shadow-lift ring-1 ring-black/[0.04] animate-fade-up"
                style={{ animationDelay: '90ms' }}
            >
                <h2 className="text-center text-[16px] font-semibold tracking-[-0.01em] text-somae-ink">
                    Creating your design<span className="animate-pulse-soft">…</span>
                </h2>

                {/* Progress bar */}
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-somae-ink/[0.07]">
                    <div
                        className="h-full rounded-full bg-somae-blue transition-all duration-700 ease-out"
                        style={{ width: `${PROGRESS_BY_STEP[currentStep]}%` }}
                    />
                </div>

                <ol className="mt-5 space-y-3.5">
                    {STEPS.map((label, index) => {
                        const isComplete = index < currentStep;
                        const isCurrent = index === currentStep;
                        return (
                            <li key={label} className="flex items-center gap-3">
                                <span
                                    className={cn(
                                        'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-500',
                                        isComplete
                                            ? 'bg-somae-blue text-white shadow-[0_2px_8px_-2px_hsl(var(--somae-blue)/0.7)]'
                                            : isCurrent
                                                ? 'bg-somae-blue/10 text-somae-blue ring-1 ring-somae-blue/30'
                                                : 'bg-somae-ink/[0.06] text-somae-ink/30'
                                    )}
                                >
                                    {isComplete ? (
                                        <Check className="h-3 w-3 animate-in zoom-in-50" strokeWidth={3.5} />
                                    ) : isCurrent ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                    ) : (
                                        <span className="h-1 w-1 rounded-full bg-current" />
                                    )}
                                </span>
                                <span
                                    className={cn(
                                        'text-[13px] transition-colors duration-500',
                                        isComplete
                                            ? 'font-medium text-somae-ink'
                                            : isCurrent
                                                ? 'font-medium text-somae-blue-dark'
                                                : 'text-somae-ink/35'
                                    )}
                                >
                                    {label}
                                    {isCurrent && <span className="animate-pulse-soft">…</span>}
                                    {isComplete && index < 3 && (
                                        <span className="ml-1.5 text-[11px] font-normal text-somae-blue">
                                            ✓
                                        </span>
                                    )}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {/* Bottom information pill */}
            <div className="relative z-10 mt-4 flex justify-center">
                <p className="glass-faint inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11.5px] font-medium text-somae-ink/55 shadow-soft ring-1 ring-black/[0.04]">
                    <Sparkles className="h-3.5 w-3.5 text-somae-blue" />
                    High-quality generation can take up to a minute.
                </p>
            </div>
        </div>
    );
}
