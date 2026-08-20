"use client";

/**
 * ─────────────────────────────────────────────────────────────────────────
 * IMPORTANT: Review this Privacy Policy with qualified legal counsel before
 * publishing.
 *
 * This page intentionally uses clearly marked placeholders such as
 *   [TO BE CONFIRMED], [COMPANY LEGAL NAME], [PRIVACY EMAIL ADDRESS],
 *   [BUSINESS ADDRESS], [RETENTION PERIOD], [DATE]
 * wherever a legal, regulatory, security, or retention detail has not yet
 * been finalized. Search this file for "[" to find every editable
 * placeholder before launch.
 *
 * TODO: Confirm actual retention periods before publishing. (See section 06.)
 * ─────────────────────────────────────────────────────────────────────────
 */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SomaeLogo, AeMark } from "@/components/somae/logo";
import { cn } from "@/lib/utils";

/* ── Editable legal placeholders ───────────────────────────────────────── */

const LAST_UPDATED = "[DATE]"; // TODO: replace with the official policy date, e.g. "March 1, 2026"
const COMPANY_LEGAL_NAME = "[COMPANY LEGAL NAME]";
const PRIVACY_EMAIL = "[PRIVACY EMAIL ADDRESS]";
const BUSINESS_ADDRESS = "[BUSINESS ADDRESS]";

/** Visually distinct inline chip so unfinished legal details are impossible to miss. */
function Ph({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-md border border-dashed border-[#2e6bff]/50 bg-[#2e6bff]/8 px-1.5 py-0.5 text-[0.86em] font-semibold whitespace-nowrap text-[#2b5ce6]">
      {children}
    </span>
  );
}

/* ── Sections ──────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "information-we-collect", num: "01", short: "Information We Collect" },
  { id: "how-we-use", num: "02", short: "How We Use Your Information" },
  { id: "ai-third-party", num: "03", short: "AI & Third-Party Services" },
  { id: "uploaded-content", num: "04", short: "Uploaded Content" },
  { id: "cookies-analytics", num: "05", short: "Cookies & Analytics" },
  { id: "data-retention", num: "06", short: "Data Retention" },
  { id: "data-security", num: "07", short: "Data Security" },
  { id: "your-rights", num: "08", short: "Your Rights" },
  { id: "childrens-privacy", num: "09", short: "Children's Privacy" },
  { id: "changes", num: "10", short: "Changes" },
  { id: "contact", num: "11", short: "Contact" },
] as const;

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionHeading({ num, children }: { num: string; children: ReactNode }) {
  return (
    <h2 className="flex items-baseline gap-4 text-[24px] font-semibold tracking-[-0.02em] text-[#101c3d] md:text-[28px]">
      <span className="text-[12px] font-bold tracking-[0.18em] text-[#2e6bff]">{num}</span>
      {children}
    </h2>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-[15.5px] leading-[1.8] font-medium text-[#5c6b8a]">{children}</p>;
}

function Li({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-[15.5px] leading-[1.75] font-medium text-[#5c6b8a]">
      <span aria-hidden className="mt-[11px] size-1.5 shrink-0 rounded-full bg-[#2e6bff]" />
      <span>{children}</span>
    </li>
  );
}

/* ── Privacy page header (light variant of the marketing nav) ──────────── */

const NAV_LINKS = [
  { label: "Product", href: "/#product" },
  { label: "Use Cases", href: "/#use-cases" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/onboarding" },
];

function PrivacyNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "glass-strong shadow-soft" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-[1200px] items-center justify-between px-6">
        <Link href="/" aria-label="Somae — back to homepage" className="transition-opacity hover:opacity-70">
          <SomaeLogo className="text-[20px] text-[#101c3d]" />
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-[13.5px] font-medium text-[#5c6b8a] transition-colors hover:text-[#101c3d]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <Link
          href="/onboarding"
          className="group flex items-center gap-2 rounded-full bg-[#101c3d] px-5 py-2.5 text-[13px] font-semibold text-white shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift active:scale-[0.98]"
        >
          Start Free Trial
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </nav>
    </header>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────── */

export function PrivacyContent() {
  const [active, setActive] = useState<string>(SECTIONS[0].id);

  // Scroll-spy: highlight the section currently in view.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-28% 0px -62% 0px" },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5f9ff]">
      <PrivacyNav />

      {/* Very subtle brand atmosphere at the top — restrained, not cinematic */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[480px] bg-[radial-gradient(60%_70%_at_50%_0%,rgb(46_107_255/0.08),transparent_70%)]"
      />
      <AeMark className="ae-watermark-blue pointer-events-none absolute -right-20 top-[6%] hidden text-[420px] leading-none lg:block" />

      <main className="relative mx-auto max-w-[1200px] px-6 pt-[150px] pb-28 md:pt-[170px]">
        {/* ── Header block ── */}
        <div className="animate-rise-in">
          <p className="text-[12px] font-bold uppercase tracking-[0.22em] text-[#2e6bff]">Legal</p>
          <h1 className="mt-4 text-[44px] leading-[1.04] font-semibold tracking-[-0.035em] text-[#101c3d] md:text-[68px]">
            Privacy Policy
          </h1>
          <p className="mt-5 text-[13.5px] font-medium text-[#8fa1c7]">
            Last updated — <Ph>{LAST_UPDATED}</Ph>
          </p>
        </div>

        {/* ── Introduction ── */}
        <div className="animate-rise-in mt-12 max-w-[720px]" style={{ animationDelay: "0.1s" }}>
          <p className="text-[17px] leading-[1.8] font-medium text-[#3d4c6d]">
            This Privacy Policy describes how Somae (<Ph>{COMPANY_LEGAL_NAME}</Ph>, “we”, “us”, or
            “our”) collects, uses, stores, and protects information when you interact with the Somae
            website and product. We’ve written it in plain, simple language — because a document
            about your information should be easy to understand.
          </p>
        </div>

        {/* ── Mobile section nav (horizontally scrollable) ── */}
        <nav
          aria-label="Policy sections"
          className="no-scrollbar glass-strong sticky top-[72px] z-40 -mx-6 mt-14 flex gap-2 overflow-x-auto px-6 py-3 lg:hidden"
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[12.5px] font-semibold whitespace-nowrap transition-all duration-300",
                active === s.id
                  ? "bg-[#101c3d] text-white"
                  : "bg-[#101c3d]/5 text-[#5c6b8a] hover:bg-[#2e6bff]/12 hover:text-[#101c3d]",
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
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8fa1c7]">
                On this page
              </p>
              <ul className="mt-5 space-y-1">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => scrollToSection(s.id)}
                      aria-current={active === s.id ? "true" : undefined}
                      className={cn(
                        "flex w-full items-baseline gap-3 rounded-xl px-3 py-2 text-left text-[13.5px] font-medium transition-all duration-300",
                        active === s.id
                          ? "bg-[#2e6bff]/10 text-[#101c3d]"
                          : "text-[#5c6b8a]/70 hover:bg-[#101c3d]/[0.04] hover:text-[#101c3d]",
                      )}
                    >
                      <span
                        className={cn(
                          "text-[11px] font-bold tracking-wider transition-colors duration-300",
                          active === s.id ? "text-[#2e6bff]" : "text-[#8fa1c7]",
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
            <section id="information-we-collect" className="scroll-mt-32">
              <SectionHeading num="01">Information We Collect</SectionHeading>
              <P>
                The information we collect depends on how you interact with Somae. The categories
                below describe what the product collects today; anything still being finalized is
                clearly marked rather than assumed.
              </P>
              <ul className="mt-6 space-y-3.5">
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Account information.</strong>{" "}
                    When you create a Somae account (for example, by signing in with Google), we
                    receive your name, email address, and profile image from the sign-in provider.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Contact information.</strong>{" "}
                    The email address associated with your account, used to communicate with you
                    about Somae.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">
                      Prompts and text you submit.
                    </strong>{" "}
                    When you use Somae’s creative features, we process the text prompts and
                    instructions you provide in order to generate content for you.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">
                      Images and brand assets you upload.
                    </strong>{" "}
                    Such as product images, logos, and reference images you choose to provide. See
                    section 04 for details.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Generated content.</strong> The
                    visuals and other content Somae creates in response to your requests.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Payment information.</strong>{" "}
                    When you purchase a Somae plan, payment details are processed by our payment
                    provider, Razorpay. Somae does not store your full card details.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">
                      Device and browser information.
                    </strong>{" "}
                    Such as browser type, device type, and similar technical data.{" "}
                    <Ph>[TO BE CONFIRMED]</Ph>
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">
                      Website usage information.
                    </strong>{" "}
                    How you interact with our website. <Ph>[TO BE CONFIRMED]</Ph>
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">
                      Cookies and similar technologies.
                    </strong>{" "}
                    See section 05 for the current status.
                  </span>
                </Li>
              </ul>
            </section>

            {/* 02 — How We Use Your Information */}
            <section id="how-we-use" className="mt-20 scroll-mt-32">
              <SectionHeading num="02">How We Use Your Information</SectionHeading>
              <P>Where applicable, we use the information we collect to:</P>
              <ul className="mt-6 space-y-3.5">
                <Li>Provide and operate Somae, including processing your creative requests.</Li>
                <Li>Generate visual and written content based on the prompts and assets you provide.</Li>
                <Li>Maintain, improve, and develop the service.</Li>
                <Li>
                  Communicate with you — for example, onboarding, product updates, and
                  license-related emails.
                </Li>
                <Li>Process payments and manage your subscription or license.</Li>
                <Li>Prevent abuse, fraud, or unauthorized activity.</Li>
                <Li>
                  Understand how the product is used so we can make it better.{" "}
                  <Ph>[TO BE CONFIRMED — product analytics are not yet implemented]</Ph>
                </Li>
              </ul>
            </section>

            {/* 03 — AI and Third-Party Services */}
            <section id="ai-third-party" className="mt-20 scroll-mt-32">
              <SectionHeading num="03">AI and Third-Party Services</SectionHeading>
              <P>
                Somae uses artificial intelligence to generate content. To do this, certain inputs —
                such as your text prompts and any images you upload — are processed by third-party
                AI providers acting on our behalf. Depending on the features you use, these may
                include:
              </P>
              <ul className="mt-6 space-y-3.5">
                <Li>Google (Gemini / Imagen models)</Li>
                <Li>OpenAI</Li>
                <Li>Anthropic (Claude)</Li>
                <Li>Groq</Li>
              </ul>
              <P>
                <strong className="font-semibold text-[#101c3d]">What may be shared:</strong> your
                prompts, uploaded reference images, and related creative inputs — only as needed to
                fulfil your request. How those providers handle data sent to them is governed by
                their own privacy policies. <Ph>[TO BE CONFIRMED — link provider policies here]</Ph>
              </P>
              <P>
                <strong className="font-semibold text-[#101c3d]">Other processors:</strong> we also
                rely on Razorpay for payment processing and Google for sign-in authentication.
              </P>
            </section>

            {/* 04 — Uploaded Content */}
            <section id="uploaded-content" className="mt-20 scroll-mt-32">
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
                update this section with definitive answers rather than guess.
              </P>
              <P>
                Ownership of the content you upload: <Ph>[TO BE CONFIRMED]</Ph> — final ownership
                terms will be set out in our Terms of Service.
              </P>
            </section>

            {/* 05 — Cookies and Analytics */}
            <section id="cookies-analytics" className="mt-20 scroll-mt-32">
              <SectionHeading num="05">Cookies and Analytics</SectionHeading>
              <P>
                Somae uses a small number of essential cookies to keep you signed in and keep the
                service secure (for example, authentication session cookies set by our sign-in
                system). These are required for the product to function and are not used for
                advertising.
              </P>
              <P>
                <strong className="font-semibold text-[#101c3d]">Analytics and tracking:</strong> no
                third-party analytics or advertising trackers are implemented on this website at the
                time of writing. If that changes, this section will list exactly what is used:{" "}
                <Ph>[LIST ACTUAL ANALYTICS / COOKIE SERVICES HERE]</Ph>
              </P>
            </section>

            {/* 06 — Data Retention */}
            <section id="data-retention" className="mt-20 scroll-mt-32">
              <SectionHeading num="06">Data Retention</SectionHeading>
              {/* TODO: Confirm actual retention periods before publishing. */}
              <P>
                We retain information for as long as necessary to provide our services and for
                legitimate business or legal purposes, subject to the specific retention practices
                applicable to each type of information.
              </P>
              <P>
                Specific retention periods per data type: <Ph>[RETENTION PERIOD]</Ph>{" "}
                <Ph>[TO BE CONFIRMED]</Ph>
              </P>
            </section>

            {/* 07 — Data Security */}
            <section id="data-security" className="mt-20 scroll-mt-32">
              <SectionHeading num="07">Data Security</SectionHeading>
              <P>
                We take the security of your information seriously and use reasonable
                administrative, technical, and organizational measures designed to protect it —
                including encrypted connections (HTTPS) and keeping payment details with our
                payment provider rather than on our own systems. Implementation-specific details:{" "}
                <Ph>[TO BE CONFIRMED]</Ph>
              </P>
              <P>
                That said, no method of transmission over the internet or method of electronic
                storage is completely secure, and we cannot guarantee absolute security.
              </P>
            </section>

            {/* 08 — Your Rights */}
            <section id="your-rights" className="mt-20 scroll-mt-32">
              <SectionHeading num="08">Your Rights</SectionHeading>
              <P>
                Depending on your location and applicable law, you may have certain rights regarding
                your personal information, which may include:
              </P>
              <ul className="mt-6 space-y-3.5">
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Access</strong> — request a
                    copy of the personal information we hold about you.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Correction</strong> — ask us to
                    correct inaccurate or incomplete information.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Deletion</strong> — ask us to
                    delete your personal information.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Withdrawal of consent</strong>{" "}
                    — where processing is based on consent, withdraw it at any time.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Data portability</strong> —
                    receive your information in a portable format.
                  </span>
                </Li>
                <Li>
                  <span>
                    <strong className="font-semibold text-[#101c3d]">Objection or restriction</strong>{" "}
                    — object to, or request restriction of, certain processing where applicable.
                  </span>
                </Li>
              </ul>
              <P>
                To exercise any applicable right, contact us at <Ph>{PRIVACY_EMAIL}</Ph>. We may
                need to verify your identity before fulfilling certain requests.
              </P>
            </section>

            {/* 09 — Children's Privacy */}
            <section id="childrens-privacy" className="mt-20 scroll-mt-32">
              <SectionHeading num="09">Children’s Privacy</SectionHeading>
              <P>
                Somae is not directed at children, and we do not knowingly collect personal
                information from children. Minimum age requirement: <Ph>[TO BE CONFIRMED]</Ph>
              </P>
              <P>
                If you believe a child has provided us with personal information, please contact us
                at <Ph>{PRIVACY_EMAIL}</Ph> and we will take appropriate steps to remove it.
              </P>
            </section>

            {/* 10 — Changes to This Privacy Policy */}
            <section id="changes" className="mt-20 scroll-mt-32">
              <SectionHeading num="10">Changes to This Privacy Policy</SectionHeading>
              <P>
                We may update this Privacy Policy from time to time. When we do, the changes will be
                reflected on this page with an updated “Last updated” date. We encourage you to
                review this page periodically. If we make material changes, we may provide
                additional notice where appropriate. <Ph>[TO BE CONFIRMED]</Ph>
              </P>
            </section>

            {/* 11 — Contact Us */}
            <section id="contact" className="mt-20 scroll-mt-32">
              <SectionHeading num="11">Contact Us</SectionHeading>
              <P>
                <strong className="font-semibold text-[#101c3d]">Questions about privacy?</strong>
              </P>
              <P>
                If you have questions about this Privacy Policy or how your information is handled,
                contact us at:
              </P>
              <div className="mt-6 rounded-[20px] bg-white p-6 shadow-soft ring-1 ring-[#e9f0fb]">
                <p className="text-[14.5px] leading-[2] font-medium text-[#3d4c6d]">
                  <Ph>{PRIVACY_EMAIL}</Ph>
                  <br />
                  <Ph>{COMPANY_LEGAL_NAME}</Ph>
                  <br />
                  <Ph>{BUSINESS_ADDRESS}</Ph>
                </p>
              </div>
            </section>

            {/* Closing note */}
            <div className="mt-24 flex items-center gap-5 rounded-[24px] bg-white p-8 shadow-soft ring-1 ring-[#e9f0fb]">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#2b5ce6]">
                <AeMark className="text-[26px]" />
              </span>
              <div>
                <p className="text-[18px] font-semibold tracking-[-0.01em] text-[#101c3d]">
                  We’re here to help.
                </p>
                <p className="mt-1 text-[13.5px] leading-[1.65] font-medium text-[#5c6b8a]">
                  Somae is playful when you’re creating — and serious when it comes to your
                  information.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer (matches the marketing page) ── */}
      <footer className="relative border-t border-[#dce9ff] bg-white/60">
        <div className="mx-auto flex max-w-[1080px] flex-col items-center justify-between gap-6 px-6 py-10 md:flex-row">
          <SomaeLogo className="text-[20px] text-[#101c3d]" />
          <div className="flex items-center gap-7 text-[13px] font-medium text-[#5c6b8a]">
            <Link href="/#product" className="transition-colors hover:text-[#2b5ce6]">
              Product
            </Link>
            <Link href="/pricing" className="transition-colors hover:text-[#2b5ce6]">
              Pricing
            </Link>
            <Link href="/auth/signin" className="transition-colors hover:text-[#2b5ce6]">
              Login
            </Link>
            <Link href="/privacy" aria-current="page" className="font-semibold text-[#2b5ce6]">
              Privacy Policy
            </Link>
          </div>
          <p className="text-[12px] font-medium text-[#8fa1c7]">© 2026 Somae. Your brand, understood.</p>
        </div>
      </footer>
    </div>
  );
}
