import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "../lib/gsap.js";
import mohan1 from "../assets/mohan1.png";

const PROJECTS = [
  {
    id: "01",
    title: "ERP Software",
    tag: "Freelance Full-Stack Project",
    stack: ["React", "Django"],
    description:
      "Developed a full-stack ERP application with React frontend and Django backend. Built REST APIs and business workflow modules.",
    mock: ["Inventory", "Production", "Orders"],
  },
  {
    id: "02",
    title: "Job Portal Backend",
    tag: "Backend Platform",
    stack: ["Django REST Framework", "JWT"],
    description:
      "Built REST APIs for job listings and applications with JWT authentication.",
    mock: ["Jobs", "Applications", "Candidates"],
  },
  {
    id: "03",
    title: "E-Commerce SaaS",
    tag: "Backend Platform",
    stack: ["Django", "PostgreSQL"],
    description:
      "Developed product management, order processing and role-based backend systems.",
    mock: ["Products", "Orders", "Customers"],
  },
  {
    id: "04",
    title: "Weather Dashboard",
    tag: "Data Application",
    stack: ["Streamlit", "REST API"],
    description:
      "Built a weather dashboard using external APIs and Streamlit visualizations.",
    mock: ["Temperature", "Forecast", "Weather Data"],
  },
  {
    id: "05",
    title: "ERP Monitoring Dashboard",
    tag: "Analytics",
    stack: ["Power BI", "Analytics"],
    description: "Built an ERP/business analytics monitoring dashboard.",
    mock: ["KPIs", "Charts", "Business Metrics"],
  },
];

function ProjectMock({ labels }) {
  return (
    <div className="grid h-full grid-cols-3 gap-3 p-5">
      {labels.map((l) => (
        <div
          key={l}
          className="flex flex-col justify-between rounded-lg border border-white/10 bg-white/5 p-3"
        >
          <div className="h-1.5 w-8 rounded-full bg-accent/60" />
          <span className="text-[10px] tracking-label text-mist uppercase">{l}</span>
          <div className="space-y-1.5">
            <div className="h-1 w-full rounded-full bg-white/10" />
            <div className="h-1 w-2/3 rounded-full bg-white/10" />
          </div>
        </div>
      ))}
    </div>
  );
}

function StackedProjectCards() {
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      cardRefs.current.forEach((card, i) => {
        if (!card || i === cardRefs.current.length - 1) return;
        gsap.to(card, {
          scale: 0.94,
          opacity: 0.5,
          filter: "blur(2px)",
          ease: "none",
          scrollTrigger: {
            trigger: cardRefs.current[i + 1],
            start: "top 85%",
            end: "top 20%",
            scrub: true,
          },
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {PROJECTS.map((p, i) => (
        <div
          key={p.id}
          className="sticky top-24 mb-8 flex justify-center"
          style={{ zIndex: i + 1 }}
        >
          <div
            ref={(el) => (cardRefs.current[i] = el)}
            className="glass-panel w-full max-w-4xl rounded-2xl p-6 shadow-2xl shadow-black/40 sm:p-8"
            style={{ transformOrigin: "top center" }}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center">
              <div>
                <span className="text-[11px] tracking-label text-accent">
                  Project {p.id}
                </span>
                <h3 className="mt-3 font-serif-display text-2xl text-frost sm:text-3xl">
                  {p.title}
                </h3>
                <p className="mt-1 text-[11px] tracking-label text-mist uppercase">{p.tag}</p>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-mist">
                  {p.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {p.stack.map((s) => (
                    <span
                      key={s}
                      className="rounded-full border border-white/10 px-3 py-1 text-[10px] tracking-label text-mist/90 uppercase"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="h-40 overflow-hidden rounded-xl border border-white/10 bg-navy/60 sm:h-48">
                <ProjectMock labels={p.mock} />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectsSection() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".projects-heading",
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="projects" ref={sectionRef} className="relative bg-ink py-24">
      <div className="absolute inset-0">
        <div
          className="h-full w-full bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${mohan1})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink via-ink/85 to-ink" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-10">
        <div className="projects-heading mb-16 max-w-xl">
          <p className="mb-3 text-[11px] tracking-label text-accent uppercase">Projects</p>
          <h2 className="font-serif-display text-3xl text-frost sm:text-4xl">
            Ideas, built into systems.
          </h2>
        </div>

        <StackedProjectCards />
      </div>
    </section>
  );
}

export default function Projects() {
  return <ProjectsSection />;
}
