# Mohan Venkateshkumar — Portfolio

Cinematic dark portfolio built with React, Vite, Tailwind CSS v4 and GSAP.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Structure

```
src/
  components/
    WelcomeIntro.jsx        welcome text + cinematic shutter only — no video
    LiquidGlassCluster.jsx  supplied WebGL glass component (converted to JSX)
    Hero.jsx                header nav, hero (first.mp4 full-screen background),
                              about (mohan2 bg + glass), technologies
    Projects.jsx             projects (mohan1 background + stacked cards)
    Footer.jsx               last.mp4 full-screen scroll section, experience
                              (background + mohan3/mohan4 hover), education,
                              certifications, contact, footer bar
  pages/
    Home.jsx
  assets/                   first.mp4, last.mp4, mohan1–4.png, background.png, resume PDF
  lib/
    gsap.js                 gsap + ScrollTrigger setup
    utils.js
```

## Page flow

```
Black screen → "Welcome to my world" → shutter opens → main page
Hero (first.mp4 full-screen background, content on top, scrollable immediately)
About Me (mohan2 cinematic background + LiquidGlassCluster)
Technologies
Projects (mohan1 background + stacked cards)
last.mp4 full-screen section (plays only once scrolled into view)
Experience (background.png, mohan3, hover/tap reveals mohan4)
Education
Certifications
Contact
Footer
```

`first.mp4` is a pure Hero background: it starts playing as soon as the Hero
mounts and never blocks navigation — the visitor can scroll immediately.
`last.mp4` never autoplays on load; an `IntersectionObserver` in `Footer.jsx`
starts it only once its section is ~60% in view, with a manual "Play" button as
a fallback if the browser blocks autoplay.

## Notes on a couple of deliberate deviations

- **Section order vs. the original file list.** The original brief's file list
  only allowed `Hero.jsx` and `Projects.jsx` as section containers, but the
  correct page order needs Experience/Education/Certifications/Contact to come
  *after* Projects and the second video. To get the order right without adding
  forbidden files (`Experience.jsx`, `Education.jsx`, etc.), those sections —
  plus the `last.mp4` section — live inside `Footer.jsx`, matching the explicit
  "Footer.jsx: second video section, experience, education, certifications,
  contact, footer" responsibility list from the latest instructions.
- **Stacked project cards.** `@unlumen-ui/stacked-feature-cards` isn't reachable
  from this environment (the shadcn registry needs a private API key), so the
  stacked, scroll-revealing card effect for the five projects is a hand-built
  GSAP ScrollTrigger implementation living inside `Projects.jsx` rather than an
  installed package. Visually and behaviorally it matches the brief (cards
  stack, scale down, and dim as the next one scrolls over).

## What's real vs. placeholder

Project card visuals are abstract HTML/CSS mockups (not screenshots), as specified.
All bios, dates, employers, education and certifications are taken verbatim from
the resume/brief — nothing was invented.
