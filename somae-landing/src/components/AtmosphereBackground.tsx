import { useRef } from 'react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';

/**
 * The living background: a white field with extremely subtle blue/lavender
 * light drifting through it. A stronger blue glow follows key scroll moments
 * (the demo + cinematic scenes) like light passing through the environment.
 */
export function AtmosphereBackground() {
  const scope = useRef<HTMLDivElement>(null);

  // No scope: the glow triggers reference sections across the page.
  useGSAP(() => {
    if (prefersReducedMotion()) return;

    // The deep glow breathes in around the dark demo + cinematic scene,
    // then settles back to calm white.
    gsap
      .timeline({
        scrollTrigger: {
          trigger: '#demo',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1.2,
        },
      })
      .to('.atmo-deep', { opacity: 0.55, duration: 1 })
      .to('.atmo-deep', { opacity: 0.12, duration: 1 });

    gsap.to('.atmo-deep', {
      opacity: 0.4,
      scrollTrigger: {
        trigger: '#beta',
        start: 'top 70%',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    });
  });

  return (
    <div
      ref={scope}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-white"
    >
      {/* drifting cool light — barely there */}
      <div className="animate-drift-a absolute -top-[20%] left-[-12%] size-[70vmax] rounded-full bg-[radial-gradient(circle,rgb(8_194_255/0.07)_0%,transparent_62%)]" />
      <div className="animate-drift-b absolute top-[30%] right-[-18%] size-[64vmax] rounded-full bg-[radial-gradient(circle,rgb(147_164_255/0.06)_0%,transparent_62%)]" />
      <div className="animate-drift-a absolute bottom-[-24%] left-[16%] size-[56vmax] rounded-full bg-[radial-gradient(circle,rgb(8_194_255/0.05)_0%,transparent_60%)] [animation-delay:-16s]" />

      {/* scroll-reactive deeper glow */}
      <div className="atmo-deep absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_45%,rgb(8_194_255/0.16)_0%,transparent_70%)] opacity-10" />
    </div>
  );
}
