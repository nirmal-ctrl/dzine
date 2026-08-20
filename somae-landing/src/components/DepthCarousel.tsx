import { useCallback, useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsapSetup';
import { cn } from '@/lib/cn';
import { prefersReducedMotion } from '@/lib/motion';
import { POSTERS } from './posters';

const DECK = POSTERS.slice(0, 5);
const N = DECK.length;
const ADVANCE_MS = 3200;

/**
 * Slot layout for the deck — slot 0 is the front card.
 * Values are function-aware: `compact` shrinks the spread on small screens.
 */
function slotTransform(slot: number, compact: boolean) {
  const spread = compact ? 0.62 : 1;
  switch (slot) {
    case 0:
      return { xPercent: 0, z: 0, rotationY: 0, scale: 1, opacity: 1, zIndex: 50 };
    case 1:
      return { xPercent: 62 * spread, z: -260, rotationY: -34, scale: 0.86, opacity: 0.92, zIndex: 40 };
    case 2:
      return { xPercent: 106 * spread, z: -480, rotationY: -44, scale: 0.72, opacity: 0.5, zIndex: 30 };
    case 3:
      return { xPercent: -106 * spread, z: -480, rotationY: 44, scale: 0.72, opacity: 0.5, zIndex: 30 };
    default:
      return { xPercent: -62 * spread, z: -260, rotationY: 34, scale: 0.86, opacity: 0.92, zIndex: 40 };
  }
}

/**
 * A physical, depth-based looping carousel — the front visual glows while
 * the deck recedes into soft 3D space behind it. Advances on its own,
 * pauses on hover/focus, and respects reduced-motion.
 */
export function DepthCarousel({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const frontRef = useRef(0);
  const pausedRef = useRef(false);
  const [front, setFront] = useState(0);

  const compact = () => window.innerWidth < 768;

  const layout = useCallback((frontIndex: number, animate: boolean) => {
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const slot = (i - frontIndex + N) % N;
      const vars = {
        ...slotTransform(slot, compact()),
        duration: animate ? 1.15 : 0,
        ease: 'power3.inOut',
        overwrite: 'auto' as const,
      };
      gsap.to(card, vars);
      const glow = glowRefs.current[i];
      if (glow) {
        gsap.to(glow, {
          opacity: slot === 0 ? 0.85 : 0,
          duration: animate ? 1.15 : 0,
          ease: 'power2.out',
        });
      }
    });
  }, []);

  const advance = useCallback(
    (dir: 1 | -1 = 1) => {
      frontRef.current = (frontRef.current + dir + N) % N;
      setFront(frontRef.current);
      layout(frontRef.current, true);
    },
    [layout],
  );

  // Initial layout (no animation on first paint)
  useEffect(() => {
    layout(0, false);
    const onResize = () => layout(frontRef.current, false);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [layout]);

  // Auto-advance loop
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = window.setInterval(() => {
      if (!pausedRef.current && !document.hidden) advance(1);
    }, ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [advance]);

  return (
    <div className={cn('select-none', className)}>
      <div
        ref={stageRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Examples of visuals generated with Somae"
        className="relative mx-auto h-[min(72vw,430px)] w-full max-w-[900px] [perspective:1500px]"
        onMouseEnter={() => (pausedRef.current = true)}
        onMouseLeave={() => (pausedRef.current = false)}
        onFocus={() => (pausedRef.current = true)}
        onBlur={() => (pausedRef.current = false)}
      >
        {DECK.map((Poster, i) => (
          <div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            className="absolute top-1/2 left-1/2 w-[min(46vw,240px)] [translate:-50%_-50%] will-change-transform md:w-[250px]"
          >
            <div
              ref={(el) => {
                glowRefs.current[i] = el;
              }}
              aria-hidden
              className="absolute -inset-6 rounded-[36px] bg-[radial-gradient(circle,rgb(8_194_255/0.4)_0%,transparent_70%)] opacity-0 blur-md"
            />
            <Poster className="shadow-lift" />
          </div>
        ))}
      </div>

      {/* dots */}
      <div className="mt-10 flex items-center justify-center gap-2.5">
        {DECK.map((_, i) => (
          <button
            key={i}
            aria-label={`Show visual ${i + 1}`}
            aria-current={i === front}
            onClick={() => {
              frontRef.current = i;
              setFront(i);
              layout(i, true);
            }}
            className={cn(
              'h-1.5 rounded-full transition-all duration-500',
              i === front ? 'w-7 bg-somae-blue' : 'w-1.5 bg-somae-ink/20 hover:bg-somae-ink/40',
            )}
          />
        ))}
      </div>
    </div>
  );
}
