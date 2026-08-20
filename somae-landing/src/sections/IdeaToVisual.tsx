import { useRef } from 'react';
import { Image as ImageIcon, Sparkles } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { LOGO_SRC } from '@/lib/avatars';
import { Avatar } from '@/components/Avatar';
import { SectionTag } from '@/components/ui';
import { LaunchPoster } from '@/components/posters';

const ORBIT_RADIUS = 'min(31vmin, 250px)';

/** Creative elements that orbit Somae while it thinks. */
const ORBIT_CHIPS = [
  { content: <span className="font-display text-[12px] font-bold text-white">Bold</span>, bg: 'bg-somae-ink' },
  {
    content: (
      <span className="flex -space-x-1">
        <span className="size-3 rounded-full bg-somae-blue ring-2 ring-white" />
        <span className="size-3 rounded-full bg-somae-ink ring-2 ring-white" />
        <span className="size-3 rounded-full bg-somae-sky ring-2 ring-white" />
      </span>
    ),
    bg: 'bg-white',
  },
  { content: <ImageIcon className="size-4 text-somae-ink/60" />, bg: 'bg-white' },
  { content: <span className="font-display text-[13px] font-extrabold text-somae-ink">Aa</span>, bg: 'bg-white' },
  { content: <Sparkles className="size-4 text-white" />, bg: 'bg-somae-blue' },
  {
    content: <img src={LOGO_SRC} alt="" className="size-5 rounded-md object-contain" draggable={false} />,
    bg: 'bg-white',
  },
];

/**
 * The cinematic heart of the site: a simple prompt expands, Somae rises,
 * creative elements orbit it, and everything resolves into a finished visual.
 * Pinned + scrubbed on desktop; a gentle stacked reveal on mobile.
 */
export function IdeaToVisual() {
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduced = prefersReducedMotion();

      if (reduced) {
        // Static end state: Somae above, the finished visual center stage.
        gsap.set('.idea-prompt', { autoAlpha: 0 });
        gsap.set('.idea-orbit', { autoAlpha: 0 });
        gsap.set('.idea-avatar', { autoAlpha: 1, x: 0, y: -190, scale: 0.52 });
        gsap.set('.idea-avatar-happy', { autoAlpha: 1 });
        gsap.set('.idea-poster', { autoAlpha: 1, scale: 1, y: 30 });
        gsap.set('.idea-caption', { autoAlpha: 1 });
        return;
      }

      const mm = gsap.matchMedia();

      // ── Desktop: the pinned cinematic ──────────────────────
      mm.add('(min-width: 1024px)', () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: '.idea-pin',
            start: 'top top',
            end: '+=2600',
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          '.idea-prompt',
          { y: 26, autoAlpha: 0, scale: 0.92 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, immediateRender: true },
        )
          .to('.idea-prompt', { scale: 1.05, duration: 0.28, yoyo: true, repeat: 1, ease: 'sine.inOut' })
          // Somae rises; the prompt lifts away
          .to('.idea-prompt', {
            y: () => -window.innerHeight * 0.3,
            scale: 0.78,
            opacity: 0.85,
            duration: 0.7,
            ease: 'power2.inOut',
          })
          .fromTo(
            '.idea-avatar',
            { y: () => window.innerHeight * 0.44, autoAlpha: 0, scale: 0.5 },
            { y: 0, autoAlpha: 1, scale: 1, duration: 0.9, ease: 'power2.out', immediateRender: true },
            '<0.1',
          )
          // the orbit assembles
          .fromTo(
            '.idea-orbit',
            { scale: 0.4, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.4)', immediateRender: true },
          )
          .fromTo(
            '.orbit-chip',
            { scale: 0, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, stagger: 0.08, duration: 0.4, ease: 'back.out(1.8)', immediateRender: true },
            '<0.15',
          )
          // it spins — chips stay upright via counter-rotation
          .to('.idea-orbit', { rotation: 220, duration: 1.6, ease: 'none' }, 'spin')
          .to('.orbit-counter', { rotation: '-=220', duration: 1.6, ease: 'none' }, 'spin')
          // creative energy dissolves into the result
          .to('.orbit-chip', { scale: 0, autoAlpha: 0, stagger: 0.05, duration: 0.35, ease: 'power2.in' }, 'dissolve')
          .to('.idea-orbit', { autoAlpha: 0, duration: 0.3 }, 'dissolve+=0.2')
          .to('.idea-prompt', { autoAlpha: 0, y: '-=34', duration: 0.4 }, 'dissolve')
          // Somae steps aside, delighted
          .to(
            '.idea-avatar',
            {
              x: () => -window.innerWidth * 0.24,
              y: () => window.innerHeight * 0.08,
              scale: 0.72,
              duration: 0.8,
              ease: 'power2.inOut',
            },
            'dissolve+=0.3',
          )
          .to('.idea-avatar-happy', { autoAlpha: 1, duration: 0.5 }, 'dissolve+=0.5')
          // the finished visual takes center stage
          .fromTo(
            '.idea-poster',
            { autoAlpha: 0, scale: 0.55, y: 70, rotation: 4 },
            { autoAlpha: 1, scale: 1, y: 0, rotation: 0, duration: 0.9, ease: 'back.out(1.3)', immediateRender: true },
            'dissolve+=0.55',
          )
          .fromTo(
            '.idea-caption',
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.5, immediateRender: true },
            'dissolve+=0.95',
          )
          .to({}, { duration: 0.6 });
      });

      // ── Mobile / tablet: gentle stacked reveal ─────────────
      mm.add('(max-width: 1023px)', () => {
        gsap.set('.idea-orbit', { autoAlpha: 0 });
        const tl = gsap.timeline({
          scrollTrigger: { trigger: '.idea-pin', start: 'top 55%', once: true },
        });
        tl.fromTo('.idea-prompt', { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7, immediateRender: true })
          .fromTo(
            '.idea-avatar',
            { y: 60, autoAlpha: 0, scale: 0.7 },
            { y: 0, autoAlpha: 1, scale: 0.6, duration: 0.9, ease: 'back.out(1.4)', immediateRender: true },
            '-=0.2',
          )
          // Somae steps up and the visual takes the stage
          .to('.idea-prompt', { autoAlpha: 0, y: -24, duration: 0.4 })
          .to('.idea-avatar', { y: () => -window.innerHeight * 0.27, scale: 0.42, duration: 0.6, ease: 'power2.inOut' }, '<')
          .to('.idea-avatar-happy', { autoAlpha: 1, duration: 0.4 }, '<0.2')
          .fromTo(
            '.idea-poster',
            { y: 60, autoAlpha: 0, scale: 0.8 },
            { y: 20, autoAlpha: 1, scale: 1, duration: 0.9, ease: 'back.out(1.4)', immediateRender: true },
            '-=0.2',
          )
          .fromTo('.idea-caption', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.5, immediateRender: true }, '-=0.3');
      });
    },
    { scope },
  );

  return (
    <section ref={scope} id="idea" aria-label="From idea to visual">
      <div className="idea-pin relative flex h-svh flex-col items-center justify-center overflow-clip">
        <div className="absolute top-[9%]">
          <SectionTag>From idea to visual</SectionTag>
        </div>

        {/* the prompt */}
        <div className="idea-prompt absolute top-1/2 left-1/2 z-10 [translate:-50%_-50%]">
          <div className="flex items-center gap-3 rounded-full bg-white py-3.5 pr-4 pl-6 shadow-lift ring-1 ring-black/5">
            <p className="text-[15px] font-medium whitespace-nowrap text-somae-ink/85">
              “A cozy morning coffee poster”
            </p>
            <span className="flex size-8 items-center justify-center rounded-full bg-somae-blue text-white">
              <Sparkles className="size-4" />
            </span>
          </div>
        </div>

        {/* Somae — thinking, then happy */}
        <div className="idea-avatar absolute top-1/2 left-1/2 aspect-square w-[min(36vmin,320px)] [translate:-50%_-50%]">
          <Avatar expression="thinking" idle={false} className="size-full" />
          <div className="idea-avatar-happy absolute inset-0 opacity-0">
            <Avatar expression="happy" idle={false} withShadow={false} className="size-full" />
          </div>
        </div>

        {/* the orbit */}
        <div className="idea-orbit pointer-events-none absolute top-1/2 left-1/2 [translate:-50%_-50%]">
          <div
            className="absolute top-1/2 left-1/2 [translate:-50%_-50%] rounded-full border border-somae-blue/20"
            style={{ width: `calc(${ORBIT_RADIUS} * 2)`, height: `calc(${ORBIT_RADIUS} * 2)` }}
          />
          {ORBIT_CHIPS.map((chip, i) => {
            const angle = i * 60;
            return (
              <div
                key={i}
                className="absolute top-1/2 left-1/2"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <div style={{ transform: `translateX(${ORBIT_RADIUS})` }}>
                  <div className="orbit-counter" style={{ transform: `rotate(${-angle}deg)` }}>
                    <span
                      className={`orbit-chip flex size-11 items-center justify-center rounded-full px-3 shadow-chip ring-1 ring-black/5 ${chip.bg} [translate:-50%_-50%]`}
                      style={{ minWidth: '44px' }}
                    >
                      {chip.content}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* the finished visual */}
        <div className="idea-poster absolute top-1/2 left-1/2 w-[min(58vw,290px)] [translate:-50%_-50%]">
          <LaunchPoster className="shadow-lift" />
        </div>

        <p className="idea-caption font-hand absolute bottom-[9%] left-1/2 [translate:-50%_0] rotate-[-2deg] text-[clamp(20px,2.2vw,28px)] font-semibold whitespace-nowrap text-somae-ink/70 opacity-0">
          simple idea → beautiful visual ♡
        </p>
      </div>
    </section>
  );
}
