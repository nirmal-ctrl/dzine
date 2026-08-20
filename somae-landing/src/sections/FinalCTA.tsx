import { useRef, useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { gsap, useGSAP } from '@/lib/gsapSetup';
import { prefersReducedMotion } from '@/lib/motion';
import { Avatar } from '@/components/Avatar';
import { useJourneyEnabled } from '@/components/AvatarJourney';
import { HandwrittenNote } from '@/components/HandwrittenNote';

/**
 * Wire this to your waitlist endpoint when ready — leave empty to simulate
 * a successful signup locally (stored in localStorage).
 */
const BETA_ENDPOINT = '';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export function FinalCTA() {
  const scope = useRef<HTMLElement>(null);
  const journeyEnabled = useJourneyEnabled();
  const [email, setEmail] = useState('');
  const [state, setState] = useState<FormState>('idle');

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('[data-cta]', {
        y: 44,
        opacity: 0,
        duration: 1.1,
        stagger: 0.1,
        scrollTrigger: { trigger: scope.current, start: 'top 62%', once: true },
      });
    },
    { scope },
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'loading' || state === 'success') return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState('error');
      return;
    }
    setState('loading');
    try {
      if (BETA_ENDPOINT) {
        await fetch(BETA_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
      } else {
        await new Promise((r) => setTimeout(r, 700));
        localStorage.setItem('somae-beta-email', email);
      }
      setState('success');
    } catch {
      setState('error');
    }
  };

  return (
    <section
      ref={scope}
      id="beta"
      className="relative flex min-h-svh flex-col items-center justify-center overflow-clip px-6 py-[16vh]"
      aria-label="Join the private beta"
    >
      {/* avatar — journey lands here on desktop */}
      {journeyEnabled ? (
        <div className="journey-slot-beta aspect-square w-[min(28vw,300px)]" aria-hidden />
      ) : (
        <div data-cta className="relative aspect-square w-[min(52vw,260px)]">
          <Avatar expression={state === 'success' ? 'happy' : 'calm'} withGlow className="size-full" />
        </div>
      )}

      <HandwrittenNote
        arrow="left"
        rotate={4}
        className="absolute top-[22%] right-[10%] hidden lg:block"
      >
        {'Got an idea?\nLet’s make it beautiful! ♡'}
      </HandwrittenNote>

      <h2
        data-cta
        className="mt-10 max-w-[760px] text-center font-display text-[clamp(36px,5.2vw,68px)] leading-[1.03] font-extrabold tracking-[-0.035em] text-somae-ink"
      >
        Your creative companion is{' '}
        <span className="text-gradient-blue">almost here.</span>
      </h2>
      <p data-cta className="mt-5 text-[16px] font-medium text-somae-ink/55">
        Create better. Create faster.
      </p>

      {/* signup */}
      <div data-cta className="mt-10 w-full max-w-[460px]">
        {state === 'success' ? (
          <div className="flex items-center justify-center gap-3 rounded-full bg-somae-mist px-6 py-4 ring-1 ring-somae-blue/25" role="status">
            <span className="flex size-6 items-center justify-center rounded-full bg-somae-blue text-white">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <p className="text-[14.5px] font-semibold text-somae-ink">
              You’re on the list. Somae will say hi soon ♡
            </p>
          </div>
        ) : (
          <form onSubmit={submit} noValidate>
            <div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-soft ring-1 ring-black/8 transition-shadow focus-within:ring-2 focus-within:ring-somae-blue/60">
              <label htmlFor="beta-email" className="sr-only">
                Email address
              </label>
              <input
                id="beta-email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (state === 'error') setState('idle');
                }}
                className="min-w-0 flex-1 bg-transparent px-4 text-[14.5px] font-medium text-somae-ink outline-none placeholder:text-somae-ink/35"
              />
              <button
                type="submit"
                disabled={state === 'loading'}
                className="group flex shrink-0 items-center gap-2 rounded-full bg-somae-ink px-5 py-3 text-[13.5px] font-semibold text-white transition-all duration-300 hover:shadow-lift active:scale-[0.97] disabled:opacity-60"
              >
                {state === 'loading' ? 'Joining…' : 'Join the Private Beta'}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </div>
            <p
              aria-live="polite"
              className={`mt-3 text-center text-[12.5px] font-medium transition-opacity duration-300 ${
                state === 'error' ? 'text-[#e5484d] opacity-100' : 'opacity-0'
              }`}
            >
              Please enter a valid email address.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
