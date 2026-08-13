import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * The Somae companion — renders the ORIGINAL avatar asset from
 * `/public/avatar.png` when available (drop the official PNG in place
 * and it appears everywhere automatically). Until then, a carefully
 * crafted static SVG stand-in keeps the layout intact.
 *
 * Per the design system: the avatar is STATIC — no floating,
 * no walking, no pose changes. It is a stable product object.
 */
/** Resolve the avatar asset for both dev server and packaged extension contexts */
const AVATAR_SRC =
    typeof chrome !== 'undefined' && chrome.runtime?.getURL
        ? chrome.runtime.getURL('avatar.png')
        : '/avatar.png';

export function SomaeAvatar({ className }: { className?: string }) {
    const [assetMissing, setAssetMissing] = useState(false);

    if (!assetMissing) {
        return (
            <img
                src={AVATAR_SRC}
                alt="Somae"
                draggable={false}
                onError={() => setAssetMissing(true)}
                className={cn('select-none object-contain', className)}
            />
        );
    }

    // Static SVG fallback (used only while /public/avatar.png is absent)
    return (
        <svg
            viewBox="0 0 240 262"
            role="img"
            aria-label="Somae"
            className={cn('select-none', className)}
        >
            <defs>
                <linearGradient id="somae-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="58%" stopColor="#f4f6f9" />
                    <stop offset="100%" stopColor="#e2e8ef" />
                </linearGradient>
                <linearGradient id="somae-face" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#eef2f6" />
                </linearGradient>
                <radialGradient id="somae-shadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#0c0c0c" stopOpacity="0.16" />
                    <stop offset="70%" stopColor="#0c0c0c" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#0c0c0c" stopOpacity="0" />
                </radialGradient>
            </defs>

            <ellipse cx="120" cy="248" rx="72" ry="12" fill="url(#somae-shadow)" />

            <ellipse
                cx="47"
                cy="160"
                rx="17"
                ry="44"
                fill="url(#somae-body)"
                transform="rotate(14 47 160)"
            />
            <ellipse
                cx="193"
                cy="160"
                rx="17"
                ry="44"
                fill="url(#somae-body)"
                transform="rotate(-14 193 160)"
            />

            <path
                d="M120 22
                   C74 22 52 66 52 118
                   L52 196
                   C52 226 76 244 120 244
                   C164 244 188 226 188 196
                   L188 118
                   C188 66 166 22 120 22 Z"
                fill="url(#somae-body)"
            />

            <ellipse cx="120" cy="46" rx="52" ry="22" fill="#ffffff" opacity="0.65" />

            <rect x="74" y="52" width="92" height="86" rx="42" fill="url(#somae-face)" />
            <rect
                x="74"
                y="52"
                width="92"
                height="86"
                rx="42"
                fill="none"
                stroke="#dfe6ee"
                strokeWidth="1.5"
            />

            <ellipse cx="100" cy="92" rx="7.5" ry="11" fill="#101418" />
            <ellipse cx="140" cy="92" rx="7.5" ry="11" fill="#101418" />
            <circle cx="102.5" cy="88" r="2.4" fill="#ffffff" opacity="0.9" />
            <circle cx="142.5" cy="88" r="2.4" fill="#ffffff" opacity="0.9" />
            <path
                d="M106 112
                   Q120 126 134 112
                   Q130 124 120 124
                   Q110 124 106 112 Z"
                fill="#101418"
            />
            <ellipse cx="120" cy="118.5" rx="6" ry="2.6" fill="#3d4753" opacity="0.55" />

            <circle cx="150" cy="168" r="15" fill="#eef2f6" stroke="#ffffff" strokeWidth="2" />
            <path
                d="M150 174.5
                   C144.5 170 141 166.8 141 163
                   C141 159.8 143.4 157.5 146.2 157.5
                   C147.9 157.5 149.3 158.4 150 159.7
                   C150.7 158.4 152.1 157.5 153.8 157.5
                   C156.6 157.5 159 159.8 159 163
                   C159 166.8 155.5 170 150 174.5 Z"
                fill="#ffffff"
            />
        </svg>
    );
}

/** Minimal frosted thinking cloud with softly animated dots */
export function ThinkingCloud({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'glass-soft flex items-center gap-1.5 rounded-full px-4 py-2.5 shadow-soft ring-1 ring-black/[0.04]',
                className
            )}
        >
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="cloud-dot h-1.5 w-1.5 rounded-full bg-somae-blue"
                    style={{ animationDelay: `${i * 0.18}s` }}
                />
            ))}
        </div>
    );
}
