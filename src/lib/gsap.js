import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isMobile = () =>
  typeof window !== "undefined" && window.innerWidth < 768;

/* Cinematic presets — tweak once, use everywhere */
const CINEMATIC = {
  distance: 120,
  scale: 0.93,
  blur: 14,
  rotation: 1.5,
  duration: 1.35,
  ease: "expo.out",
};

const SIMPLE = {
  distance: 60,
  scale: 0.97,
  blur: 6,
  rotation: 0,
  duration: 0.9,
  ease: "power4.out",
};

/* ------------------------------------------------------------------ */
/*  Direction map — makes fromTo start state easy                      */
/* ------------------------------------------------------------------ */

const getStartState = (direction, distance, rotation) => {
  const state = { x: 0, y: 0, rotate: 0 };

  switch (direction) {
    case "left":
      state.x = -distance;
      state.rotate = -rotation;
      break;
    case "right":
      state.x = distance;
      state.rotate = rotation;
      break;
    case "top":
      state.y = -distance;
      break;
    case "bottom":
    default:
      state.y = distance;
      break;
    case "top-left":
      state.x = -distance * 0.7;
      state.y = -distance * 0.7;
      state.rotate = -rotation;
      break;
    case "top-right":
      state.x = distance * 0.7;
      state.y = -distance * 0.7;
      state.rotate = rotation;
      break;
    case "bottom-left":
      state.x = -distance * 0.7;
      state.y = distance * 0.7;
      state.rotate = -rotation;
      break;
    case "bottom-right":
      state.x = distance * 0.7;
      state.y = distance * 0.7;
      state.rotate = rotation;
      break;
  }

  return state;
};

/* ------------------------------------------------------------------ */
/*  Main reveal                                                        */
/* ------------------------------------------------------------------ */

export const reveal = (
  element,
  {
    /* direction: left | right | top | bottom | top-left | top-right | bottom-left | bottom-right */
    direction = "bottom",

    /* movement distance */
    distance,

    /* look */
    scale,
    blur,
    rotation,

    /* timing */
    duration = 1,
    delay = 0,
    ease = "power4.out",
    stagger = 0,

    /* scroll */
    trigger = element,
    start = "top 85%",
    once = true,

    /* modes */
    cinematic = false,
  } = {}
) => {
  if (!element) return;

  const reduced = prefersReducedMotion();
  const mobile = isMobile();

  /* ---------- reduced motion ---------- */
  if (reduced) {
    return gsap.fromTo(
      element,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.3,
        delay,
        stagger,
        ease: "power2.out",
        scrollTrigger: { trigger, start, once },
        clearProps: "opacity",
      }
    );
  }

  /* ---------- resolve values ---------- */
  const base = cinematic ? CINEMATIC : SIMPLE;

  const finalDistance = distance ?? base.distance;
  const finalScale = scale ?? base.scale;
  const finalBlur = blur ?? base.blur;
  const finalRotation = rotation ?? base.rotation;

  /* mobile dampening */
  const distVal = mobile ? finalDistance * 0.55 : finalDistance;
  const blurVal = mobile ? finalBlur * 0.5 : finalBlur;
  const scaleVal = mobile ? 1 - (1 - finalScale) * 0.5 : finalScale;
  const rotVal = mobile ? finalRotation * 0.4 : finalRotation;

  /* direction start state */
  const startState = getStartState(direction, distVal, rotVal);

  /* ---------- animation ---------- */
  return gsap.fromTo(
    element,
    {
      opacity: 0,
      x: startState.x,
      y: startState.y,
      scale: scaleVal,
      rotate: startState.rotate,
      filter: `blur(${blurVal}px)`,
      transformOrigin: "50% 100%",
      willChange: "transform, opacity, filter",
    },
    {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      filter: "blur(0px)",
      duration,
      delay,
      ease,
      stagger,
      scrollTrigger: { trigger, start, once },
      /*
        Single normalization point: after this tween completes,
        remove every inline style it wrote so the element settles
        into its natural CSS position.

        `clearProps` also implies the same effect as an onComplete
        gsap.set(..., clearProps) — GSAP will strip the listed
        inline properties on completion. Keeping both here is
        harmless and makes intent explicit.

        This is what prevents the Hero (and About / Tech reveals)
        from holding a stale `translate(0,0) scale(1)` inline
        transform that a later layout read (e.g. Spider-Man's
        rope sync via getBoundingClientRect) could re-rasterize
        into a visible sub-pixel shift.
      */
      clearProps: "opacity,transform,filter,willChange,transformOrigin",
    }
  );
};

/* ------------------------------------------------------------------ */
/*  Backwards-compatible alias — same call signature as before         */
/* ------------------------------------------------------------------ */

export const revealFromBottom = (element, opts = {}) =>
  reveal(element, { ...opts, direction: "bottom" });

/* ------------------------------------------------------------------ */
/*  Optional: batch helper for grids / lists (auto-alternating sides)  */
/* ------------------------------------------------------------------ */

export const revealBatch = (
  selector,
  {
    stagger = 0.12,
    cinematic = false,
    autoDirection = false, // if true, alternates left/right for a cinematic feel
    ...rest
  } = {}
) => {
  const elements = gsap.utils.toArray(selector);
  if (!elements.length) return [];

  return elements.map((el, i) => {
    let direction = rest.direction;

    if (autoDirection) {
      const cycle = ["left", "bottom", "right", "top"];
      direction = cycle[i % cycle.length];
    }

    return reveal(el, {
      ...rest,
      direction,
      cinematic,
      delay: (rest.delay || 0) + i * stagger,
    });
  });
};