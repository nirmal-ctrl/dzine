import { useRef } from 'react';
import type { ComponentType } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { SectionTag } from '@/components/ui';
import { LaunchPoster, SalePoster, SocialPoster } from '@/components/posters';

const TEMPLATES: Array<{ name: string; hint: string; Poster: ComponentType<{ className?: string }> }> = [
  { name: 'Product Launch', hint: 'Announce what’s next', Poster: LaunchPoster },
  { name: 'Sale Campaign', hint: 'Offers that convert', Poster: SalePoster },
  { name: 'Social Content', hint: 'Posts with personality', Poster: SocialPoster },
];

/** A template card with physical 3D tilt-on-hover. */
function TemplateCard({ name, hint, Poster }: (typeof TEMPLATES)[number]) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rotX = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotY = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const lift = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const onMove = (e: React.MouseEvent) => {
    if (prefersReducedMotion()) return;
    const el = cardRef.current;
    if (!el) return;
    if (!rotX.current || !rotY.current || !lift.current) {
      rotX.current = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      rotY.current = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      lift.current = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    }
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotY.current?.(px * 10);
    rotX.current?.(-py * 10);
    lift.current?.(-10);
  };

  const onLeave = () => {
    rotX.current?.(0);
    rotY.current?.(0);
    lift.current?.(0);
  };

  return (
    <div data-template className="[perspective:1200px]">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group cursor-pointer will-change-transform"
      >
        <Poster className="shadow-soft transition-shadow duration-500 group-hover:shadow-lift" />
        <div className="mt-5 flex items-center justify-between px-1">
          <div>
            <h3 className="font-display text-[17px] font-bold tracking-[-0.01em] text-somae-ink">
              {name}
            </h3>
            <p className="mt-0.5 text-[13px] font-medium text-somae-ink/50">{hint}</p>
          </div>
          <span className="flex size-9 items-center justify-center rounded-full ring-1 ring-somae-ink/12 transition-all duration-300 group-hover:bg-somae-ink group-hover:text-white">
            <ArrowUpRight className="size-4" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function Templates() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-templates-header]', {
        y: 40,
        opacity: 0,
        duration: 1,
        stagger: 0.1,
        scrollTrigger: { trigger: scope.current, start: 'top 72%', once: true },
      });
      gsap.from('[data-template]', {
        y: 64,
        opacity: 0,
        duration: 1.1,
        stagger: 0.13,
        scrollTrigger: { trigger: '[data-templates-grid]', start: 'top 80%', once: true },
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="templates"
      className="relative mx-auto max-w-[1200px] px-6 py-[16vh]"
      aria-label="Style templates"
    >
      <div className="mx-auto max-w-[600px] text-center">
        <div data-templates-header>
          <SectionTag>Templates</SectionTag>
        </div>
        <h2
          data-templates-header
          className="mt-6 font-display text-[clamp(34px,4.6vw,60px)] leading-[1.04] font-extrabold tracking-[-0.03em] text-somae-ink"
        >
          You don’t need the <span className="text-gradient-blue">perfect prompt.</span>
        </h2>
        <p
          data-templates-header
          className="mt-4 text-[15.5px] leading-relaxed font-medium text-somae-ink/55"
        >
          Start with a style. Tell Somae what you want. We’ll handle the rest.
        </p>
      </div>

      <div data-templates-grid className="mx-auto mt-16 grid max-w-[980px] gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <TemplateCard key={t.name} {...t} />
        ))}
      </div>
    </section>
  );
}
