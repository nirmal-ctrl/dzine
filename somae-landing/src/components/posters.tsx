import type { ReactNode } from 'react';
import { ArrowUpRight, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';
import { AVATAR_SMALL } from '@/lib/avatars';

/**
 * Somae's "generated visuals" are built as pure CSS/SVG compositions —
 * crisp at any size, feather-light, and always on-brand. Each poster uses
 * container-query units so it scales perfectly inside any layout.
 */

function PosterFrame({
  children,
  className,
  label,
}: {
  children: ReactNode;
  className?: string;
  label: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        '@container poster-grain relative aspect-[3/4] overflow-hidden rounded-[7%] shadow-soft select-none',
        className,
      )}
    >
      {children}
    </div>
  );
}

/** "40% OFF — ALL COLLECTIONS" sale campaign poster. */
export function SalePoster({ className }: { className?: string }) {
  return (
    <PosterFrame
      label="Generated sale campaign poster: 40 percent off all collections"
      className={cn('bg-[linear-gradient(160deg,#08c2ff_0%,#0099d6_62%,#0077b6_100%)]', className)}
    >
      <div className="absolute top-[7%] left-[8%] flex items-center gap-[3%] text-white/85">
        <span className="size-[4cqw] rounded-full bg-white" />
        <span className="font-display text-[4.2cqw] font-bold tracking-[0.28em]">SOMAE</span>
      </div>
      <Sparkles className="absolute top-[7%] right-[8%] size-[6cqw] text-white/80" />

      {/* product orb */}
      <div className="absolute top-[20%] right-[10%] size-[34cqw] rounded-full bg-[radial-gradient(circle_at_32%_28%,#ffffff_0%,#e8f2f9_55%,#cfdfea_100%)] shadow-[0_18px_40px_-12px_rgb(0_0_0/0.35)]" />
      <div className="absolute top-[26%] right-[16%] size-[9cqw] rounded-full bg-white/90 blur-[2px]" />

      <div className="absolute bottom-[24%] left-[8%] leading-[0.86] text-white">
        <p className="font-display text-[30cqw] font-extrabold tracking-[-0.04em]">40%</p>
        <p className="font-display text-[17cqw] font-extrabold tracking-[-0.02em]">OFF</p>
        <p className="mt-[4cqw] text-[4.4cqw] font-semibold tracking-[0.34em] text-white/85">
          ALL COLLECTIONS
        </p>
      </div>

      <div className="absolute bottom-[7%] left-[8%] rounded-full bg-white px-[7cqw] py-[3cqw] text-[4.4cqw] font-bold tracking-[0.12em] text-somae-ink">
        SHOP NOW
      </div>
    </PosterFrame>
  );
}

/** "new season, closer together" product launch poster. */
export function LaunchPoster({ className }: { className?: string }) {
  return (
    <PosterFrame
      label="Generated product launch poster: new season, closer together"
      className={cn('bg-[#f4efe6]', className)}
    >
      <p className="absolute top-[7%] left-[8%] text-[3.8cqw] font-semibold tracking-[0.3em] text-somae-ink/50">
        01 — COLLECTION
      </p>
      <div className="absolute top-[16%] left-[8%] font-display text-[13.5cqw] leading-[1.02] font-bold tracking-[-0.03em] text-somae-ink">
        <p>new</p>
        <p>season</p>
      </div>
      <p className="font-hand absolute top-[47%] left-[9%] rotate-[-3deg] text-[7.5cqw] font-semibold text-somae-ink/70">
        closer together
      </p>

      {/* abstract chair composition */}
      <div className="absolute right-[8%] bottom-[16%] h-[38cqw] w-[40cqw]">
        <div className="absolute bottom-[38%] left-[6%] h-[52%] w-[58%] rounded-[14%] bg-[#d9cbb4]" />
        <div className="absolute bottom-[34%] left-[0%] h-[10%] w-[70%] rounded-full bg-somae-ink" />
        <div className="absolute bottom-[6%] left-[8%] h-[30%] w-[5%] rounded-full bg-somae-ink" />
        <div className="absolute right-[18%] bottom-[6%] h-[30%] w-[5%] rounded-full bg-somae-ink" />
        <div className="absolute top-[0%] right-[6%] size-[14cqw] rounded-full bg-somae-blue/85" />
      </div>

      <div className="absolute bottom-[7%] left-[8%] flex items-center gap-[2cqw] rounded-full border border-somae-ink/25 px-[6cqw] py-[2.6cqw] text-[4cqw] font-semibold text-somae-ink">
        Explore <ArrowUpRight className="size-[4.5cqw]" />
      </div>
    </PosterFrame>
  );
}

/** "Good Design Builds Brighter Brands" studio poster. */
export function BrandPoster({ className }: { className?: string }) {
  return (
    <PosterFrame
      label="Generated brand poster: good design builds brighter brands"
      className={cn('bg-white', className)}
    >
      <div className="absolute top-[8%] left-[8%] right-[8%]">
        <p className="font-display text-[11.5cqw] leading-[1.06] font-extrabold tracking-[-0.025em] text-somae-ink">
          Good<br />Design<br />Builds<br />
          <span className="text-somae-blue">Brighter</span>
          <br />Brands
        </p>
      </div>

      {/* product bottle on mist disc */}
      <div className="absolute right-[8%] bottom-[10%] size-[38cqw] rounded-full bg-somae-mist" />
      <div className="absolute right-[19%] bottom-[16%] h-[42cqw] w-[16cqw] rounded-[45%/28%] bg-[linear-gradient(170deg,#ffffff,#e6edf4)] shadow-[0_16px_36px_-14px_rgb(12_12_12/0.3)] ring-1 ring-black/5">
        <div className="absolute top-[16%] left-1/2 h-[6%] w-[46%] -translate-x-1/2 rounded-full bg-somae-ink" />
        <div className="absolute top-[42%] left-1/2 size-[5cqw] -translate-x-1/2 rounded-full bg-somae-blue" />
      </div>

      <p className="absolute bottom-[8%] left-[8%] text-[3.6cqw] font-semibold tracking-[0.26em] text-somae-ink/45">
        SKINCARE — 04
      </p>
    </PosterFrame>
  );
}

/** Dark social quote poster with mini Somae. */
export function SocialPoster({ className }: { className?: string }) {
  return (
    <PosterFrame
      label="Generated social poster: good things create together"
      className={cn('bg-somae-ink', className)}
    >
      <div className="absolute top-[9%] left-[8%] right-[8%]">
        <p className="font-display text-[10.5cqw] leading-[1.14] font-bold tracking-[-0.02em] text-white">
          Good<br />things<br />
          <span className="text-somae-blue">create</span><br />together.
        </p>
      </div>
      <img
        src={AVATAR_SMALL}
        alt=""
        draggable={false}
        className="absolute right-[7%] bottom-[9%] w-[30cqw] drop-shadow-[0_16px_30px_rgb(8_194_255/0.25)]"
      />
      <p className="font-hand absolute bottom-[10%] left-[8%] rotate-[-2deg] text-[6.5cqw] text-white/70">
        — made with Somae
      </p>
    </PosterFrame>
  );
}

/** "Ready in 4K" export-quality poster. */
export function GlowPoster({ className }: { className?: string }) {
  return (
    <PosterFrame
      label="Generated quality poster: ready in 4K"
      className={cn('bg-[linear-gradient(165deg,#f3f9ff_0%,#dceeff_100%)]', className)}
    >
      <div className="absolute top-[8%] left-[8%]">
        <p className="font-display text-[12cqw] leading-[1.05] font-extrabold tracking-[-0.03em] text-somae-ink">
          Ready<br />in <span className="text-somae-blue">4K.</span>
        </p>
      </div>

      {/* stacked export sheets */}
      <div className="absolute right-[10%] bottom-[12%] size-[40cqw]">
        <div className="absolute inset-0 rotate-[10deg] rounded-[12%] bg-somae-blue/15" />
        <div className="absolute inset-0 rotate-[5deg] rounded-[12%] bg-somae-blue/25" />
        <div className="absolute inset-0 flex items-center justify-center rounded-[12%] bg-white shadow-soft">
          <span className="font-display text-[16cqw] font-extrabold tracking-[-0.02em] text-somae-blue">
            4K
          </span>
        </div>
      </div>

      <div className="absolute bottom-[10%] left-[8%] space-y-[2.4cqw]">
        {['High resolution', 'Social-ready', 'One click'].map((t) => (
          <p key={t} className="flex items-center gap-[2.4cqw] text-[4cqw] font-semibold text-somae-ink/70">
            <span className="flex size-[4.6cqw] items-center justify-center rounded-full bg-somae-blue/15">
              <Check className="size-[3cqw] text-somae-deep" />
            </span>
            {t}
          </p>
        ))}
      </div>
    </PosterFrame>
  );
}

/** Soft lavender "weekend drop" poster. */
export function DropPoster({ className }: { className?: string }) {
  return (
    <PosterFrame
      label="Generated drop poster: the weekend drop"
      className={cn('bg-[linear-gradient(150deg,#eef2ff_0%,#e0f4ff_100%)]', className)}
    >
      <div className="absolute top-[8%] left-[8%] right-[8%] flex items-center justify-between">
        <span className="text-[3.8cqw] font-semibold tracking-[0.3em] text-somae-ink/50">DROP 07</span>
        <Sparkles className="size-[5cqw] text-somae-blue" />
      </div>
      <div className="absolute top-[18%] left-[8%] font-display text-[12.5cqw] leading-[1.04] font-extrabold tracking-[-0.03em] text-somae-ink">
        <p>the</p>
        <p>
          <span className="text-somae-blue">weekend</span>
        </p>
        <p>drop</p>
      </div>
      <div className="absolute right-[10%] bottom-[14%] size-[30cqw] rounded-[38%] bg-[radial-gradient(circle_at_30%_25%,#ffffff_0%,#dce9f5_60%,#c4d8e8_100%)] shadow-[0_18px_40px_-14px_rgb(12_12_12/0.28)]" />
      <p className="font-hand absolute bottom-[9%] left-[8%] rotate-[-2deg] text-[6.5cqw] font-semibold text-somae-ink/60">
        this friday ♡
      </p>
    </PosterFrame>
  );
}

export const POSTERS = [SalePoster, LaunchPoster, BrandPoster, SocialPoster, GlowPoster, DropPoster];
