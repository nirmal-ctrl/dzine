import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { AVATAR_SRC, AVATAR_SRC_SET, type SomaeExpression } from '@/lib/avatars';

type AvatarProps = {
  expression?: SomaeExpression;
  className?: string;
  /** Idle motion: gentle float + breathe + micro tilt. Default true. */
  idle?: boolean;
  /** Soft contact shadow under the avatar. Default true. */
  withShadow?: boolean;
  /** Blue atmosphere glow behind the avatar. Default false. */
  withGlow?: boolean;
  priority?: boolean;
  sizes?: string;
};

/**
 * The Somae companion. Always renders the official brand asset —
 * expressions fall back to the primary avatar until their images exist.
 * Motion is transform-only and layered (float → breathe → tilt) so it
 * never distorts the character.
 */
export function Avatar({
  expression = 'default',
  className,
  idle = true,
  withShadow = true,
  withGlow = false,
  priority = false,
  sizes = '(min-width: 1024px) 40vw, 70vw',
}: AvatarProps) {
  const [src, setSrc] = useState(AVATAR_SRC[expression]);

  useEffect(() => {
    setSrc(AVATAR_SRC[expression]);
  }, [expression]);

  return (
    <div className={cn('relative select-none', className)}>
      {withGlow && (
        <div
          aria-hidden
          className="absolute inset-[-18%] rounded-full bg-[radial-gradient(circle,rgb(8_194_255/0.22)_0%,transparent_65%)]"
        />
      )}
      {withShadow && (
        <div
          aria-hidden
          className="absolute bottom-[2%] left-1/2 h-[6.5%] w-[58%] -translate-x-1/2 rounded-[100%] bg-somae-ink/15 blur-[14px]"
        />
      )}
      <div className={cn('relative size-full', idle && 'animate-float')}>
        <div className={cn('size-full', idle && 'animate-breathe')}>
          <img
            src={src}
            srcSet={src === AVATAR_SRC.default ? AVATAR_SRC_SET : undefined}
            sizes={sizes}
            alt="Somae — your creative companion"
            draggable={false}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            onError={() => {
              if (src !== AVATAR_SRC.default) setSrc(AVATAR_SRC.default);
            }}
            className={cn(
              'size-full object-contain',
              idle && 'animate-tilt',
            )}
          />
        </div>
      </div>
    </div>
  );
}
