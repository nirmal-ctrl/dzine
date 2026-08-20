import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { Avatar } from '@/components/Avatar';
import { useJourneyEnabled } from '@/components/AvatarJourney';
import { HandwrittenNote } from '@/components/HandwrittenNote';
import { PillButton, SectionTag } from '@/components/ui';

export function Hero() {
  const scope = useRef<HTMLElement>(null);
  const journeyEnabled = useJourneyEnabled();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      // Entrance — calm, confident, staggered.
      gsap.from('[data-hero]', {
        y: 44,
        opacity: 0,
        duration: 1.15,
        stagger: 0.09,
        delay: 0.2,
        ease: 'power3.out',
      });

      // The copy gently lifts away as the story begins.
      gsap.to('[data-hero-inner]', {
        y: -70,
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: {
          trigger: scope.current,
          start: 'bottom 85%',
          end: 'bottom 35%',
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope },
  );

  return (
    <section
      ref={scope}
      id="hero"
      className="relative flex min-h-svh items-center overflow-clip"
      aria-label="Introducing Somae"
    >
      <div
        data-hero-inner
        className="mx-auto grid w-full max-w-[1200px] items-center gap-10 px-6 pt-[100px] pb-24 lg:grid-cols-[1.05fr_0.95fr] lg:gap-0 lg:pt-[68px]"
      >
        {/* Copy */}
        <div className="relative z-10 text-center lg:text-left">
          <div data-hero>
            <SectionTag>Your creative companion</SectionTag>
          </div>

          <h1
            data-hero
            className="mt-7 font-display text-[clamp(46px,7.2vw,96px)] leading-[0.98] font-extrabold tracking-[-0.04em] text-somae-ink"
          >
            Create better.
            <br />
            <span className="text-gradient-blue">Create faster.</span>
          </h1>

          <p
            data-hero
            className="mx-auto mt-6 max-w-[440px] text-[17px] leading-relaxed font-medium text-somae-ink/60 lg:mx-0"
          >
            Your creative companion for turning simple ideas into beautiful
            visual content.
          </p>

          <div data-hero className="mt-10 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            <PillButton href="#beta" withArrow>
              Join the Private Beta
            </PillButton>
            <PillButton href="#how-it-works" variant="ghost">
              See how it works
            </PillButton>
          </div>
        </div>

        {/* Avatar zone — the journey avatar lands here on desktop */}
        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-none">
          {journeyEnabled ? (
            // Reserved space for the traveling avatar (matches its hero pose).
            <div className="journey-slot-hero mx-auto aspect-square w-[min(38vw,440px)]" aria-hidden />
          ) : (
            <div data-hero className="relative mx-auto aspect-square w-[min(72vw,380px)]">
              <Avatar withGlow priority className="size-full" />
            </div>
          )}
          <HandwrittenNote
            arrow="right"
            rotate={-4}
            className="absolute -top-6 left-0 lg:top-2 lg:-left-10"
          >
            {'Hi there!\nI’m Somae!'}
          </HandwrittenNote>
        </div>
      </div>

      {/* scroll cue */}
      <div
        aria-hidden
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-3 md:flex"
      >
        <span className="text-[10px] font-bold tracking-[0.3em] text-somae-ink/40 uppercase">
          Scroll
        </span>
        <span className="flex h-9 w-[22px] justify-center rounded-full ring-1 ring-somae-ink/15">
          <span className="mt-1.5 size-1 rounded-full bg-somae-blue animate-scroll-cue" />
        </span>
      </div>
    </section>
  );
}
