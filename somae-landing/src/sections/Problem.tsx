import { useRef } from 'react';
import {
  Check,
  Download,
  Expand,
  Lightbulb,
  MessageSquareText,
  PenTool,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { AVATAR_SMALL } from '@/lib/avatars';
import { HandwrittenNote } from '@/components/HandwrittenNote';

const STEPS = [
  { icon: Lightbulb, label: 'Idea' },
  { icon: MessageSquareText, label: 'Prompt' },
  { icon: Search, label: 'Search' },
  { icon: PenTool, label: 'Design' },
  { icon: SlidersHorizontal, label: 'Edit' },
  { icon: Expand, label: 'Resize' },
  { icon: Download, label: 'Export' },
];

function Chip({
  icon: Icon,
  label,
  className = '',
}: {
  icon: typeof Lightbulb;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={`wf-chip inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-somae-ink shadow-chip ring-1 ring-black/5 ${className}`}
    >
      <Icon className="size-4 text-somae-ink/50" strokeWidth={2.2} />
      {label}
    </span>
  );
}

const Arrow = () => (
  <svg viewBox="0 0 20 8" className="wf-arrow h-2 w-5 shrink-0 text-somae-ink/25" fill="none" aria-hidden>
    <path d="M0 4h17m0 0-3.5-3.5M17 4l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/**
 * "No time to create?" — the traditional workflow appears piece by piece,
 * then collapses into Idea → Somae → Done. A pinned, scrubbed transformation.
 */
export function Problem() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        // Static fallback: show the simplified workflow.
        gsap.set('.wf-original', { autoAlpha: 0 });
        gsap.set('.wf-final', { autoAlpha: 1, scale: 1 });
        gsap.set('.wf-caption', { autoAlpha: 1 });
        return;
      }

      gsap.set('.wf-chip', { y: 26, opacity: 0 });
      gsap.set('.wf-arrow', { opacity: 0 });

      const centerDelta = (_index: number, el: HTMLElement) => {
        const stage = el.closest('.wf-stage') as HTMLElement;
        return stage.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);
      };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: '.wf-pin',
            start: 'top top',
            end: '+=1500',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        // the old workflow assembles
        .to('.wf-chip', { y: 0, opacity: 1, stagger: 0.07, duration: 0.5, ease: 'power2.out' })
        .to('.wf-arrow', { opacity: 1, stagger: 0.05, duration: 0.3 }, '<0.15')
        .to({}, { duration: 0.45 }) // hold — let it sink in
        // the middle collapses away
        .to('.wf-mid', {
          x: centerDelta,
          scale: 0.5,
          opacity: 0,
          stagger: 0.05,
          duration: 0.85,
          ease: 'power2.in',
        })
        .to('.wf-arrow', { opacity: 0, duration: 0.3 }, '<')
        .to('.wf-chip-first', { x: 0, scale: 1, opacity: 1, duration: 0.1 }, '<')
        // Somae replaces it all
        .fromTo(
          '.wf-final',
          { autoAlpha: 0, scale: 0.72, y: 18 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(1.5)' },
          '-=0.25',
        )
        .fromTo(
          '.wf-caption',
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 0.45 },
          '-=0.15',
        )
        .to({}, { duration: 0.6 }); // rest on the answer
    },
    { scope },
  );

  return (
    <section ref={scope} id="problem" aria-label="The problem Somae solves">
      <div className="wf-pin relative flex min-h-svh flex-col items-center justify-center gap-[7vh] overflow-clip px-6">
        <HandwrittenNote
          arrow="down"
          rotate={3}
          className="absolute top-[16%] left-[7%] hidden lg:block"
        >
          {'Too many tabs.\nNot enough time.'}
        </HandwrittenNote>

        <div className="text-center">
          <h2 className="font-display text-[clamp(40px,6vw,84px)] leading-[1.02] font-extrabold tracking-[-0.035em] text-somae-ink">
            No time to create?
          </h2>
          <p className="text-gradient-blue mt-3 font-display text-[clamp(40px,6vw,84px)] leading-[1.02] font-extrabold tracking-[-0.035em]">
            We got you.
          </p>
        </div>

        {/* workflow stage */}
        <div className="wf-stage relative flex h-[130px] w-full max-w-[1020px] items-center justify-center">
          {/* the old way */}
          <div className="wf-original flex w-full flex-wrap items-center justify-center gap-x-2 gap-y-3">
            {STEPS.map((step, i) => (
              <span key={step.label} className="contents">
                <Chip
                  icon={step.icon}
                  label={step.label}
                  className={i === 0 ? 'wf-chip-first' : i === STEPS.length - 1 ? 'wf-chip-last' : 'wf-mid'}
                />
                {i < STEPS.length - 1 && <Arrow />}
              </span>
            ))}
          </div>

          {/* the Somae way */}
          <div className="wf-final invisible absolute inset-0 flex items-center justify-center gap-4 opacity-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-semibold text-somae-ink shadow-chip ring-1 ring-black/5">
              <Lightbulb className="size-4 text-somae-ink/50" strokeWidth={2.2} />
              Idea
            </span>
            <Arrow />
            <span className="inline-flex items-center gap-2.5 rounded-full bg-somae-mist py-1.5 pr-5 pl-1.5 shadow-glow ring-1 ring-somae-blue/30">
              <img src={AVATAR_SMALL} alt="" className="size-9 rounded-full object-contain" draggable={false} />
              <span className="text-[14px] font-bold text-somae-ink">Somae</span>
              <Sparkles className="size-4 text-somae-blue" />
            </span>
            <Arrow />
            <span className="inline-flex items-center gap-2 rounded-full bg-somae-ink px-4 py-2.5 text-[13px] font-semibold text-white shadow-chip">
              <Check className="size-4 text-somae-blue" strokeWidth={2.6} />
              Done
            </span>
          </div>
        </div>

        <p className="wf-caption font-hand invisible rotate-[-2deg] text-[clamp(20px,2vw,26px)] font-semibold text-somae-ink/70 opacity-0">
          that’s the whole workflow ♡
        </p>
      </div>
    </section>
  );
}
