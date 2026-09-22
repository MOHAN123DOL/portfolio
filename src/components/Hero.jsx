import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/gsap.js";
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

/* Each tech gets its own aurora colors + a subtle accent tint */
const TECHNOLOGIES = [
  { name: "Python",        from: "rgba(255, 212, 59, 0.95)",  to: "rgba(48, 105, 152, 0.6)" },
  { name: "Django",        from: "rgba(9, 146, 104, 0.95)",   to: "rgba(20, 80, 60, 0.55)" },
  { name: "DRF",           from: "rgba(162, 0, 0, 0.95)",     to: "rgba(120, 20, 20, 0.55)" },
  { name: "FastAPI",       from: "rgba(5, 208, 158, 0.95)",   to: "rgba(10, 90, 70, 0.55)" },
  { name: "PostgreSQL",    from: "rgba(51, 103, 145, 0.95)",  to: "rgba(20, 50, 90, 0.55)" },
  { name: "MySQL",         from: "rgba(0, 117, 143, 0.95)",   to: "rgba(10, 60, 80, 0.55)" },
  { name: "Redis",         from: "rgba(220, 56, 45, 0.95)",   to: "rgba(120, 25, 20, 0.55)" },
  { name: "Celery",        from: "rgba(55, 140, 80, 0.95)",   to: "rgba(25, 70, 45, 0.55)" },
  { name: "JWT",           from: "rgba(214, 60, 140, 0.95)",  to: "rgba(120, 25, 80, 0.55)" },
  { name: "WebSockets",    from: "rgba(140, 90, 255, 0.95)",  to: "rgba(60, 30, 140, 0.55)" },
  { name: "React",         from: "rgba(97, 218, 251, 0.95)",  to: "rgba(30, 90, 130, 0.55)" },
  { name: "JavaScript",    from: "rgba(247, 223, 30, 0.95)",  to: "rgba(140, 120, 15, 0.55)" },
  { name: "SQL",           from: "rgba(120, 180, 220, 0.95)", to: "rgba(40, 80, 120, 0.55)" },
  { name: "Streamlit",     from: "rgba(255, 75, 75, 0.95)",   to: "rgba(140, 30, 60, 0.55)" },
  { name: "Power BI",      from: "rgba(242, 200, 17, 0.95)",  to: "rgba(160, 100, 10, 0.55)" },
  { name: "Tableau",       from: "rgba(230, 100, 30, 0.95)",  to: "rgba(120, 50, 15, 0.55)" },
  { name: "Git",           from: "rgba(240, 80, 50, 0.95)",   to: "rgba(120, 30, 20, 0.55)" },
  { name: "Docker",        from: "rgba(36, 150, 237, 0.95)",  to: "rgba(15, 70, 130, 0.55)" },
  { name: "Linux",         from: "rgba(255, 200, 90, 0.95)",  to: "rgba(120, 80, 20, 0.55)" },
  { name: "REST API",      from: "rgba(140, 200, 255, 0.95)", to: "rgba(50, 90, 140, 0.55)" },
  { name: "System Design", from: "rgba(180, 150, 255, 0.95)", to: "rgba(70, 50, 130, 0.55)" },
];

/* ------------------------------------------------------------------ */
/*  GlassNav — floating glass nav, desktop pill + mobile hamburger     */
/* ------------------------------------------------------------------ */
function GlassNav() {
  const [activeSection, setActiveSection] = useState("home");
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -24, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.2 },
    );
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean,
    );
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const handleLinkClick = (id) => {
    setActiveSection(id);
    setOpen(false);
  };

  const activeIndex = Math.max(
    0,
    NAV_LINKS.findIndex((l) => l.id === activeSection),
  );

  return (
    <div
      ref={navRef}
      className="glass-nav fixed inset-x-0 top-4 z-50 flex justify-center px-4 pointer-events-none sm:top-6"
    >
      {/* Desktop pill */}
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
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
        </div>
      </div>

      {/* Mobile bar */}
      <div className="glass-mobile-wrapper pointer-events-auto sm:hidden">
        <div className="glass-mobile-bar">
          <a
            href="#home"
            onClick={() => handleLinkClick("home")}
            className="glass-mobile-logo"
          >
            MOHAN
          </a>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            className="glass-mobile-toggle"
          >
            <span
              className={
                "glass-mobile-line" + (open ? " glass-mobile-line--1" : "")
              }
            />
            <span
              className={
                "glass-mobile-line" + (open ? " glass-mobile-line--2" : "")
              }
            />
            <span
              className={
                "glass-mobile-line" + (open ? " glass-mobile-line--3" : "")
              }
            />
          </button>
        </div>

        <div
          className={
            "glass-mobile-dropdown" +
            (open ? " glass-mobile-dropdown--open" : "")
          }
        >
          <div className="glass-mobile-dropdown-inner">
            <nav className="glass-mobile-nav">
              {NAV_LINKS.map((link) => {
                const isActive = link.id === activeSection;
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => handleLinkClick(link.id)}
                    className={
                      "glass-mobile-link" +
                      (isActive ? " glass-mobile-link--active" : "")
                    }
                  >
                    <span className="glass-mobile-link-dot" />
                    {link.label}
                  </a>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        {
          opacity: 0,
          y: reduced ? 0 : 26,
          filter: reduced ? "none" : "blur(6px)",
        },
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1,
          ease: "power3.out",
          stagger: 0.12,
          delay: 0.3,
        },
      );
    }, sectionRef);

    const v = videoRef.current;
    if (v) v.play().catch(() => {});

    return () => ctx.revert();
  }, []);

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
        style={{ objectPosition: "center 20%" }}
      />
      <div className="absolute inset-0 bg-ink/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-ink/40" />
      <div className="vignette absolute inset-0" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="max-w-2xl">
          <p className="hero-reveal mb-6 text-[11px] tracking-label text-accent uppercase">
            Backend Engineering &middot; Python &middot; Django
          </p>
          <h1 className="hero-reveal text-balance font-serif-display text-5xl leading-[1.05] text-frost sm:text-6xl lg:text-7xl">
            Mohan
            <br />
            Venkateshkumar
          </h1>
          <p className="hero-reveal mt-6 text-sm tracking-label text-mist uppercase">
            Python Developer &nbsp;&middot;&nbsp; Backend Developer
          </p>
          <p className="hero-reveal mt-6 max-w-md text-base leading-relaxed text-mist">
            I build reliable backend systems, REST APIs and business
            applications using Python, Django and Django REST Framework.
          </p>

          <div className="hero-reveal mt-9 flex flex-wrap items-center gap-4">
            <a
              href={resumeFile}
              download="Mohan_Venkateshkumar_Resume.pdf"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-frost px-6 py-3 text-[11px] font-medium tracking-label text-ink uppercase transition hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              Download Resume
            </a>
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-[11px] tracking-label text-frost uppercase transition hover:border-white/40"
            >
              View Projects
            </a>
          </div>

          <ul className="hero-reveal mt-12 flex flex-wrap gap-x-6 gap-y-2">
            {HERO_STACK.map((t) => (
              <li key={t} className="text-[11px] tracking-label text-mist/80">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        bgRef.current,
        { opacity: 0, scale: 1.05 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );
      gsap.fromTo(
        ".about-reveal",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: "top 65%" },
        },
      );

      if (!reduced) {
        const onMove = (e) => {
          const r = sectionRef.current.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - 0.5) * 10;
          const y = ((e.clientY - r.top) / r.height - 0.5) * 8;
          gsap.to(bgRef.current, { x, y, duration: 1, ease: "power2.out" });
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
        style={{ backgroundImage: `url(${mohan2})`, scale: 1.05 }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/60" />
      <div className="vignette absolute inset-0" />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-6 py-24 md:grid-cols-2 md:px-10">
        <div>
          <p className="about-reveal mb-4 text-[11px] tracking-label text-accent uppercase">
            About Me
          </p>
          <h2 className="about-reveal font-serif-display text-3xl text-frost sm:text-4xl">
            A backend engineer, at heart.
          </h2>
          <p className="about-reveal mt-6 max-w-lg text-base leading-relaxed text-mist">
            I'm a Python and Backend Developer focused on building reliable
            APIs, backend systems, and business applications using Django and
            Django REST Framework. I enjoy turning complex business workflows
            into clean, scalable software and working across authentication,
            databases, real-time systems, caching, and modern web applications.
          </p>
        </div>

        <div className="about-reveal flex justify-center md:justify-end">
          <div className="h-[280px] w-[280px] sm:h-[340px] sm:w-[340px]" />
        </div>
      </div>
    </section>
  );
}
function TechnologiesSection() {
  const sectionRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      // Fade the wrapper in. `once: true` makes it run one time only.
      // `start: "top 95%"` fires as soon as the section peeks in.
      gsap.fromTo(
        bgRef.current,
        { opacity: 0, scale: 1.08 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 95%",
            once: true,
          },
        },
      );

      gsap.fromTo(
        ".tech-card",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.03,
          scrollTrigger: { trigger: sectionRef.current, start: "top 85%" },
        },
      );

      if (!reduced && bgRef.current) {
        const onMove = (e) => {
          const r = sectionRef.current.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width - 0.5) * 14;
          const y = ((e.clientY - r.top) / r.height - 0.5) * 10;
          gsap.to(bgRef.current, { x, y, duration: 1.2, ease: "power2.out" });
        };
        const el = sectionRef.current;
        el.addEventListener("pointermove", onMove);
        return () => el.removeEventListener("pointermove", onMove);
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-ink py-20"
    >
      {/* GSAP wrapper — only opacity / scale / x / y, NO background here */}
      <div ref={bgRef} className="absolute inset-0" aria-hidden="true">
        {/* Image lives on this child — GSAP never touches it */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${mohan5}")` }}
        />
      </div>

      {/* Overlays — light enough that the image stays visible */}
      <div className="absolute inset-0 bg-ink/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-ink via-transparent to-ink" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/80 via-transparent to-ink/80" />
      <div className="vignette absolute inset-0" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <p className="mb-3 text-xs tracking-label text-accent uppercase sm:text-sm">
          Technologies
        </p>
        <h2 className="font-serif-display text-3xl text-frost sm:text-4xl md:text-5xl">
          What I build with.
        </h2>

        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 sm:gap-3.5 md:grid-cols-6 lg:grid-cols-7">
          {TECHNOLOGIES.map((tech, i) => (
            <div
              key={tech.name}
              className="tech-card group relative aspect-square w-full overflow-hidden rounded-xl transition-transform duration-500 hover:-translate-y-1"
              style={{
                "--aurora-delay": `${(i % 7) * 0.35}s`,
                "--aurora-from": tech.from,
                "--aurora-to": tech.to,
              }}
            >
              <div className="tech-aurora" aria-hidden="true" />
              <div className="tech-inner" aria-hidden="true" />

              <div className="relative z-10 flex h-full w-full items-center justify-center px-2">
                <span className="text-center text-[11px] font-semibold tracking-[0.12em] text-frost uppercase leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.7)] transition group-hover:text-white sm:text-xs md:text-[13px]">
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

export default function Hero() {
  return (
    <>
      <GlassNav />
      <HeroSection />
      <AboutSection />
      <TechnologiesSection />
    </>
  );
}