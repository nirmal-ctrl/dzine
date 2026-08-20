import { useRef, useState, useSyncExternalStore } from 'react';
import { gsap, useGSAP, ScrollTrigger } from '@/lib/gsapSetup';
import { ALL_EXPRESSIONS, AVATAR_SRC, AVATAR_SRC_SET, type SomaeExpression } from '@/lib/avatars';

/**
 * The Avatar Journey — one persistent Somae that travels through the page
 * as you scroll: hero → watching the problem → thinking through the workflow
 * → peeking at the studio → handing off to the cinematic scene → celebrating
 * the results → resting at the final CTA.
 *
 * Implementation notes:
 * - A single fixed layer; all scroll movement is transform/opacity only.
 * - Poses are viewport-relative function values, re-computed on refresh.
 * - Idle motion (float / breathe / tilt) lives on nested wrappers so it
 *   never fights the scrubbed journey transforms.
 * - Expressions crossfade between stacked layers; missing expression images
 *   fall back to the primary avatar automatically.
 * - Desktop only: below lg (or with reduced motion) the layer is removed and
 *   sections render their own inline avatars instead.
 */

const journeyMedia = () => window.matchMedia('(min-width: 1024px)');
const reducedMedia = () => window.matchMedia('(prefers-reduced-motion: reduce)');

export function useJourneyEnabled(): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const jq = journeyMedia();
      const rq = reducedMedia();
      jq.addEventListener('change', onChange);
      rq.addEventListener('change', onChange);
      return () => {
        jq.removeEventListener('change', onChange);
        rq.removeEventListener('change', onChange);
      };
    },
    () => journeyMedia().matches && !reducedMedia().matches,
    () => false,
  );
}

type Pose = {
  x: () => number;
  y: () => number;
  scale: number;
  rotation: number;
  opacity: number;
};

const vw = (f: number) => () => window.innerWidth * f;
const vh = (f: number) => () => window.innerHeight * f;

/** Document-center of a journey slot placeholder, as an offset from the
 *  viewport center at a given scroll position. */
function slotOffset(slotSelector: string, sectionSelector: string, arrivalEnd: string) {
  return () => {
    const slot = document.querySelector(slotSelector);
    const section = document.querySelector(sectionSelector);
    if (!slot || !section) return { x: 0, y: 0 };
    const sr = slot.getBoundingClientRect();
    const slotDocX = sr.left + window.scrollX + sr.width / 2;
    const slotDocY = sr.top + window.scrollY + sr.height / 2;
    const secDocTop = section.getBoundingClientRect().top + window.scrollY;
    const endPct = parseFloat(arrivalEnd) / 100;
    const scrollAtArrival = secDocTop - window.innerHeight * endPct;
    return {
      x: slotDocX - window.innerWidth / 2,
      y: slotDocY - scrollAtArrival - window.innerHeight / 2,
    };
  };
}

const heroSlot = slotOffset('.journey-slot-hero', '#hero', '0');
// Both CTA poses are measured against the placeholder at the exact scroll
// position where their transition starts/ends. Because scroll position and
// scrub progress are both linear, the avatar rides *with* the CTA content
// instead of drifting away from it.
const betaSlot = slotOffset('.journey-slot-beta', '#beta', '32');
const betaSlotAtFooter = slotOffset('.journey-slot-beta', '#footer', '62');

/** The path through the story, in order. */
const POSES: Record<string, Pose> = {
  hero: { x: () => heroSlot().x, y: () => heroSlot().y, scale: 1, rotation: 0, opacity: 1 },
  problem: { x: vw(-0.37), y: vh(0.1), scale: 0.4, rotation: -7, opacity: 1 },
  how: { x: vw(0.38), y: vh(0.12), scale: 0.36, rotation: 6, opacity: 1 },
  demo: { x: vw(-0.39), y: vh(0.32), scale: 0.34, rotation: -5, opacity: 1 },
  idea: { x: vw(0), y: vh(0.06), scale: 0.3, rotation: 0, opacity: 0 },
  why: { x: vw(0), y: vh(0.22), scale: 0.3, rotation: 0, opacity: 0 },
  quality: { x: vw(0.37), y: vh(0.02), scale: 0.42, rotation: 5, opacity: 1 },
  beta: { x: () => betaSlot().x, y: () => betaSlot().y, scale: 0.66, rotation: 0, opacity: 1 },
  footer: { x: () => betaSlotAtFooter().x, y: () => betaSlotAtFooter().y, scale: 0.6, rotation: 0, opacity: 0 },
};

const TRANSITIONS: Array<{
  trigger: string;
  start: string;
  end: string;
  endTrigger?: string;
  from: string;
  to: string;
}> = [
  { trigger: '#problem', start: 'top bottom', end: 'top 22%', from: 'hero', to: 'problem' },
  { trigger: '#how-it-works', start: 'top bottom', end: 'top 28%', from: 'problem', to: 'how' },
  { trigger: '#demo', start: 'top bottom', end: 'top 32%', from: 'how', to: 'demo' },
  { trigger: '#idea', start: 'top bottom', end: 'top 42%', from: 'demo', to: 'idea' },
  { trigger: '#why', start: 'top bottom', end: 'top 38%', from: 'idea', to: 'why' },
  { trigger: '#quality', start: 'top 88%', end: 'top 28%', from: 'why', to: 'quality' },
  { trigger: '#beta', start: 'top bottom', end: 'top 32%', from: 'quality', to: 'beta' },
  // rides the CTA content down, bowing out as the footer arrives
  { trigger: '#beta', start: 'top 32%', endTrigger: '#footer', end: 'top 62%', from: 'beta', to: 'footer' },
];

const EXPRESSION_CUES: Array<{ trigger: string; position: string; enter: SomaeExpression; back: SomaeExpression }> = [
  { trigger: '#how-it-works', position: 'top 65%', enter: 'thinking', back: 'default' },
  { trigger: '#quality', position: 'top 55%', enter: 'excited', back: 'thinking' },
  { trigger: '#beta', position: 'top 55%', enter: 'calm', back: 'excited' },
];

export function AvatarJourney() {
  const enabled = useJourneyEnabled();
  const rootRef = useRef<HTMLDivElement>(null);
  // Expressions whose image files actually exist (404 → removed, falls back).
  const [missing, setMissing] = useState<Partial<Record<SomaeExpression, boolean>>>({});

  useGSAP(
    () => {
      if (!enabled) return;
      const root = rootRef.current;
      if (!root) return;

      /* ── initial pose + gentle entrance ───────────────────── */
      // Centering comes from the CSS `translate` property (no first-frame
      // flash); GSAP owns x/y/scale/rotation on top of it.
      const hero = POSES.hero;
      gsap.set(root, {
        x: hero.x(),
        y: hero.y(),
        scale: hero.scale,
        rotation: hero.rotation,
        opacity: hero.opacity,
      });
      gsap.from('.journey-intro', {
        scale: 0.55,
        opacity: 0,
        y: 60,
        duration: 1.4,
        delay: 0.4,
        ease: 'back.out(1.5)',
      });

      /* ── idle life: float, breathe, micro-tilt, living shadow ─ */
      gsap.to('.journey-float', { y: -14, duration: 3.4, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.journey-breathe', { scale: 1.015, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.journey-tilt', { rotation: 1.6, duration: 4.6, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      gsap.to('.journey-shadow', {
        scaleX: 0.88,
        opacity: 0.1,
        duration: 3.4,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      });
      gsap.to('.journey-glow', { opacity: 0.75, duration: 4.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });

      /* ── the journey itself ───────────────────────────────── */
      TRANSITIONS.forEach(({ trigger, start, end, endTrigger, from, to }) => {
        const a = POSES[from];
        const b = POSES[to];
        gsap.fromTo(
          root,
          {
            x: a.x, y: a.y, scale: a.scale, rotation: a.rotation, opacity: a.opacity,
          },
          {
            x: b.x, y: b.y, scale: b.scale, rotation: b.rotation, opacity: b.opacity,
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger, start, end, endTrigger, scrub: 1.1, invalidateOnRefresh: true },
          },
        );
      });

      /* ── expression cues ──────────────────────────────────── */
      // Queried live so 404'd expression layers (removed from the DOM)
      // simply fall back to the primary avatar.
      const setExpression = (name: SomaeExpression) => {
        const layers = Array.from(root.querySelectorAll<HTMLElement>('[data-expr]'));
        const target = layers.some((el) => el.dataset.expr === name) ? name : 'default';
        layers.forEach((el) => {
          gsap.to(el, {
            autoAlpha: el.dataset.expr === target ? 1 : 0,
            duration: 0.7,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        });
      };

      EXPRESSION_CUES.forEach(({ trigger, position, enter, back }) => {
        ScrollTrigger.create({
          trigger,
          start: position,
          onEnter: () => setExpression(enter),
          onLeaveBack: () => setExpression(back),
        });
      });
    },
    // No scope: journey triggers reference sections across the whole page.
    { dependencies: [enabled] },
  );

  if (!enabled) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed top-1/2 left-1/2 z-30 aspect-square w-[min(42vw,460px)] [translate:-50%_-50%] will-change-transform"
    >
      <div className="journey-intro size-full">
        {/* atmosphere glow */}
        <div className="journey-glow absolute inset-[-16%] rounded-full bg-[radial-gradient(circle,rgb(8_194_255/0.2)_0%,transparent_62%)] opacity-50" />
        {/* contact shadow */}
        <div className="journey-shadow absolute bottom-[1%] left-1/2 h-[6%] w-[56%] -translate-x-1/2 rounded-[100%] bg-somae-ink/15 blur-[14px]" />
        {/* idle motion stack */}
        <div className="journey-float relative size-full">
          <div className="journey-breathe size-full">
            <div className="journey-tilt size-full">
              {ALL_EXPRESSIONS.map((expr) =>
                missing[expr] && expr !== 'default' ? null : (
                  <img
                    key={expr}
                    data-expr={expr}
                    src={AVATAR_SRC[expr]}
                    srcSet={expr === 'default' ? AVATAR_SRC_SET : undefined}
                    sizes="(min-width: 1024px) 42vw, 1px"
                    alt=""
                    draggable={false}
                    loading={expr === 'default' ? 'eager' : 'lazy'}
                    fetchPriority={expr === 'default' ? 'high' : 'auto'}
                    onError={() => {
                      if (expr !== 'default') {
                        setMissing((m) => ({ ...m, [expr]: true }));
                      }
                    }}
                    className="absolute inset-0 size-full object-contain"
                    style={{ visibility: expr === 'default' ? 'visible' : 'hidden' }}
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
