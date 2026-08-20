import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { scrollToId } from '@/lib/scroll';

const LINKS = [
  { label: 'Product', href: '#demo' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'About', href: '#why' },
];

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'font-display text-[22px] font-extrabold tracking-[-0.03em] select-none',
        className,
      )}
    >
      Som<span className="text-somae-blue">ae</span>
    </span>
  );
}

export function Nav() {
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
          onClick={() => scrollToId('#hero')}
          aria-label="Somae — back to top"
          className="transition-opacity hover:opacity-70"
        >
          <Wordmark />
        </button>

        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToId(link.href)}
              className="text-[13.5px] font-medium text-somae-ink/70 transition-colors hover:text-somae-ink"
            >
              {link.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollToId('#beta')}
          className="group flex items-center gap-2 rounded-full bg-somae-ink px-5 py-2.5 text-[13px] font-semibold text-white transition-all duration-300 hover:-translate-y-px hover:shadow-lift active:scale-[0.97]"
        >
          Join Beta
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </button>
      </nav>
    </header>
  );
}
