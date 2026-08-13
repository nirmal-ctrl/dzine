import { CircleHelp, Settings as SettingsIcon, X } from 'lucide-react';
import { Logo } from '@/components/somae/Logo';

interface HeaderProps {
    onSettings: () => void;
}

/**
 * Compact top header — æ somae + Beta 01 on the left,
 * help / settings / close on the right. Minimal vertical space.
 */
export function Header({ onSettings }: HeaderProps) {
    return (
        <header className="relative z-20 flex h-14 shrink-0 items-center justify-between px-5">
            <Logo tone="dark" />

            <div className="flex items-center gap-1">
                <a
                    href="https://somae.ai"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Help"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-somae-ink/45 transition-all duration-300 hover:bg-white/70 hover:text-somae-ink hover:shadow-soft"
                >
                    <CircleHelp className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </a>
                <button
                    type="button"
                    aria-label="Settings"
                    onClick={onSettings}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-somae-ink/45 transition-all duration-300 hover:bg-white/70 hover:text-somae-ink hover:shadow-soft"
                >
                    <SettingsIcon className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </button>
                <button
                    type="button"
                    aria-label="Close"
                    onClick={() => window.close()}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-somae-ink/45 transition-all duration-300 hover:bg-white/70 hover:text-somae-ink hover:shadow-soft"
                >
                    <X className="h-[18px] w-[18px]" strokeWidth={1.9} />
                </button>
            </div>
        </header>
    );
}
