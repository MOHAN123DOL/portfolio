import { useEffect, useRef, useState } from "react";
import {
  gsap,
  ScrollTrigger,
  prefersReducedMotion,
  reveal,
  revealBatch,
} from "../lib/gsap.js";

import mohan2 from "../assets/mohan2.png";
import firstVideo from "../assets/first.mp4";
import resumeFile from "../assets/Mohan_Venkateshkumar_Resume.pdf";
import mohan5 from "../assets/mohan5.png";

const NAV_LINKS = [
  { label: "Home", href: "#home", id: "home" },
  { label: "About", href: "#about", id: "about" },
  { label: "Projects", href: "#projects", id: "projects" },
  { label: "Experience", href: "#experience", id: "experience" },
  { label: "Contact", href: "#contact", id: "contact" },
];

const HERO_STACK = ["PYTHON", "DJANGO", "DRF", "POSTGRESQL", "REDIS", "REACT"];

/* =========================================================
   TECHNOLOGIES
========================================================= */

const TECHNOLOGIES = [
  {
    name: "Python",
    from: "rgba(255, 212, 59, 0.95)",
    to: "rgba(48, 105, 152, 0.6)",
  },
  {
    name: "Django",
    from: "rgba(9, 146, 104, 0.95)",
    to: "rgba(20, 80, 60, 0.55)",
  },
  {
    name: "DRF",
    from: "rgba(162, 0, 0, 0.95)",
    to: "rgba(120, 20, 20, 0.55)",
  },
  {
    name: "FastAPI",
    from: "rgba(5, 208, 158, 0.95)",
    to: "rgba(10, 90, 70, 0.55)",
  },
  {
    name: "PostgreSQL",
    from: "rgba(51, 103, 145, 0.95)",
    to: "rgba(20, 50, 90, 0.55)",
  },
  {
    name: "MySQL",
    from: "rgba(0, 117, 143, 0.95)",
    to: "rgba(10, 60, 80, 0.55)",
  },
  {
    name: "Redis",
    from: "rgba(220, 56, 45, 0.95)",
    to: "rgba(120, 25, 20, 0.55)",
  },
  {
    name: "Celery",
    from: "rgba(55, 140, 80, 0.95)",
    to: "rgba(25, 70, 45, 0.55)",
  },
  {
    name: "JWT",
    from: "rgba(214, 60, 140, 0.95)",
    to: "rgba(120, 25, 80, 0.55)",
  },
  {
    name: "WebSockets",
    from: "rgba(140, 90, 255, 0.95)",
    to: "rgba(60, 30, 140, 0.55)",
  },
  {
    name: "React",
    from: "rgba(97, 218, 251, 0.95)",
    to: "rgba(30, 90, 130, 0.55)",
  },
  {
    name: "JavaScript",
    from: "rgba(247, 223, 30, 0.95)",
    to: "rgba(140, 120, 15, 0.55)",
  },
  {
    name: "SQL",
    from: "rgba(120, 180, 220, 0.95)",
    to: "rgba(40, 80, 120, 0.55)",
  },
  {
    name: "Streamlit",
    from: "rgba(255, 75, 75, 0.95)",
    to: "rgba(140, 30, 60, 0.55)",
  },
  {
    name: "Power BI",
    from: "rgba(242, 200, 17, 0.95)",
    to: "rgba(160, 100, 10, 0.55)",
  },
  {
    name: "Tableau",
    from: "rgba(230, 100, 30, 0.95)",
    to: "rgba(120, 50, 15, 0.55)",
  },
  {
    name: "Git",
    from: "rgba(240, 80, 50, 0.95)",
    to: "rgba(120, 30, 20, 0.55)",
  },
  {
    name: "Docker",
    from: "rgba(36, 150, 237, 0.95)",
    to: "rgba(15, 70, 130, 0.55)",
  },
  {
    name: "Linux",
    from: "rgba(255, 200, 90, 0.95)",
    to: "rgba(120, 80, 20, 0.55)",
  },
  {
    name: "REST API",
    from: "rgba(140, 200, 255, 0.95)",
    to: "rgba(50, 90, 140, 0.55)",
  },
  {
    name: "System Design",
    from: "rgba(180, 150, 255, 0.95)",
    to: "rgba(70, 50, 130, 0.55)",
  },
];

/* =========================================================
   GLASS NAV
========================================================= */

const MOBILE_NAV_ICONS = {
  home: {
    viewBox: "0 0 21 20",
    d: "M18.9999 6.01002L12.4499 0.770018C11.1699 -0.249982 9.16988 -0.259982 7.89988 0.760018L1.34988 6.01002C0.409885 6.76002 -0.160115 8.26002 0.0398848 9.44002L1.29988 16.98C1.58988 18.67 3.15988 20 4.86988 20H15.4699C17.1599 20 18.7599 18.64 19.0499 16.97L20.3099 9.43002C20.4899 8.26002 19.9199 6.76002 18.9999 6.01002ZM10.9199 16C10.9199 16.41 10.5799 16.75 10.1699 16.75C9.75988 16.75 9.41988 16.41 9.41988 16V13C9.41988 12.59 9.75988 12.25 10.1699 12.25C10.5799 12.25 10.9199 12.59 10.9199 13V16Z",
  },
  about: {
    viewBox: "0 0 24 24",
    d: "M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v1.2c0 .5.4.8.8.8h14.4c.5 0 .8-.3.8-.8V19c0-2.8-3.6-5-8-5Z",
  },
  projects: {
    viewBox: "0 0 24 24",
    d: "M4 3h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm10 0h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM4 13h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Zm10 0h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Z",
  },
  experience: {
    viewBox: "0 0 24 24",
    d: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm.9 5.5v4.2l3 1.8a.9.9 0 0 1-.9 1.6l-3.4-2a1 1 0 0 1-.5-.9V7.5a.9.9 0 0 1 1.8 0Z",
  },
  contact: {
    viewBox: "0 0 24 24",
    d: "M5 4h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Zm-.2 3.1 7.2 5.3 7.2-5.3-1-1.4L12 9.9 5.8 5.7Z",
  },
};

function GlassNav() {
  const [activeSection, setActiveSection] = useState("home");

  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      {
        y: -24,
        opacity: 0,
      },
      {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      },
    );
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.id),
    ).filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-40% 0px -55% 0px",
        threshold: 0,
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const handleLinkClick = (id) => {
    setActiveSection(id);
  };

  const activeIndex = Math.max(
    0,
    NAV_LINKS.findIndex((link) => link.id === activeSection),
  );

  return (
    <>
      <div
        ref={navRef}
        className="glass-nav fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none sm:top-6"
      >
        {/* =====================================================
            DESKTOP NAV
        ===================================================== */}

        <div className="glass-tabs-wrapper hidden pointer-events-auto sm:inline-flex">
          <div className="tabs" role="tablist">
            {NAV_LINKS.map((link) => {
              const isActive = link.id === activeSection;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveSection(link.id)}
                  className={"tab" + (isActive ? " tab--active" : "")}
                >
                  {link.label}
                </a>
              );
            })}

            <span
              className="glider"
              style={{
                left: `${activeIndex * 20}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE UIVERSE-STYLE BOTTOM NAV
          Sibling of .glass-nav on purpose: the GSAP transform on
          .glass-nav would otherwise break position: fixed.
      ===================================================== */}

      <nav
        className="mobile-uiverse-nav sm:hidden"
        aria-label="Mobile navigation"
      >
        <div
          className="mobile-uiverse-nav-inner"
          style={{ "--mobile-nav-index": activeIndex }}
        >
          <span className="mobile-uiverse-nav-glider" aria-hidden="true" />

          {NAV_LINKS.map((link) => {
            const isActive = link.id === activeSection;
            const icon = MOBILE_NAV_ICONS[link.id];

            return (
              <a
                key={link.href}
                href={link.href}
                onClick={() => handleLinkClick(link.id)}
                aria-current={isActive ? "location" : undefined}
                className={
                  "mobile-uiverse-nav-item" +
                  (isActive ? " mobile-uiverse-nav-item-active" : "")
                }
              >
                <span className="mobile-uiverse-nav-icon" aria-hidden="true">
                  {icon && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox={icon.viewBox}
                      focusable="false"
                    >
                      <path fillRule="evenodd" d={icon.d} />
                    </svg>
                  )}
                </span>

                <span className="mobile-uiverse-nav-label">{link.label}</span>
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}

/* =========================================================
   HERO
========================================================= */

function HeroSection({ showWelcome }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [welcomeState, setWelcomeState] = useState("hidden");
  const welcomeShownRef = useRef(false);
  const welcomeExitTimerRef = useRef(null);
  const welcomeRemoveTimerRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const section = sectionRef.current;
    if (!section) return undefined;

    const ctx = gsap.context(() => {
      /* Hero eyebrow — from left */
      const eyebrow = reveal(".hero-eyebrow", {
        direction: "left",
        distance: reduced ? 0 : 60,
        blur: reduced ? 0 : 8,
        scale: 1,
        duration: reduced ? 0.3 : 1.1,
        delay: 0.35,
        cinematic: true,
      });

      /* Hero title — cinematic from bottom with depth */
      const title = reveal(".hero-title", {
        direction: "bottom",
        distance: reduced ? 0 : 120,
        blur: reduced ? 0 : 14,
        scale: reduced ? 1 : 0.92,
        duration: reduced ? 0.3 : 1.4,
        delay: 0.5,
        cinematic: true,
      });

      /* Hero subtitle — from right */
      const subtitle = reveal(".hero-subtitle", {
        direction: "right",
        distance: reduced ? 0 : 70,
        blur: reduced ? 0 : 8,
        duration: reduced ? 0.3 : 1.05,
        delay: 0.7,
      });

      /* Hero description — soft from bottom */
      const desc = reveal(".hero-desc", {
        direction: "bottom",
        distance: reduced ? 0 : 60,
        blur: reduced ? 0 : 6,
        scale: 0.99,
        duration: reduced ? 0.3 : 1,
        delay: 0.85,
      });

      /* Hero buttons — staggered from bottom */
      const cta = reveal(".hero-cta", {
        direction: "bottom",
        distance: reduced ? 0 : 50,
        blur: reduced ? 0 : 4,
        duration: reduced ? 0.3 : 0.9,
        stagger: 0.12,
        delay: 1,
      });

      /* Hero tech stack — from bottom, staggered */
      const stack = reveal(".hero-stack li", {
        direction: "bottom",
        distance: reduced ? 0 : 40,
        blur: reduced ? 0 : 4,
        duration: reduced ? 0.3 : 0.8,
        stagger: 0.06,
        delay: 1.15,
      });

      /*
        After EVERY hero reveal completes, normalize the elements
        so no residual inline transform / filter / opacity remains.

        clearProps removes the inline styles entirely — no
        lingering translate(0,0) scale(1) left behind for the
        browser to re-rasterize when Spider-Man forces a layout
        read via getBoundingClientRect() during rope sync.
      */
      const HERO_TARGETS = [
        ".hero-eyebrow",
        ".hero-title",
        ".hero-subtitle",
        ".hero-desc",
        ".hero-cta",
        ".hero-stack li",
      ];

      const normalize = () => {
        gsap.set(HERO_TARGETS, {
          clearProps:
            "transform,translate,x,y,scale,rotate,filter,opacity,willChange",
        });
      };

      const timelines = [eyebrow, title, subtitle, desc, cta, stack].filter(
        Boolean,
      );

      if (timelines.length === 0) {
        normalize();
        return;
      }

      /* Single completion counter so normalize() runs exactly once. */
      let remaining = timelines.length;
      const onDone = () => {
        remaining -= 1;
        if (remaining === 0) normalize();
      };

      timelines.forEach((tween) => {
        if (typeof tween.then === "function") {
          /* GSAP 3 tweens are thenable */
          tween.then(onDone);
        } else if (tween.eventCallback) {
          const existing = tween.eventCallback("onComplete");
          tween.eventCallback("onComplete", () => {
            if (existing) existing();
            onDone();
          });
        } else {
          onDone();
        }
      });
    }, sectionRef);

    const video = videoRef.current;

    if (video) {
      video.play().catch(() => {});
    }

    return () => {
      ctx.kill();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!showWelcome || !section || welcomeShownRef.current) return undefined;

    const showMessage = () => {
      if (welcomeShownRef.current) return;

      welcomeShownRef.current = true;
      setWelcomeState("visible");

      welcomeExitTimerRef.current = window.setTimeout(() => {
        setWelcomeState("leaving");
        welcomeRemoveTimerRef.current = window.setTimeout(() => {
          setWelcomeState("hidden");
        }, 280);
      }, 2000);
    };

    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(showMessage);
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        observer.disconnect();
        showMessage();
      },
      { threshold: 0.2 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [showWelcome]);

  useEffect(
    () => () => {
      if (welcomeExitTimerRef.current != null) {
        clearTimeout(welcomeExitTimerRef.current);
      }
      if (welcomeRemoveTimerRef.current != null) {
        clearTimeout(welcomeRemoveTimerRef.current);
      }
    },
    [],
  );

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden bg-ink pt-36 pb-16 sm:pt-28"
    >
      <video
        ref={videoRef}
        src={firstVideo}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        style={{
          objectPosition: "center 20%",
        }}
      />

      <div className="absolute inset-0 bg-ink/55" />

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />

      <div className="vignette absolute inset-0" />

      {welcomeState !== "hidden" && (
        <div
          className={`portfolio-welcome fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8 ${
            welcomeState === "leaving" ? "portfolio-welcome--leaving" : ""
          }`}
          aria-live="polite"
        >
          Welcome to my portfolio
        </div>
      )}

      {/* =====================================================
        ROUNDED VISUAL — LEFT CORNER OF HERO
        position: absolute so it does NOT affect document flow
        or the Hero text layout in any way.
    ===================================================== */}
      <div
        className="
        hero-visual
        pointer-events-none
        fixed
        left-0
        top-1/2
        -translate-y-1/2
        z-[5]

        w-[320px] h-[320px]

        sm:left-0 sm:w-[420px] sm:h-[420px]
        lg:left-0 lg:w-[560px] lg:h-[560px]
        xl:left-0 xl:w-[640px] xl:h-[640px]

        max-w-none
      "
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="max-w-2xl">
          <p className="hero-eyebrow mb-6 text-[11px] tracking-label text-accent uppercase">
            Backend Engineering &middot; Python &middot; Django
          </p>

          <h1 className="hero-title text-balance font-serif-display text-5xl leading-[1.05] text-frost sm:text-6xl lg:text-7xl">
            Mohan
            <br />
            Venkateshkumar
          </h1>

          <p className="hero-subtitle mt-6 text-sm tracking-label text-mist uppercase">
            Python Developer &nbsp;&middot;&nbsp; Backend Developer
          </p>

          <p className="hero-desc mt-6 max-w-md text-base leading-relaxed text-mist">
            I build reliable backend systems, REST APIs and business
            applications using Python, Django and Django REST Framework.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a
              href={resumeFile}
              download="Mohan_Venkateshkumar_Resume.pdf"
              className="hero-cta inline-flex items-center justify-center gap-2 rounded-full bg-frost px-6 py-3 text-[11px] font-medium tracking-label text-ink uppercase transition hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Download Resume
            </a>

            <a
              href="#projects"
              className="hero-cta inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[11px] tracking-label text-frost uppercase transition hover:border-white/40"
            >
              View Projects
            </a>
          </div>

          <ul className="hero-stack mt-12 flex flex-wrap gap-x-6 gap-y-2">
            {HERO_STACK.map((tech) => (
              <li
                key={tech}
                className="text-[11px] tracking-label text-mist/80"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ABOUT
========================================================= */

function AboutSection() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      /* Background */

      gsap.fromTo(
        bgRef.current,
        {
          opacity: 0,
          scale: 1.08,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            once: true,
          },
        },
      );

      /* Content — directional cinematic reveal */

      if (!reduced) {
        /* Eyebrow from left */
        reveal(".about-eyebrow", {
          direction: "left",
          distance: 70,
          blur: 8,
          duration: 1.05,
          trigger: sectionRef.current,
          start: "top 78%",
          cinematic: true,
        });

        /* Title from bottom, cinematic */
        reveal(".about-title", {
          direction: "bottom",
          distance: 100,
          blur: 12,
          scale: 0.94,
          duration: 1.25,
          delay: 0.1,
          trigger: sectionRef.current,
          start: "top 78%",
          cinematic: true,
        });

        /* Paragraph from right */
        reveal(".about-text", {
          direction: "right",
          distance: 80,
          blur: 7,
          duration: 1.1,
          delay: 0.2,
          trigger: sectionRef.current,
          start: "top 78%",
        });

        /* Visual block from right with depth */
        reveal(".about-visual", {
          direction: "bottom-right",
          distance: 90,
          blur: 10,
          scale: 0.95,
          duration: 1.2,
          delay: 0.3,
          trigger: sectionRef.current,
          start: "top 78%",
          cinematic: true,
        });
      } else {
        gsap.set(".about-eyebrow, .about-title, .about-text, .about-visual", {
          opacity: 1,
          x: 0,
          y: 0,
          filter: "none",
        });
      }

      /* Background mouse movement */

      if (!reduced) {
        const onMove = (event) => {
          const rect = sectionRef.current.getBoundingClientRect();

          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 10;

          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 8;

          gsap.to(bgRef.current, {
            x,
            y,
            duration: 1,
            ease: "power2.out",
          });
        };

        sectionRef.current.addEventListener("pointermove", onMove);

        return () =>
          sectionRef.current?.removeEventListener("pointermove", onMove);
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="relative flex min-h-[90vh] items-center overflow-hidden bg-charcoal"
    >
      <div
        ref={bgRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${mohan2})`,
          scale: 1.05,
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />

      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />

      <div className="vignette absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-2 md:px-10">
        <div>
          <p className="about-eyebrow mb-4 text-[11px] tracking-label text-accent uppercase">
            About Me
          </p>

          <h2 className="about-title font-serif-display text-3xl text-frost sm:text-4xl">
            A backend engineer, at heart.
          </h2>

          <p className="about-text mt-6 max-w-lg text-base leading-relaxed text-mist">
            I'm a Python and Backend Developer focused on building reliable
            APIs, backend systems, and business applications using Django and
            Django REST Framework. I enjoy turning complex business workflows
            into clean, scalable software and working across authentication,
            databases, real-time systems, caching, and modern web applications.
          </p>
        </div>

        <div className="about-visual flex justify-center md:justify-end">
          <div className="h-[280px] w-[280px] sm:h-[340px] sm:w-[340px]" />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   TECHNOLOGIES
========================================================= */
function TechnologiesSection() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();

    const ctx = gsap.context(() => {
      /* =====================================================
         BACKGROUND REVEAL
      ===================================================== */

      gsap.fromTo(
        bgRef.current,
        {
          opacity: 0,
          scale: 1.08,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 90%",
            once: true,
          },
        },
      );

      /* =====================================================
         TECHNOLOGY EYEBROW
      ===================================================== */

      if (!reduced) {
        reveal(".tech-eyebrow", {
          direction: "left",
          distance: 60,
          blur: 7,
          duration: 1,
          trigger: sectionRef.current,
          start: "top 85%",
          cinematic: true,
        });

        /* ===================================================
           TECHNOLOGY TITLE
        =================================================== */

        reveal(".tech-title", {
          direction: "bottom",
          distance: 90,
          blur: 12,
          scale: 0.94,
          duration: 1.2,
          delay: 0.1,
          trigger: sectionRef.current,
          start: "top 85%",
          cinematic: true,
        });

        /* ===================================================
           TECHNOLOGY CIRCLES
        =================================================== */

        revealBatch(".tech-card", {
          stagger: 0.08,
          cinematic: true,
          autoDirection: false,
          direction: "bottom",
          distance: 65,
          blur: 8,
          scale: 0.88,
          duration: 0.95,
          trigger: sectionRef.current,
          start: "top 82%",
        });
      } else {
        gsap.set(".tech-eyebrow, .tech-title, .tech-card", {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: "none",
        });
      }

      /* =====================================================
         BACKGROUND PARALLAX
      ===================================================== */

      if (!reduced && bgRef.current) {
        const onMove = (event) => {
          const rect = sectionRef.current.getBoundingClientRect();

          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;

          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 10;

          gsap.to(bgRef.current, {
            x,
            y,
            duration: 1.2,
            ease: "power2.out",
            overwrite: "auto",
          });
        };

        const element = sectionRef.current;

        element.addEventListener("pointermove", onMove);

        return () => {
          element.removeEventListener("pointermove", onMove);
        };
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="
        relative
        overflow-hidden
        bg-ink
        py-20
      "
    >
      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div ref={bgRef} className="absolute inset-0" aria-hidden="true">
        <div
          className="
            absolute
            inset-0
            bg-cover
            bg-center
          "
          style={{
            backgroundImage: `url("${mohan5}")`,
          }}
        />
      </div>

      {/* =====================================================
          OVERLAYS
      ===================================================== */}

      <div className="absolute inset-0 bg-ink/40" />

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-b
          from-ink
          via-transparent
          to-ink
        "
      />

      <div
        className="
          absolute
          inset-0
          bg-gradient-to-r
          from-ink/80
          via-transparent
          to-ink/80
        "
      />

      <div className="vignette absolute inset-0" />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div
        className="
          relative
          z-10
          mx-auto
          max-w-7xl
          px-6
          md:px-10
        "
      >
        {/* ===================================================
            HEADING
        =================================================== */}

        <p
          className="
            tech-eyebrow
            mb-3
            text-xs
            tracking-label
            text-accent
            uppercase
            sm:text-sm
          "
        >
          Technologies
        </p>

        <h2
          className="
            tech-title
            font-serif-display
            text-3xl
            text-frost
            sm:text-4xl
            md:text-5xl
          "
        >
          What I build with.
        </h2>

        {/* ===================================================
            TECHNOLOGY GRID
        =================================================== */}

        <div
          className="
            mt-10
            grid
            w-full
            grid-cols-3
            gap-x-7
            gap-y-9

            sm:grid-cols-4
            sm:gap-x-9
            sm:gap-y-10

            md:grid-cols-5
            md:gap-x-10
            md:gap-y-11

            lg:grid-cols-6
            lg:gap-x-12
            lg:gap-y-12
          "
        >
          {TECHNOLOGIES.map((tech, index) => (
            <div
              key={tech.name}
              className="
                tech-card
                group
                relative
                mx-auto
                aspect-square
                w-full
                max-w-[100px]
                overflow-hidden
                rounded-full
                transition-all
                duration-500
                hover:-translate-y-2
                hover:scale-105
              "
              style={{
                "--aurora-delay": `${(index % 7) * 0.35}s`,

                "--aurora-from": tech.from,

                "--aurora-to": tech.to,
              }}
            >
              {/* =================================================
                  AURORA
              ================================================= */}

              <div
                className="
                  tech-aurora
                  absolute
                  inset-0
                  rounded-full
                "
                aria-hidden="true"
              />

              {/* =================================================
                  GLASS INNER
              ================================================= */}

              <div
                className="
                  tech-inner
                  absolute
                  inset-0
                  rounded-full
                "
                aria-hidden="true"
              />

              {/* =================================================
                  TECHNOLOGY NAME
              ================================================= */}

              <div
                className="
                  relative
                  z-10
                  flex
                  h-full
                  w-full
                  items-center
                  justify-center
                  rounded-full
                  px-3
                  text-center
                "
              >
                <span
                  className="
                    text-[9px]
                    font-semibold
                    leading-tight
                    tracking-[0.12em]
                    text-frost
                    uppercase
                    drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)]
                    transition-all
                    duration-500
                    group-hover:text-white

                    sm:text-[10px]
                    md:text-[11px]
                  "
                >
                  {tech.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
/* =========================================================
   PAGE
========================================================= */

export default function Hero({ showWelcome = true }) {
  return (
    <>
      <GlassNav />

      <HeroSection showWelcome={showWelcome} />

      <AboutSection />

      <TechnologiesSection />
    </>
  );
}