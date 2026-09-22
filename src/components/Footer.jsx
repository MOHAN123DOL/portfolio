import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/gsap.js";
import lastVideo from "../assets/last.mp4";
import background from "../assets/background.png";
import mohan3 from "../assets/mohan3.png";
import mohan4 from "../assets/mohan4.png";
import resumeFile from "../assets/Mohan_Venkateshkumar_Resume.pdf";
import "./Footer.css";

function SecondVideoSection() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !playing) {
          const v = videoRef.current;
          if (v) {
            v.play()
              .then(() => setPlaying(true))
              .catch(() => setBlocked(true));
          }
        }
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".video-overlay-text",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 60%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const manualPlay = () => {
    videoRef.current?.play().then(() => {
      setPlaying(true);
      setBlocked(false);
    });
  };

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-ink"
    >
      <video
        ref={videoRef}
        src={lastVideo}
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/45" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <h3 className="video-overlay-text font-serif-display text-3xl text-frost sm:text-4xl">
          Building systems.
          <br />
          Solving problems.
        </h3>
        {blocked && (
          <button
            onClick={manualPlay}
            className="video-overlay-text mt-6 rounded-full border border-white/30 px-6 py-2 text-[11px] tracking-label text-frost uppercase"
          >
            Play
          </button>
        )}
      </div>
    </section>
  );
}

function ExperienceSection() {
  const sectionRef = useRef(null);
  const portraitRef = useRef(null);
  const secondaryRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const [mobileReveal, setMobileReveal] = useState(false);
  const quickX = useRef(null);
  const quickY = useRef(null);
  const quickX2 = useRef(null);
  const quickY2 = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      quickX.current = gsap.quickTo(portraitRef.current, "x", {
        duration: 0.6,
        ease: "power3.out",
      });
      quickY.current = gsap.quickTo(portraitRef.current, "y", {
        duration: 0.6,
        ease: "power3.out",
      });
      quickX2.current = gsap.quickTo(secondaryRef.current, "x", {
        duration: 0.5,
        ease: "power2.out",
      });
      quickY2.current = gsap.quickTo(secondaryRef.current, "y", {
        duration: 0.5,
        ease: "power2.out",
      });

      gsap.fromTo(
        ".exp-reveal",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
        },
      );
    }, sectionRef);

    const io = new IntersectionObserver(
      ([entry]) => setMobileReveal(entry.isIntersecting),
      { threshold: 0.5 },
    );
    if (sectionRef.current) io.observe(sectionRef.current);

    return () => {
      ctx.revert();
      io.disconnect();
    };
  }, []);

  const onMove = (e) => {
    if (prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    quickX.current?.(px * 16);
    quickY.current?.(py * 12);
    quickX2.current?.(px * 26);
    quickY2.current?.(py * 20);
  };

  const showSecondary = hovered || mobileReveal;

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative overflow-hidden bg-ink py-28"
    >
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/70" />
        <div className="vignette absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:grid-cols-2 md:px-10">
        <div>
          <p className="exp-reveal mb-3 text-[11px] tracking-label text-accent uppercase">
            Experience
          </p>
          <h2 className="exp-reveal font-serif-display text-3xl text-frost sm:text-4xl">
            Stackly
          </h2>
          <p className="exp-reveal mt-1 text-sm tracking-label text-mist uppercase">
            Backend Developer &nbsp;&middot;&nbsp; Dec 2025 &ndash; Present
          </p>
          <ul className="exp-reveal mt-6 space-y-3 text-sm leading-relaxed text-mist">
            <li>
              Built and maintained backend APIs for a Job Portal &mdash; job
              listings, user management, role-based access, and application
              tracking workflows using Django REST Framework.
            </li>
            <li>
              Developed backend services for an E-Commerce platform &mdash;
              product catalogue, order management, cart functionality, and
              payment flow integration using Django.
            </li>
            <li>
              Implemented JWT-based authentication, WebSocket real-time chat via
              Django Channels &amp; Redis, and application-gated access control.
            </li>
          </ul>

          <div className="exp-reveal mt-10 border-t border-white/10 pt-6">
            <h3 className="font-serif-display text-xl text-frost">
              Sisco Energy Pvt. Limited, Tiruchirappalli
            </h3>
            <p className="mt-1 text-sm tracking-label text-mist uppercase">
              Production Engineer &nbsp;&middot;&nbsp; Mar 2023 &ndash; Dec 2025
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
              Managed end-to-end production execution for Siemens Energy AG
              projects, overseeing quality control, ERP-based scheduling,
              technical drawing reviews, and on-time dispatch planning.
            </p>
          </div>
        </div>

        <div
          className="exp-reveal relative flex justify-center md:justify-end"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={onMove}
        >
          <div className="relative w-full max-w-sm">
            <img
              ref={portraitRef}
              src={mohan3}
              alt="Mohan Venkateshkumar, backend developer portrait"
              className="relative z-10 w-full drop-shadow-[0_30px_70px_rgba(0,0,0,0.65)]"
              style={{ willChange: "transform" }}
            />

            <div
              ref={secondaryRef}
              className="absolute -bottom-2 -right-2 z-20 flex flex-col items-center transition-all duration-500 ease-out sm:-right-6"
              style={{
                opacity: showSecondary ? 1 : 0,
                transform: `scale(${showSecondary ? 1 : 0.85}) translate(${showSecondary ? "0px" : "10px"}, ${showSecondary ? "0px" : "10px"})`,
              }}
            >
              <div className="h-28 w-28 overflow-hidden rounded-full border border-white/25 bg-navy/60 shadow-[0_10px_40px_rgba(0,0,0,0.5)] backdrop-blur-sm sm:h-36 sm:w-36">
                <img
                  src={mohan4}
                  alt="Mohan Venkateshkumar in mechanical engineering site gear"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="mt-2 rounded-full bg-ink/70 px-3 py-1 text-center backdrop-blur-sm">
                <p className="text-[9px] tracking-label text-frost uppercase">
                  Mechanical Engineering
                </p>
                <p className="text-[8px] tracking-label text-mist uppercase">
                  Core Engineering
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const EDUCATION = [
  {
    degree: "B.E. Mechanical Engineering",
    school: "K. Ramakrishnan College of Technology",
    period: "2021 – 2024",
    result: "CGPA: 7.8",
  },
  {
    degree: "Diploma – Mechanical Engineering",
    school: "Seshasayee Institute of Technology",
    period: "2017 – 2020",
    result: "68%",
  },
  {
    degree: "SSLC",
    school: "Lions Matriculation School",
    period: "2017",
    result: "89%",
  },
];

const CERTIFICATIONS = [
  "Python — GUVI",
  "Autodesk Fusion 360 — LIFT India",
  "MEP Certification",
  "Internship on PPC",
];

function EducationSection() {
  const sectionRef = useRef(null);
  const pathRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reveal cards
      gsap.fromTo(
        ".edu-card",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      // Reveal nodes
      gsap.fromTo(
        ".edu-node",
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.5,
          ease: "back.out(2)",
          stagger: 0.15,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );

      // Animate the snake path drawing itself on scroll
      if (pathRef.current) {
        const length = pathRef.current.getTotalLength();
        gsap.set(pathRef.current, {
          strokeDasharray: length,
          strokeDashoffset: length,
        });
        gsap.to(pathRef.current, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            end: "bottom 60%",
            scrub: 1,
          },
        });
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative bg-charcoal py-24 overflow-hidden"
    >
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <p className="mb-3 text-[11px] tracking-label text-accent uppercase">
          Education
        </p>
        <h2 className="font-serif-display text-3xl text-frost sm:text-4xl">
          Foundations.
        </h2>

        <div className="edu-snake mt-16">
          {/* SVG snake path (behind everything) */}
          <svg
            className="edu-snake-svg"
            viewBox="0 0 400 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="snakeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e5b0" stopOpacity="1" />
                <stop offset="70%" stopColor="#00e5b0" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#00e5b0" stopOpacity="0.15" />
              </linearGradient>
            </defs>

            {/* Faint track (always visible) */}
            <path
              d="M 200 20
                 C 200 90, 60 120, 60 200
                 C 60 280, 340 300, 340 380
                 C 340 460, 60 480, 60 560
                 C 60 640, 340 660, 340 740
                 C 340 820, 200 860, 200 880"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Animated snake fill */}
            <path
              ref={pathRef}
              d="M 200 20
                 C 200 90, 60 120, 60 200
                 C 60 280, 340 300, 340 380
                 C 340 460, 60 480, 60 560
                 C 60 640, 340 660, 340 740
                 C 340 820, 200 860, 200 880"
              fill="none"
              stroke="url(#snakeGrad)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{
                filter:
                  "drop-shadow(0 0 6px rgba(0, 229, 176, 0.8)) drop-shadow(0 0 14px rgba(0, 229, 176, 0.4))",
              }}
            />
          </svg>

          {/* Education cards positioned along the snake */}
          {EDUCATION.map((e, i) => (
            <div
              key={e.degree}
              className={`edu-snake-row edu-snake-row-${i + 1}`}
            >
              <span className="edu-node" aria-hidden="true">
                <span className="edu-node-inner" />
              </span>

              <div className="edu-card">
                <div>
                  <h3 className="text-base font-medium text-frost">
                    {e.degree}
                  </h3>
                  <p className="mt-1 text-sm text-mist">{e.school}</p>
                </div>
                <div className="mt-3 flex items-center gap-3 sm:mt-0 sm:flex-col sm:items-end sm:gap-0 sm:text-right">
                  <p className="text-[11px] tracking-label text-mist uppercase">
                    {e.period}
                  </p>
                  <p className="text-sm text-accent-warm sm:mt-1">{e.result}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CertificationsSection() {
  const sectionRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cert-card",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-ink py-24">
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <p className="mb-3 text-[11px] tracking-label text-accent uppercase">
          Certifications
        </p>
        <h2 className="font-serif-display text-3xl text-frost sm:text-4xl">
          Continued learning.
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {CERTIFICATIONS.map((c) => (
            <div
              key={c}
              className="cert-card rounded-xl border border-white/8 bg-steel/30 px-6 py-4 text-sm text-frost/90"
            >
              {c}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".contact-reveal",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        },
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative bg-charcoal py-28 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        {/* Header — centered */}
        <div className="text-center">
          <p className="contact-reveal mb-4 text-[11px] tracking-label text-accent uppercase">
            Contact
          </p>
          <h2 className="contact-reveal font-serif-display text-3xl text-balance text-frost sm:text-5xl">
            Let's build something great.
          </h2>
        </div>

        {/* Two-column: dark glass MV card (left) + contact info (right) */}
        <div className="mt-16 grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* LEFT: Dark glass MV card */}
          {/* LEFT: Dark glass MV card */}
          <div className="contact-reveal flex justify-center md:justify-start">
            <div className="parent">
              <div className="card">
                <div className="logo">
                  <span className="circle circle1"></span>
                  <span className="circle circle2"></span>
                  <span className="circle circle3"></span>
                  <span className="circle circle4"></span>
                  <span className="circle circle5">
                    <span className="monogram">MV</span>
                  </span>
                </div>

                <div className="glass"></div>

                <div className="content">
                  <span className="title">
                    BACKEND
                    <br />
                    DEVELOPER
                  </span>
                  <span className="text">
                    Python &middot; Django &middot; DRF &middot; PostgreSQL
                    &middot; Redis
                  </span>
                </div>

                <div className="bottom">
                  <div className="social-buttons-container">
                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/_mr_looser___07?stkn=bXQxaXo5d3J1cHU0"
                      target="_blank"
                      rel="noreferrer"
                      className="social-button"
                      aria-label="Instagram"
                    >
                      <svg
                        viewBox="0 0 30 30"
                        xmlns="http://www.w3.org/2000/svg"
                        className="svg"
                      >
                        <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"></path>
                      </svg>
                    </a>

                    {/* GitHub */}
                    <a
                      href="https://github.com/MOHAN123DOL"
                      target="_blank"
                      rel="noreferrer"
                      className="social-button"
                      aria-label="GitHub"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="svg"
                      >
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href="https://linkedin.com/in/mohan-v-3891331a3"
                      target="_blank"
                      rel="noreferrer"
                      className="social-button"
                      aria-label="LinkedIn"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className="svg"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    </a>
                  </div>

                  <div className="view-more">
                    <a
                      href={resumeFile}
                      download="Mohan_Venkateshkumar_Resume.pdf"
                      className="view-more-button"
                    >
                      Download
                    </a>
                    <svg
                      className="svg"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 9 6 6 6-6"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Contact info */}
          <div className="contact-reveal flex flex-col items-center gap-6 text-center md:items-start md:text-left">
            <div>
              <p className="text-[11px] tracking-label text-accent uppercase">
                Get in touch
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">
                I'm open to backend engineering roles, freelance projects, and
                collaborations. Feel free to reach out — I usually reply within
                a day.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="mailto:mohanvenkateshkumar@gmail.com"
                className="group flex items-center gap-3 text-sm text-mist transition hover:text-frost"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:border-accent/50 group-hover:bg-accent/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </span>
                <span>mohanvenkateshkumar@gmail.com</span>
              </a>

              <a
                href="tel:+916380246563"
                className="group flex items-center gap-3 text-sm text-mist transition hover:text-frost"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition group-hover:border-accent/50 group-hover:bg-accent/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </span>
                <span>+91 6380246563</span>
              </a>

              <div className="group flex items-center gap-3 text-sm text-mist">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span>Lalgudi, Trichy, Tamil Nadu</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterBar() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer-bar relative border-t border-white/8 bg-ink py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          {/* Left: brand info */}
          <div className="flex flex-col items-center text-center md:items-start md:text-left">
            <p className="text-sm font-semibold tracking-label text-frost">
              MOHAN VENKATESHKUMAR
            </p>
            <p className="mt-1 text-[11px] tracking-label text-mist uppercase">
              Python Developer
            </p>
            <p className="mt-3 text-xs text-mist/70">
              Python &middot; Django &middot; DRF &middot; PostgreSQL &middot;
              Redis &middot; React
            </p>

            {/* Social row */}
            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="footer-social-btn"
              >
                <svg
                  viewBox="0 0 30 30"
                  xmlns="http://www.w3.org/2000/svg"
                  className="footer-social-svg"
                >
                  <path d="M 9.9980469 3 C 6.1390469 3 3 6.1419531 3 10.001953 L 3 20.001953 C 3 23.860953 6.1419531 27 10.001953 27 L 20.001953 27 C 23.860953 27 27 23.858047 27 19.998047 L 27 9.9980469 C 27 6.1390469 23.858047 3 19.998047 3 L 9.9980469 3 z M 22 7 C 22.552 7 23 7.448 23 8 C 23 8.552 22.552 9 22 9 C 21.448 9 21 8.552 21 8 C 21 7.448 21.448 7 22 7 z M 15 9 C 18.309 9 21 11.691 21 15 C 21 18.309 18.309 21 15 21 C 11.691 21 9 18.309 9 15 C 9 11.691 11.691 9 15 9 z M 15 11 A 4 4 0 0 0 11 15 A 4 4 0 0 0 15 19 A 4 4 0 0 0 19 15 A 4 4 0 0 0 15 11 z"></path>
                </svg>
              </a>
              <a
                href="https://facebook.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="footer-social-btn"
              >
                <svg
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  className="footer-social-svg"
                >
                  <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                </svg>
              </a>
              <a
                href="https://wa.me/916380246563"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="footer-social-btn"
              >
                <svg
                  viewBox="0 0 640 512"
                  xmlns="http://www.w3.org/2000/svg"
                  className="footer-social-svg"
                >
                  <path d="M524.531,69.836a1.5,1.5,0,0,0-.764-.7A485.065,485.065,0,0,0,404.081,32.03a1.816,1.816,0,0,0-1.923.91,337.461,337.461,0,0,0-14.9,30.6,447.848,447.848,0,0,0-134.426,0,309.541,309.541,0,0,0-15.135-30.6,1.89,1.89,0,0,0-1.924-.91A483.689,483.689,0,0,0,116.085,69.137a1.712,1.712,0,0,0-.788.676C39.068,183.651,18.186,294.69,28.43,404.354a2.016,2.016,0,0,0,.765,1.375A487.666,487.666,0,0,0,176.02,479.918a1.9,1.9,0,0,0,2.063-.676A348.2,348.2,0,0,0,208.12,430.4a1.86,1.86,0,0,0-1.019-2.588,321.173,321.173,0,0,1-45.868-21.853,1.885,1.885,0,0,1-.185-3.126c3.082-2.309,6.166-4.711,9.109-7.137a1.819,1.819,0,0,1,1.9-.256c96.229,43.917,200.41,43.917,295.5,0a1.812,1.812,0,0,1,1.924.233c2.944,2.426,6.027,4.851,9.132,7.16a1.884,1.884,0,0,1-.162,3.126,301.407,301.407,0,0,1-45.89,21.83,1.875,1.875,0,0,0-1,2.611,391.055,391.055,0,0,0,30.014,48.815,1.864,1.864,0,0,0,2.063.7A486.048,486.048,0,0,0,610.7,405.729a1.882,1.882,0,0,0,.765-1.352C623.729,277.594,590.933,167.465,524.531,69.836ZM222.491,337.58c-28.972,0-52.844-26.587-52.844-59.239S193.056,219.1,222.491,219.1c29.665,0,53.306,26.82,52.843,59.239C275.334,310.993,251.924,337.58,222.491,337.58Zm195.38,0c-28.971,0-52.843-26.587-52.843-59.239S388.437,219.1,417.871,219.1c29.667,0,53.307,26.82,52.844,59.239C470.715,310.993,447.538,337.58,417.871,337.58Z"></path>
                </svg>
              </a>
            </div>

            <p className="mt-6 text-[11px] text-mist/50">
              &copy; {year} All rights reserved.
            </p>
          </div>

          <div className="footer-card-wrapper flex justify-center md:justify-end">
            <div className="jr-glass-card group">
              <div className="jr-glass-content">
                <span className="jr-initials">Jr</span>
                <p className="jr-role">Backend Developer</p>
              </div>

              <a
                href={resumeFile}
                download="Mohan_Venkateshkumar_Resume.pdf"
                className="jr-glass-btn"
              >
                Download CV
                <svg
                  className="jr-glass-btn-icon"
                  viewBox="0 0 100 100"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.1,77.9a4,4,0,0,1,4-4H73.9a4,4,0,0,1,0,8H26.1A4,4,0,0,1,22.1,77.9ZM35.2,47.2a4,4,0,0,1,5.7,0L46,52.3V22.1a4,4,0,1,1,8,0V52.3l5.1-5.1a4,4,0,0,1,5.7,0,4,4,0,0,1,0,5.6l-12,12a3.9,3.9,0,0,1-5.6,0l-12-12A4,4,0,0,1,35.2,47.2Z"
                    fillRule="evenodd"
                  />
                </svg>
              </a>

              {/* Glass silhouette decorations */}
              <svg
                className="jr-glass-svg jr-glass-svg-back"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
              >
                <path d="M 50.4 51 C 40.5 49.1 40 46 40 44 v -1.2 a 18.9 18.9 0 0 0 5.7 -8.8 h 0.1 c 3 0 3.8 -6.3 3.8 -7.3 s 0.1 -4.7 -3 -4.7 C 53 4 30 0 22.3 6 c -5.4 0 -5.9 8 -3.9 16 c -3.1 0 -3 3.8 -3 4.7 s 0.7 7.3 3.8 7.3 c 1 3.6 2.3 6.9 4.7 9 v 1.2 c 0 2 0.5 5 -9.5 6.8 S 2 62 2 62 h 60 a 14.6 14.6 0 0 0 -11.6 -11 z" />
              </svg>

              <svg
                className="jr-glass-svg jr-glass-svg-front"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 64 64"
              >
                <path d="M 50.4 51 C 40.5 49.1 40 46 40 44 v -1.2 a 18.9 18.9 0 0 0 5.7 -8.8 h 0.1 c 3 0 3.8 -6.3 3.8 -7.3 s 0.1 -4.7 -3 -4.7 C 53 4 30 0 22.3 6 c -5.4 0 -5.9 8 -3.9 16 c -3.1 0 -3 3.8 -3 4.7 s 0.7 7.3 3.8 7.3 c 1 3.6 2.3 6.9 4.7 9 v 1.2 c 0 2 0.5 5 -9.5 6.8 S 2 62 2 62 h 60 a 14.6 14.6 0 0 0 -11.6 -11 z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function Footer() {
  return (
    <>
      <SecondVideoSection />
      <ExperienceSection />
      <EducationSection />
      <CertificationsSection />
      <ContactSection />
      <FooterBar />
    </>
  );
}
