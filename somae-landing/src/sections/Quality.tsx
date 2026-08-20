import { useRef } from 'react';
import { Check } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { SectionTag } from '@/components/ui';
import { POSTERS } from '@/components/posters';

/**
 * Scattered starting poses for the floating composition, as fractions of
 * the stage (x, y), with rotation and scale. They settle into a clean row.
 */
const SCATTER = [
  { fx: -0.36, fy: -0.1, r: -10, s: 0.92 },
  { fx: -0.17, fy: 0.14, r: 7, s: 1.06 },
  { fx: 0.02, fy: -0.16, r: -5, s: 0.96 },
  { fx: 0.2, fy: 0.1, r: 9, s: 1.08 },
  { fx: 0.38, fy: -0.06, r: -8, s: 0.9 },
];

const TIDY_X = [-0.32, -0.16, 0, 0.16, 0.32];

const CHECKS = ['High resolution', 'Social-ready formats', 'One-click download'];

export function Quality() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        // Static tidy row.
        const stage = scope.current?.querySelector('.q-stage') as HTMLElement | null;
        if (stage) {
          gsap.utils.toArray<HTMLElement>('.q-card').forEach((card, i) => {
            gsap.set(card, { x: stage.offsetWidth * TIDY_X[i] });
          });
        }
        return;
      }

      const mm = gsap.matchMedia();

      mm.add('(min-width: 1024px)', () => {
        const stage = scope.current?.querySelector('.q-stage') as HTMLElement;
        if (!stage) return;

        const cards = gsap.utils.toArray<HTMLElement>('.q-card');

        // Scatter → settle, scrubbed as the section travels through view.
        cards.forEach((card, i) => {
          const from = SCATTER[i];
          gsap.fromTo(
            card,
            {
              x: () => stage.offsetWidth * from.fx,
              y: () => stage.offsetHeight * from.fy,
              rotation: from.r,
              scale: from.s,
            },
            {
              x: () => stage.offsetWidth * TIDY_X[i],
              y: 0,
              rotation: 0,
              scale: 1,
              ease: 'none',
              immediateRender: true,
              scrollTrigger: {
                trigger: stage,
                start: 'top 85%',
                end: 'top 15%',
                scrub: 1.1,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        gsap.from('[data-quality-head]', {
          y: 44,
          opacity: 0,
          duration: 1.1,
          scrollTrigger: { trigger: '[data-quality-head]', start: 'top 85%', once: true },
        });
        gsap.from('[data-quality-check]', {
          y: 20,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          scrollTrigger: { trigger: '[data-quality-checks]', start: 'top 92%', once: true },
        });
      });

      mm.add('(max-width: 1023px)', () => {
        gsap.from('.q-card-mobile', {
          y: 40,
          opacity: 0,
          duration: 0.9,
          stagger: 0.1,
          scrollTrigger: { trigger: '.q-row', start: 'top 85%', once: true },
        });
        gsap.from('[data-quality-head]', {
          y: 36,
          opacity: 0,
          duration: 1,
          scrollTrigger: { trigger: '[data-quality-head]', start: 'top 88%', once: true },
        });
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="quality"
      className="relative overflow-clip py-[14vh]"
      aria-label="Output quality"
    >
      <div className="mx-auto max-w-[1200px] px-6 text-center">
        <div data-quality-head>
          <SectionTag>Quality you can count on</SectionTag>
        </div>
        <h2
          data-quality-head
          className="mt-6 font-display text-[clamp(34px,4.6vw,60px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-somae-ink"
        >
          Ready to <span className="text-gradient-blue">create.</span>
        </h2>
      </div>

      {/* Desktop: floating composition that settles into a clean row */}
      <div className="q-stage relative mx-auto mt-8 hidden h-[460px] max-w-[1200px] lg:block">
        {POSTERS.slice(0, 5).map((Poster, i) => (
          <div
            key={i}
            className="q-card absolute top-1/2 left-1/2 w-[210px] [translate:-50%_-50%] will-change-transform"
          >
            <Poster />
          </div>
        ))}
      </div>

      {/* Mobile: simple swipeable row */}
      <div className="q-row no-scrollbar mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:hidden">
        {POSTERS.slice(0, 5).map((Poster, i) => (
          <div key={i} className="q-card-mobile w-[62vw] max-w-[260px] shrink-0 snap-center">
            <Poster />
          </div>
        ))}
      </div>

      <div data-quality-checks className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 px-6">
        {CHECKS.map((c) => (
          <p key={c} data-quality-check className="flex items-center gap-2.5 text-[14px] font-semibold text-somae-ink/65">
            <span className="flex size-5 items-center justify-center rounded-full bg-somae-blue/15">
              <Check className="size-3 text-somae-deep" strokeWidth={3} />
            </span>
            {c}
          </p>
        ))}
      </div>
    </section>
  );
}
