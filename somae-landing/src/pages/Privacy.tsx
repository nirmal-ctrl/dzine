/**
 * ─────────────────────────────────────────────────────────────────────────
 * IMPORTANT: Review this Privacy Policy with qualified legal counsel before
 * publishing.
 *
 * This page is intentionally built with clearly marked placeholders such as
 *   [TO BE CONFIRMED], [COMPANY LEGAL NAME], [PRIVACY EMAIL ADDRESS],
 *   [BUSINESS ADDRESS], [AI PROVIDER NAME], [RETENTION PERIOD],
 *   [LIST ACTUAL ANALYTICS / COOKIE SERVICES HERE], [DATE]
 * wherever a legal, regulatory, security, retention, or third-party detail
 * has not yet been finalized. Search this file for "[" to find every
 * editable placeholder before launch.
 *
 * TODO: Confirm actual retention periods before publishing. (See section 06.)
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { navigate } from '@/lib/router';
import { prefersReducedMotion } from '@/lib/motion';
import { AVATAR_SMALL } from '@/lib/avatars';
import { Wordmark } from '@/components/Nav';
import { Footer } from '@/sections/Footer';

/* ── Editable legal placeholders ───────────────────────────────────────── */

const LAST_UPDATED = '[DATE]'; // TODO: replace with the official policy date, e.g. 'March 1, 2026'
const COMPANY_LEGAL_NAME = '[COMPANY LEGAL NAME]';
const PRIVACY_EMAIL = '[PRIVACY EMAIL ADDRESS]';
const BUSINESS_ADDRESS = '[BUSINESS ADDRESS]';
const AI_PROVIDER = '[AI PROVIDER NAME]';

/** Visually distinct inline chip so unfinished legal details are impossible to miss. */
function Ph({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-dashed border-somae-blue/50 bg-somae-blue/10 px-1.5 py-0.5 text-[0.86em] font-semibold whitespace-nowrap text-somae-deep">

      {children}
    </span>
  );
}

/* ── Subtle reveal animation (opacity + tiny translate, nothing cinematic) ─ */

function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -6% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-all duration-700 ease-out',
        shown ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ── Sections ──────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: 'information-we-collect', num: '01', short: 'Information We Collect', title: 'Information We Collect' },
  { id: 'how-we-use', num: '02', short: 'How We Use Your Information', title: 'How We Use Your Information' },
  { id: 'ai-third-party', num: '03', short: 'AI & Third-Party Services', title: 'AI and Third-Party Services' },
  { id: 'uploaded-content', num: '04', short: 'Uploaded Content', title: 'Uploaded Content' },
  { id: 'cookies-analytics', num: '05', short: 'Cookies & Analytics', title: 'Cookies and Analytics' },
  { id: 'data-retention', num: '06', short: 'Data Retention', title: 'Data Retention' },
  { id: 'data-security', num: '07', short: 'Data Security', title: 'Data Security' },
  { id: 'your-rights', num: '08', short: 'Your Rights', title: 'Your Rights' },
  { id: 'childrens-privacy', num: '09', short: "Children's Privacy", title: "Children's Privacy" },
  { id: 'changes', num: '10', short: 'Changes', title: 'Changes to This Privacy Policy' },
  { id: 'contact', num: '11', short: 'Contact', title: 'Contact Us' },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function SectionHeading({ num, children }: { num: string; children: ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-4 font-display text-[clamp(24px,3vw,32px)] font-extrabold tracking-[-0.025em] text-somae-ink">
      <span className="font-sans text-[13px] font-bold tracking-[0.18em] text-somae-blue">{num}</span>
      {children}
    </h2>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[16.5px] leading-[1.75] text-somae-ink/70">{children}</p>;
}

function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-[16.5px] leading-[1.7] text-somae-ink/70">
      <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-somae-blue" />
      <span>{children}</span>
    </li>
  );
}

/* ── Privacy page header ───────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Product', href: '#demo' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#why' },
  { label: 'Contact', href: '#beta' },
];

function PrivacyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        scrolled ? 'glass shadow-[0_1px_0_rgb(12_12_12/0.06)]' : 'bg-transparent',
      )}
    >
      <nav className="mx-auto flex h-[68px] max-w-[1200px] items-center justify-between px-6">
        <button
          onClick={() => navigate('/')}
          aria-label="Somae — back to homepage"
          className="transition-opacity hover:opacity-70"
        >
          <Wordmark />
        </button>

        <div className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => navigate('/', { scrollTo: link.href })}
              className="text-[13.5px] font-medium text-somae-ink/70 transition-colors hover:text-somae-ink"
            >
              {link.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/', { scrollTo: '#beta' })}
          className="group flex items-center gap-2 rounded-full bg-somae-ink px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:shadow-lift active:scale-[0.97]"
        >
          Join the Private Beta
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </nav>
    </header>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export function Privacy() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    document.title = 'Privacy Policy — Somae';
    window.scrollTo(0, 0);
  }, []);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: '-28% 0px -62% 0px' },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative min-h-svh bg-white">
      <PrivacyNav />

      {/* Very subtle blue atmosphere at the top — restrained, not cinematic */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(60%_70%_at_50%_0%,rgb(8_194_255/0.09),transparent_70%)]"
      />

      <main className="relative mx-auto max-w-[1200px] px-6 pt-[150px] pb-28 md:pt-[170px]">
        {/* ── Header block ── */}
        <Reveal>
          <p className="text-[12.5px] font-bold tracking-[0.22em] text-somae-blue uppercase">
            Legal
          </p>
          <h1 className="mt-4 font-display text-[clamp(44px,7vw,84px)] leading-[1.02] font-extrabold tracking-[-0.04em] text-somae-ink">
            Privacy Policy
          </h1>
          <p className="mt-5 text-[14px] font-medium text-somae-ink/45">
            Last updated — <Ph>{LAST_UPDATED}</Ph>
          </p>
        </Reveal>

        {/* ── Introduction ── */}
        <Reveal delay={80} className="mt-12 max-w-[720px]">
          <div className="flex items-start gap-5">
            <img
              src={AVATAR_SMALL}
              alt=""
              draggable={false}
              className="mt-1 hidden w-14 shrink-0 sm:block"
            />
            <p className="text-[18px] leading-[1.75] font-medium text-somae-ink/75">
              This Privacy Policy describes how Somae (<Ph>{COMPANY_LEGAL_NAME}</Ph>, “we”, “us”,
              or “our”) collects, uses, stores, and protects information when you interact with the
              Somae website and product. We’ve written it in plain, simple language — because a
              document about your information should be easy to understand.
            </p>
          </div>
        </Reveal>

        {/* ── Mobile section nav (horizontally scrollable) ── */}
        <nav
          aria-label="Policy sections"
          className="no-scrollbar glass sticky top-[68px] z-40 -mx-6 mt-14 flex gap-2 overflow-x-auto px-6 py-3 lg:hidden"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap transition-all duration-300',
                active === s.id
                  ? 'bg-somae-ink text-white'
                  : 'bg-somae-ink/5 text-somae-ink/60 hover:bg-somae-blue/15 hover:text-somae-ink',
              )}
            >
              {s.num} · {s.short}
            </button>
          ))}
        </nav>

        {/* ── Two-column editorial layout ── */}
        <div className="mt-10 grid gap-16 lg:mt-16 lg:grid-cols-[250px_minmax(0,1fr)]">
          {/* Sticky table of contents (desktop) */}
          <aside className="hidden lg:block">
            <nav aria-label="Table of contents" className="sticky top-28">
              <p className="text-[11.5px] font-bold tracking-[0.2em] text-somae-ink/35 uppercase">
                On this page
              </p>
              <ul className="mt-5 space-y-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToSection(s.id)}
                      aria-current={active === s.id ? 'true' : undefined}
                      className={cn(
                        'group flex w-full items-baseline gap-3 rounded-lg px-3 py-2 text-left text-[13.5px] font-medium transition-all duration-300',
                        active === s.id
                          ? 'bg-somae-blue/10 text-somae-ink'
                          : 'text-somae-ink/45 hover:bg-somae-ink/[0.04] hover:text-somae-ink',
                      )}
                    >
                      <span
                        className={cn(
                          'text-[11px] font-bold tracking-wider transition-colors duration-300',
                          active === s.id ? 'text-somae-blue' : 'text-somae-ink/30',
                        )}
                      >
                        {s.num}
                      </span>
                      {s.short}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Policy content */}
          <div className="max-w-[720px]">
            {/* 01 — Information We Collect */}
            <Reveal>
              <section id="information-we-collect" className="scroll-mt-32">
                <SectionHeading num="01">Information We Collect</SectionHeading>
                <P>
                  The information we collect depends on how you interact with Somae. The categories
                  below describe what we may collect; anything still being finalized is clearly
                  marked rather than assumed.
                </P>
                <ul className="mt-6 space-y-3.5">
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">Contact information.</strong>{' '}
                      When you join the private beta waitlist, we collect the email address you
                      provide so we can contact you about Somae.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">Account information.</strong>{' '}
                      If and when Somae introduces user accounts, we may collect registration
                      details such as your name and email address. <Ph>[TO BE CONFIRMED]</Ph>
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">
                        Prompts and text you submit.
                      </strong>{' '}
                      When you use Somae’s creative features, we process the text prompts and
                      instructions you provide in order to generate content for you.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">
                        Images and brand assets you upload.
                      </strong>{' '}
                      Such as product images, logos, and reference images you choose to provide. See
                      section 04 for details.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">Generated content.</strong>{' '}
                      The visuals and other content Somae creates in response to your requests.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">
                        Device and browser information.
                      </strong>{' '}
                      Such as browser type, device type, and similar technical data.{' '}
                      <Ph>[TO BE CONFIRMED]</Ph>
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">
                        Website usage information.
                      </strong>{' '}
                      How you interact with our website. <Ph>[TO BE CONFIRMED]</Ph>
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">
                        Cookies and similar technologies.
                      </strong>{' '}
                      See section 05 for the current status.
                    </span>
                  </Li>
                </ul>
              </section>
            </Reveal>

            {/* 02 — How We Use Your Information */}
            <Reveal className="mt-20">
              <section id="how-we-use" className="scroll-mt-32">
                <SectionHeading num="02">How We Use Your Information</SectionHeading>
                <P>Where applicable, we use the information we collect to:</P>
                <ul className="mt-6 space-y-3.5">
                  <Li>Provide and operate Somae, including processing your creative requests.</Li>
                  <Li>Generate visual content based on the prompts and assets you provide.</Li>
                  <Li>Maintain, improve, and develop the service.</Li>
                  <Li>
                    Communicate with you — for example, sending the beta invitation or product
                    updates you asked for.
                  </Li>
                  <Li>Prevent abuse, fraud, or unauthorized activity.</Li>
                  <Li>
                    Understand how the product is used so we can make it better.{' '}
                    <Ph>[TO BE CONFIRMED — usage analytics are not yet implemented]</Ph>
                  </Li>
                </ul>
              </section>
            </Reveal>

            {/* 03 — AI and Third-Party Services */}
            <Reveal className="mt-20">
              <section id="ai-third-party" className="scroll-mt-32">
                <SectionHeading num="03">AI and Third-Party Services</SectionHeading>
                <P>
                  Somae uses artificial intelligence to generate visual content. To do this, certain
                  inputs — such as your text prompts and any images you upload — may be processed by
                  third-party AI or infrastructure providers acting on our behalf, where applicable.
                </P>
                <P>
                  <strong className="font-semibold text-somae-ink">Current providers:</strong>{' '}
                  <Ph>{AI_PROVIDER}</Ph> — this placeholder will be replaced with the specific
                  provider(s), along with links to their privacy policies, before launch.
                </P>
                <P>
                  <strong className="font-semibold text-somae-ink">What may be shared:</strong> your
                  prompts, uploaded reference images, and related creative inputs — only as needed
                  to fulfil your request. How those providers handle data sent to them is governed
                  by their own policies. <Ph>[TO BE CONFIRMED]</Ph>
                </P>
              </section>
            </Reveal>

            {/* 04 — Uploaded Content */}
            <Reveal className="mt-20">
              <section id="uploaded-content" className="scroll-mt-32">
                <SectionHeading num="04">Uploaded Content</SectionHeading>
                <P>You may choose to provide content to Somae, such as:</P>
                <ul className="mt-6 space-y-3.5">
                  <Li>Product images</Li>
                  <Li>Logos and brand assets</Li>
                  <Li>Reference images</Li>
                  <Li>Creative prompts and text</Li>
                </ul>
                <P>
                  How long uploaded content is stored, whether it is used to train or improve AI
                  models, and how deletion requests are handled: <Ph>[TO BE CONFIRMED]</Ph>. We will
                  update this section with definitive answers before launch rather than guess.
                </P>
                <P>
                  Ownership of the content you upload: <Ph>[TO BE CONFIRMED]</Ph> — final ownership
                  terms will be set out in our Terms of Service.
                </P>
              </section>
            </Reveal>

            {/* 05 — Cookies and Analytics */}
            <Reveal className="mt-20">
              <section id="cookies-analytics" className="scroll-mt-32">
                <SectionHeading num="05">Cookies and Analytics</SectionHeading>
                <P>
                  The Somae website currently uses limited browser storage on your own device — for
                  example, to remember your beta signup state locally. Information stored this way
                  stays in your browser and is not transmitted to us by that mechanism.
                </P>
                <P>
                  <strong className="font-semibold text-somae-ink">Analytics and tracking:</strong>{' '}
                  no third-party analytics or advertising trackers are implemented on this website
                  at the time of writing. If that changes, this section will list exactly what is
                  used: <Ph>[LIST ACTUAL ANALYTICS / COOKIE SERVICES HERE]</Ph>
                </P>
              </section>
            </Reveal>

            {/* 06 — Data Retention */}
            <Reveal className="mt-20">
              <section id="data-retention" className="scroll-mt-32">
                <SectionHeading num="06">Data Retention</SectionHeading>
                {/* TODO: Confirm actual retention periods before publishing. */}
                <P>
                  We retain information for as long as necessary to provide our services and for
                  legitimate business or legal purposes, subject to the specific retention practices
                  applicable to each type of information.
                </P>
                <P>
                  Specific retention periods per data type: <Ph>[RETENTION PERIOD]</Ph>{' '}
                  <Ph>[TO BE CONFIRMED]</Ph>
                </P>
              </section>
            </Reveal>

            {/* 07 — Data Security */}
            <Reveal className="mt-20">
              <section id="data-security" className="scroll-mt-32">
                <SectionHeading num="07">Data Security</SectionHeading>
                <P>
                  We take the security of your information seriously and use reasonable
                  administrative, technical, and organizational measures designed to protect it.
                  Implementation-specific details: <Ph>[TO BE CONFIRMED]</Ph>
                </P>
                <P>
                  That said, no method of transmission over the internet or method of electronic
                  storage is completely secure, and we cannot guarantee absolute security.
                </P>
              </section>
            </Reveal>

            {/* 08 — Your Rights */}
            <Reveal className="mt-20">
              <section id="your-rights" className="scroll-mt-32">
                <SectionHeading num="08">Your Rights</SectionHeading>
                <P>
                  Depending on your location and applicable law, you may have certain rights
                  regarding your personal information, which may include:
                </P>
                <ul className="mt-6 space-y-3.5">
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">Access</strong> — request a
                      copy of the personal information we hold about you.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">Correction</strong> — ask us
                      to correct inaccurate or incomplete information.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">Deletion</strong> — ask us to
                      delete your personal information.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">Withdrawal of consent</strong>{' '}
                      — where processing is based on consent, withdraw it at any time.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">Data portability</strong> —
                      receive your information in a portable format.
                    </span>
                  </Li>
                  <Li>
                    <span>
                      <strong className="font-semibold text-somae-ink">
                        Objection or restriction
                      </strong>{' '}
                      — object to, or request restriction of, certain processing where applicable.
                    </span>
                  </Li>
                </ul>
                <P>
                  To exercise any applicable right, contact us at <Ph>{PRIVACY_EMAIL}</Ph>. We may
                  need to verify your identity before fulfilling certain requests.
                </P>
              </section>
            </Reveal>

            {/* 09 — Children's Privacy */}
            <Reveal className="mt-20">
              <section id="childrens-privacy" className="scroll-mt-32">
                <SectionHeading num="09">Children’s Privacy</SectionHeading>
                <P>
                  Somae is not directed at children, and we do not knowingly collect personal
                  information from children. Minimum age requirement: <Ph>[TO BE CONFIRMED]</Ph>
                </P>
                <P>
                  If you believe a child has provided us with personal information, please contact
                  us at <Ph>{PRIVACY_EMAIL}</Ph> and we will take appropriate steps to remove it.
                </P>
              </section>
            </Reveal>

            {/* 10 — Changes to This Privacy Policy */}
            <Reveal className="mt-20">
              <section id="changes" className="scroll-mt-32">
                <SectionHeading num="10">Changes to This Privacy Policy</SectionHeading>
                <P>
                  We may update this Privacy Policy from time to time. When we do, the changes will
                  be reflected on this page with an updated “Last updated” date. We encourage you to
                  review this page periodically. If we make material changes, we may provide
                  additional notice where appropriate. <Ph>[TO BE CONFIRMED]</Ph>
                </P>
              </section>
            </Reveal>

            {/* 11 — Contact Us */}
            <Reveal className="mt-20">
              <section id="contact" className="scroll-mt-32">
                <SectionHeading num="11">Contact Us</SectionHeading>
                <P>
                  <strong className="font-semibold text-somae-ink">Questions about privacy?</strong>
                </P>
                <P>
                  If you have questions about this Privacy Policy or how your information is
                  handled, contact us at:
                </P>
                <div className="mt-6 rounded-2xl bg-somae-mist p-6 ring-1 ring-somae-blue/15">
                  <p className="text-[15px] leading-[1.8] text-somae-ink/75">
                    <Ph>{PRIVACY_EMAIL}</Ph>
                    <br />
                    <Ph>{COMPANY_LEGAL_NAME}</Ph>
                    <br />
                    <Ph>{BUSINESS_ADDRESS}</Ph>
                  </p>
                </div>
              </section>
            </Reveal>

            {/* Closing note — subtle avatar, content stays the priority */}
            <Reveal className="mt-24">
              <div className="flex items-center gap-5 rounded-3xl bg-gradient-to-br from-somae-mist to-somae-lav p-8 ring-1 ring-somae-blue/15">
                <img
                  src={AVATAR_SMALL}
                  alt=""
                  draggable={false}
                  className="w-16 shrink-0 animate-breathe"
                />
                <div>
                  <p className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-somae-ink">
                    We’re here to help.
                  </p>
                  <p className="mt-1.5 text-[14.5px] leading-[1.65] text-somae-ink/60">
                    Somae is playful when you’re creating — and serious when it comes to your
                    information.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
