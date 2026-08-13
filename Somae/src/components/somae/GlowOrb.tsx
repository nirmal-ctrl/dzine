export type OrbEnergy = 'low' | 'medium' | 'high' | 'settling';

interface GlowOrbProps {
    energy: OrbEnergy;
}

/**
 * Somae's creative-engine orb — an original, Siri-inspired glowing orb.
 * Pure CSS: layered blurred gradients (deep blue core, cyan illumination,
 * violet highlights), a soft outer halo, and calm breathing / morphing /
 * internal light movement. `energy` drives how active the animation feels.
 */
export function GlowOrb({ energy }: GlowOrbProps) {
    return (
        <div className="orb-wrap" data-energy={energy} aria-hidden>
            <div className="orb-halo" />
            <div className="orb">
                <div className="orb-core" />
            </div>
        </div>
    );
}
