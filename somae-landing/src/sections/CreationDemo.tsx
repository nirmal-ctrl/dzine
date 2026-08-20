import { useRef } from 'react';
import { Sparkles } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { DepthCarousel } from '@/components/DepthCarousel';
import { SectionTag } from '@/components/ui';

/**
 * The miniature Somae studio — a dark, cinematic room where prompts turn
 * into a living deck of generated visuals.
 */
export function CreationDemo() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.from('[data-demo]', {
        y: 48,
        opacity: 0,
        duration: 1.1,
        stagger: 0.12,
        scrollTrigger: { trigger: scope.current, start: 'top 68%', once: true },
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="demo"
      className="relative overflow-clip bg-somae-ink py-[14vh]"
      aria-label="Watch Somae create"
    >
      {/* interior light */}
      <div aria-hidden className="absolute top-[-30%] left-1/2 size-[80vmax] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(8_194_255/0.13)_0%,transparent_60%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgb(8_194_255/0.05),transparent)]" />

      <div className="relative mx-auto max-w-[1200px] px-6 text-center">
        <div data-demo>
          <SectionTag dark>The studio</SectionTag>
        </div>

        <h2
          data-demo
          className="mt-6 font-display text-[clamp(34px,4.6vw,60px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-white"
        >
          Watch <span className="text-somae-blue">Somae</span> create.
        </h2>
        <p data-demo className="mx-auto mt-4 max-w-[420px] text-[15.5px] leading-relaxed font-medium text-white/55">
          A prompt in. Beautiful visuals out — multiple options, always on brand.
        </p>

        {/* prompt bar */}
        <div
          data-demo
          className="glass-dark mx-auto mt-10 flex max-w-[560px] items-center gap-3 rounded-full py-2.5 pr-2.5 pl-5 ring-1 ring-white/12"
        >
          <Sparkles className="size-4 shrink-0 text-somae-blue" />
          <p className="flex-1 truncate text-left text-[13.5px] font-medium text-white/75">
            40% off this weekend. Premium fashion sale poster…
          </p>
          <span className="shrink-0 rounded-full bg-somae-blue px-4 py-2 text-[12px] font-bold text-somae-ink">
            Generate
          </span>
        </div>

        {/* the living deck */}
        <div data-demo className="mt-16">
          <DepthCarousel />
        </div>
      </div>
    </section>
  );
}
