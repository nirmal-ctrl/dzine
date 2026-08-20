import type { SVGProps } from 'react';
import { AVATAR_SMALL } from '@/lib/avatars';
import { scrollToId } from '@/lib/scroll';
import { navigate } from '@/lib/router';

const LINKS = [
  { label: 'Product', href: '#demo' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#why' },
  { label: 'Contact', href: '#beta' },
  { label: 'Privacy Policy', href: '/privacy' },
];

/** Section anchors scroll in place on the homepage; from other pages we go home first. */
function handleFooterLink(href: string) {
  if (href.startsWith('/')) {
    navigate(href);
    return;
  }
  if (window.location.pathname !== '/') {
    navigate('/', { scrollTo: href });
  } else {
    scrollToId(href);
  }
}


/* Minimal brand glyphs (lucide no longer ships brand icons). */
const InstagramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
const XIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedInIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452z" />
  </svg>
);
const YouTubeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const SOCIALS = [
  { icon: InstagramIcon, label: 'Instagram' },
  { icon: XIcon, label: 'X (Twitter)' },
  { icon: LinkedInIcon, label: 'LinkedIn' },
  { icon: YouTubeIcon, label: 'YouTube' },
];

/** Minimal Apple-style footer — with Somae peeking over the top edge. */
export function Footer() {
  return (
    <footer id="footer" className="relative bg-somae-ink text-white" aria-label="Footer">
      {/* peeking Somae */}
      <div aria-hidden className="absolute bottom-full left-1/2 h-[86px] w-[150px] -translate-x-1/2 overflow-hidden">
        <img
          src={AVATAR_SMALL}
          alt=""
          draggable={false}
          className="absolute top-0 left-1/2 w-[150px] max-w-none -translate-x-1/2"
        />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pt-20 pb-10">
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div>
            <p className="font-display text-[26px] font-extrabold tracking-[-0.03em]">
              Som<span className="text-somae-blue">ae</span>
            </p>
            <p className="mt-2 text-[14px] font-medium text-white/55">Your creative companion.</p>
            <p className="font-hand mt-4 rotate-[-2deg] text-[19px] text-white/45">
              Create Better Together ♡
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3" aria-label="Footer">
            {LINKS.map((l) => (
              <button
                key={l.label}
                onClick={() => handleFooterLink(l.href)}
                className="text-[13.5px] font-medium text-white/60 transition-colors hover:text-white"

              >
                {l.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href="#footer"
                aria-label={s.label}
                onClick={(e) => e.preventDefault()}
                className="flex size-9 items-center justify-center rounded-full bg-white/8 text-white/70 ring-1 ring-white/10 transition-all duration-300 hover:bg-somae-blue hover:text-somae-ink"
              >
                <s.icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-7 md:flex-row">
          <p className="text-[12px] font-medium text-white/40">
            © 2026 Somae. All rights reserved.
          </p>
          <p className="text-[12px] font-semibold tracking-[0.14em] text-white/40 uppercase">
            Create Better. <span className="text-somae-blue">Create Faster.</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
