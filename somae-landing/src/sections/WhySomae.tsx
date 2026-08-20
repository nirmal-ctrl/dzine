import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';

const BENEFITS = [
  {
    title: 'Simple',
    body: 'Tell Somae what you need — in plain language.',
  },
  {
    title: 'Fast',
    body: 'Go from idea to visual without the usual creative workflow.',
  },
  {
    title: 'Beautiful',
    body: 'Get polished visual content, ready to use.',
  },
];

/** Oversized typography, generous whitespace — the quiet confidence section. */
export function WhySomae() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Masked line reveals for the big statement
      gsap.from('.why-line > span', {
        yPercent: 110,
        duration: 1.2,
        stagger: 0.12,
        ease: 'power4.out',
        scrollTrigger: { trigger: scope.current, start: 'top 70%', once: true },
      });

      gsap.from('[data-benefit]', {
        y: 44,
        opacity: 0,
        duration: 1,
        stagger: 0.14,
        scrollTrigger: { trigger: '[data-benefits]', start: 'top 82%', once: true },
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="why"
      className="relative mx-auto max-w-[1200px] px-6 py-[20vh]"
      aria-label="Why Somae"
    >
      <h2 className="font-display text-[clamp(46px,8vw,112px)] leading-[1.0] font-extrabold tracking-[-0.04em]">
        <span className="why-line block overflow-hidden pb-1">
          <span className="block text-somae-ink">Less prompting.</span>
        </span>
        <span className="why-line block overflow-hidden pb-2">
          <span className="text-gradient-blue block">More creating.</span>
        </span>
      </h2>

      <div data-benefits className="mt-[12vh] grid gap-10 md:grid-cols-3 md:gap-8">
        {BENEFITS.map((b) => (
          <div key={b.title} data-benefit className="border-t border-somae-ink/10 pt-6">
            <h3 className="font-display text-[26px] font-bold tracking-[-0.02em] text-somae-ink">
              {b.title}
              <span className="text-somae-blue">.</span>
            </h3>
            <p className="mt-2.5 max-w-[260px] text-[14.5px] leading-relaxed font-medium text-somae-ink/55">
              {b.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
