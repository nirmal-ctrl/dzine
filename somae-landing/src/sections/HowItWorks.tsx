import { useRef } from 'react';
import { ArrowUp, Check, Image as ImageIcon, Sparkles, Upload } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { LOGO_SRC } from '@/lib/avatars';
import { SectionTag } from '@/components/ui';
import { SalePoster } from '@/components/posters';

const PROMPT_TEXT =
  '40% off this weekend. Create a premium fashion sale poster using this product image.';

function StepShell({
  index,
  title,
  desc,
  children,
}: {
  index: string;
  title: string;
  desc: string;
  children: React.ReactNode;
}) {
  return (
    <div
      data-step
      className="flex flex-col rounded-[28px] bg-white p-7 shadow-soft ring-1 ring-black/[0.04]"
    >
      <div className="flex items-baseline gap-3">
        <span className="font-display text-[13px] font-extrabold tracking-[0.08em] text-somae-blue">
          {index}
        </span>
        <h3 className="font-display text-[19px] font-bold tracking-[-0.01em] text-somae-ink">
          {title}
        </h3>
      </div>
      <p className="mt-1.5 text-[13.5px] leading-relaxed font-medium text-somae-ink/55">{desc}</p>
      <div className="relative mt-6 h-[218px] flex-1">{children}</div>
    </div>
  );
}

/** Step 01 — Add your brand: upload zone + asset chips. */
function BrandVisual() {
  return (
    <>
      <div
        data-brand="zone"
        className="absolute inset-x-0 top-0 flex h-[104px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-somae-blue/35 bg-somae-mist/70"
      >
        <Upload className="size-5 text-somae-blue" strokeWidth={2.2} />
        <p className="text-[12px] font-semibold text-somae-ink/60">Drop your logo here</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-2">
        <span data-brand="chip" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11.5px] font-semibold text-somae-ink shadow-chip ring-1 ring-black/5">
          <img src={LOGO_SRC} alt="" className="size-5 rounded-md object-contain" draggable={false} />
          logo.png
        </span>
        <span data-brand="chip" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11.5px] font-semibold text-somae-ink shadow-chip ring-1 ring-black/5">
          <span className="flex -space-x-1">
            <span className="size-3.5 rounded-full bg-somae-blue ring-2 ring-white" />
            <span className="size-3.5 rounded-full bg-somae-ink ring-2 ring-white" />
            <span className="size-3.5 rounded-full bg-somae-sky ring-2 ring-white" />
          </span>
          palette
        </span>
        <span data-brand="chip" className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11.5px] font-semibold text-somae-ink shadow-chip ring-1 ring-black/5">
          <ImageIcon className="size-4 text-somae-ink/50" />
          product.jpg
        </span>
      </div>
    </>
  );
}

/** Step 02 — Choose your style: three mini style tiles, one selected. */
function StyleVisual() {
  return (
    <div className="absolute inset-0 flex items-end gap-3 pb-1">
      {/* Minimal */}
      <div data-style className="flex h-[150px] flex-1 flex-col justify-between rounded-2xl bg-white p-3.5 ring-1 ring-black/8">
        <span className="font-display text-[22px] font-light text-somae-ink">Aa</span>
        <div className="space-y-1.5">
          <span className="block h-1 w-3/4 rounded-full bg-somae-ink/15" />
          <span className="block h-1 w-1/2 rounded-full bg-somae-ink/10" />
        </div>
        <span className="text-[10px] font-semibold text-somae-ink/50">Minimal</span>
      </div>
      {/* Bold — selected */}
      <div data-style className="relative flex h-[168px] flex-1 flex-col justify-between rounded-2xl bg-somae-ink p-3.5 ring-2 ring-somae-blue">
        <span
          data-style="badge"
          className="absolute -top-2.5 -right-2.5 flex size-6 items-center justify-center rounded-full bg-somae-blue text-white shadow-glow"
        >
          <Check className="size-3.5" strokeWidth={3} />
        </span>
        <span className="font-display text-[26px] font-extrabold text-white">Aa</span>
        <span className="size-3 rounded-full bg-somae-blue" />
        <span className="text-[10px] font-semibold text-white/70">Bold</span>
      </div>
      {/* Playful */}
      <div data-style className="flex h-[150px] flex-1 flex-col justify-between rounded-2xl bg-[linear-gradient(150deg,#08c2ff,#0099d6)] p-3.5 ring-1 ring-black/5">
        <span className="font-hand text-[24px] font-semibold text-white">Aa</span>
        <Sparkles className="size-3.5 text-white/80" />
        <span className="text-[10px] font-semibold text-white/80">Playful</span>
      </div>
    </div>
  );
}

/** Step 03 — Describe your idea: the prompt types itself, then becomes a visual. */
function PromptVisual() {
  return (
    <>
      <div className="absolute inset-x-0 top-0 rounded-2xl bg-white p-4 pb-12 shadow-chip ring-1 ring-black/5">
        <p className="min-h-[66px] text-[12.5px] leading-relaxed font-medium text-somae-ink/80">
          <span data-prompt="text" />
          <span data-prompt="caret" className="ml-0.5 inline-block h-[13px] w-[2px] translate-y-[2px] bg-somae-blue" />
        </p>
        <span className="absolute right-3 bottom-3 flex size-7 items-center justify-center rounded-full bg-somae-blue text-white">
          <ArrowUp className="size-4" strokeWidth={2.6} />
        </span>
      </div>

      {/* thinking dots */}
      <div data-prompt="thinking" className="absolute bottom-5 left-1 flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2.5 opacity-0 shadow-chip ring-1 ring-black/5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="size-1.5 rounded-full bg-somae-blue animate-pulse-dot"
            style={{ animationDelay: `${i * 0.18}s` }}
          />
        ))}
      </div>

      {/* the generated visual */}
      <div data-prompt="result" className="absolute right-0 bottom-0 w-[112px] rotate-3 opacity-0">
        <SalePoster />
      </div>
    </>
  );
}

export function HowItWorks() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      // Header + cards reveal
      if (!reduced) {
        gsap.from('[data-how-header]', {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          scrollTrigger: { trigger: scope.current, start: 'top 72%', once: true },
        });
        gsap.from('[data-step]', {
          y: 56,
          opacity: 0,
          duration: 1.05,
          stagger: 0.14,
          scrollTrigger: { trigger: '[data-steps]', start: 'top 78%', once: true },
        });

        // Step 01 — chips pop in
        gsap.from('[data-brand="zone"]', {
          scale: 0.92,
          opacity: 0,
          duration: 0.8,
          scrollTrigger: { trigger: '[data-brand="zone"]', start: 'top 85%', once: true },
        });
        gsap.from('[data-brand="chip"]', {
          scale: 0.5,
          opacity: 0,
          y: 14,
          duration: 0.7,
          stagger: 0.12,
          ease: 'back.out(1.8)',
          scrollTrigger: { trigger: '[data-brand="zone"]', start: 'top 85%', once: true },
        });

        // Step 02 — tiles rise, badge pops
        gsap.from('[data-style]', {
          y: 34,
          opacity: 0,
          duration: 0.85,
          stagger: 0.1,
          scrollTrigger: { trigger: '[data-style]', start: 'top 88%', once: true },
        });
        gsap.from('[data-style="badge"]', {
          scale: 0,
          duration: 0.6,
          delay: 0.5,
          ease: 'back.out(2.2)',
          scrollTrigger: { trigger: '[data-style]', start: 'top 88%', once: true },
        });
      }

      // Step 03 — the prompt types, thinks, and becomes a visual
      const textEl = scope.current?.querySelector('[data-prompt="text"]');
      if (!textEl) return;

      if (reduced) {
        textEl.textContent = PROMPT_TEXT;
        gsap.set('[data-prompt="result"]', { opacity: 1, scale: 1, y: 0 });
        return;
      }

      const proxy = { len: 0 };
      gsap
        .timeline({
          scrollTrigger: { trigger: '[data-prompt="text"]', start: 'top 82%', once: true },
        })
        .to(proxy, {
          len: PROMPT_TEXT.length,
          duration: 2.1,
          ease: 'none',
          onUpdate: () => {
            textEl.textContent = PROMPT_TEXT.slice(0, Math.round(proxy.len));
          },
        })
        .to('[data-prompt="caret"]', { opacity: 0, duration: 0.2 })
        .to('[data-prompt="thinking"]', { opacity: 1, y: -4, duration: 0.4 })
        .to({}, { duration: 0.9 })
        .to('[data-prompt="thinking"]', { opacity: 0, y: 4, duration: 0.3 })
        .fromTo(
          '[data-prompt="result"]',
          { opacity: 0, scale: 0.55, y: 26, rotation: 10 },
          { opacity: 1, scale: 1, y: 0, rotation: 3, duration: 0.85, ease: 'back.out(1.6)' },
        );
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="how-it-works"
      className="relative mx-auto max-w-[1200px] px-6 py-[16vh]"
      aria-label="How Somae works"
    >
      <div className="max-w-[560px]">
        <div data-how-header>
          <SectionTag>How it works</SectionTag>
        </div>
        <h2
          data-how-header
          className="mt-6 font-display text-[clamp(34px,4.6vw,60px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-somae-ink"
        >
          Just tell <span className="text-somae-blue">Somae</span> what you need.
        </h2>
        <p data-how-header className="mt-4 text-[15.5px] leading-relaxed font-medium text-somae-ink/55">
          Three simple steps. No design tools, no prompt engineering, no busywork.
        </p>
      </div>

      <div data-steps className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        <StepShell index="01" title="Add your brand" desc="Logo, images, anything you have.">
          <BrandVisual />
        </StepShell>
        <StepShell index="02" title="Choose your style" desc="Pick from curated, premium templates.">
          <StyleVisual />
        </StepShell>
        <StepShell index="03" title="Describe your idea" desc="Type it in plain language.">
          <PromptVisual />
        </StepShell>
      </div>
    </section>
  );
}
