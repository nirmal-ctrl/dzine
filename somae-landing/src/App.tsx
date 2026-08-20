import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/lib/gsapSetup';
import { setLenis } from '@/lib/scroll';
import { prefersReducedMotion } from '@/lib/motion';
import { AtmosphereBackground } from '@/components/AtmosphereBackground';
import { AvatarJourney } from '@/components/AvatarJourney';
import { Nav } from '@/components/Nav';
import { Hero } from '@/sections/Hero';
import { Problem } from '@/sections/Problem';
import { HowItWorks } from '@/sections/HowItWorks';
import { CreationDemo } from '@/sections/CreationDemo';
import { Templates } from '@/sections/Templates';
import { IdeaToVisual } from '@/sections/IdeaToVisual';
import { WhySomae } from '@/sections/WhySomae';
import { Quality } from '@/sections/Quality';
import { FinalCTA } from '@/sections/FinalCTA';
import { Footer } from '@/sections/Footer';

export default function App() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    // Buttery smooth scrolling, driven by GSAP's ticker so ScrollTrigger
    // and Lenis stay perfectly in sync.
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
    });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Re-measure once webfonts have settled.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <div className="relative">
      <AtmosphereBackground />
      <Nav />

      <main className="relative">
        <Hero />
        <Problem />
        <HowItWorks />
        <CreationDemo />
        <Templates />
        <IdeaToVisual />
        <WhySomae />
        <Quality />
        <FinalCTA />
      </main>

      <Footer />

      {/* The traveling companion — above content, below nav */}
      <AvatarJourney />
    </div>
  );
}
