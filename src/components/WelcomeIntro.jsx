import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function WelcomeIntro({ onFinish }) {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const subRef = useRef(null);
  const leftPanelRef = useRef(null);
  const rightPanelRef = useRef(null);
  const skipRef = useRef(null);
  const finished = useRef(false);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    const tl = gsap.timeline({
      onComplete: () => onFinish?.(),
    });
    tl.to(rootRef.current, {
      opacity: 0,
      duration: reduced ? 0.2 : 0.5,
      ease: "power2.out",
    });
  };

  useEffect(() => {
    if (reduced) {
      // Minimal path: brief fade, straight to the main page.
      const t = setTimeout(finish, 700);
      return () => clearTimeout(t);
    }

    const tl = gsap.timeline({ delay: 0.15 });

    tl.set(titleRef.current, { opacity: 0, scale: 1.08, filter: "blur(18px)" })
      .set(subRef.current, { opacity: 0, y: 12 })
      .to(titleRef.current, {
        opacity: 1,
        scale: 1,
        filter: "blur(0px)",
        duration: 1.4,
        ease: "power3.out",
      })
      .to(subRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "power2.out" }, "-=0.6")
      .to({}, { duration: 1.1 }) // hold
      .to([titleRef.current, subRef.current], {
        opacity: 0,
        y: -14,
        filter: "blur(6px)",
        duration: 0.55,
        ease: "power2.in",
      })
      .to(
        leftPanelRef.current,
        { xPercent: -100, duration: 0.85, ease: "power3.inOut" },
        "shutter"
      )
      .to(
        rightPanelRef.current,
        { xPercent: 100, duration: 0.85, ease: "power3.inOut" },
        "shutter"
      )
      .add(finish, "shutter+=0.5");

    return () => tl.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    gsap.set(skipRef.current, { opacity: 0 });
    gsap.to(skipRef.current, { opacity: 1, duration: 0.8, delay: 0.6 });
  }, []);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
      aria-hidden={finished.current}
    >
      {/* Shutter panels — solid, cover the screen at rest, then slide apart */}
      <div
        ref={leftPanelRef}
        className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-ink via-charcoal to-charcoal"
      />
      <div
        ref={rightPanelRef}
        className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-ink via-charcoal to-charcoal"
      />

      {/* Welcome text, sits above panels */}
      <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-6 text-center">
        <p ref={subRef} className="mb-4 text-[11px] tracking-label text-mist uppercase">
          Mohan Venkateshkumar
        </p>
        <h1
          ref={titleRef}
          className="font-serif-display text-4xl text-frost sm:text-6xl md:text-7xl"
        >
          Welcome to my world
        </h1>
      </div>

      <button
        ref={skipRef}
        onClick={finish}
        className="absolute bottom-8 right-8 z-20 rounded-full border border-white/15 px-5 py-2 text-[11px] tracking-label text-mist uppercase transition hover:border-white/40 hover:text-frost focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        Skip Intro
      </button>
    </div>
  );
}
