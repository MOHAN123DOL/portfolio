import { useEffect, useLayoutEffect, useRef, useState } from "react";
import "./SpiderMan.css";

import resumeFile from "../assets/Mohan_Venkateshkumar_Resume.pdf";

const WHATSAPP_NUMBER = "916380246563";

const GITHUB_URL = "https://github.com/MOHAN123DOL";
const LINKEDIN_URL = "https://linkedin.com/in/mohan-v-3891331a3";

const MOVE_THRESHOLD = 8;

const DRAG_UP_RATIO = 0.08;
const DRAG_DOWN_RATIO = 0.62;
const DRAG_LEFT_RATIO = 0.35;
const DRAG_RIGHT_RATIO = 0.35;

const SPRING_STIFFNESS = 170;
const SPRING_DAMPING = 16;
const SPRING_REST_POSITION = 0.4;
const SPRING_REST_VELOCITY = 40;

const BUBBLE_DELAY_MS = 5000;
const BUBBLE_AUTO_HIDE_MS = 12000;

/* =========================================================
   SCROLL LOCK HELPERS
   Reserve scrollbar space so locking body overflow never
   shifts the page sideways.
========================================================= */

function lockScroll() {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;

  document.body.style.overflow = "hidden";

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }
}

function unlockScroll() {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
}

export default function SpiderMan() {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubbleLeaving, setBubbleLeaving] = useState(false);

  const [isDragging, setIsDragging] = useState(false);
  const [entranceReady, setEntranceReady] = useState(false);

  const userInteractedRef = useRef(false);
  const bubbleTimerRef = useRef(null);
  const bubbleHideTimerRef = useRef(null);
  const bubbleLeavingTimerRef = useRef(null);

  const spiderRef = useRef(null);
  const attachmentRef = useRef(null);

  const offsetRef = useRef({ x: 0, y: 0 });

  const dragRef = useRef({
    active: false,
    moved: false,
    pointerId: null,
    startX: 0,
    startY: 0,
    startOffsetX: 0,
    startOffsetY: 0,
  });

  const moveRafRef = useRef(null);
  const lastPointerRef = useRef({ x: 0, y: 0 });
  const springRef = useRef({ raf: null, vx: 0, vy: 0 });
  const animationRafRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  // --------------------------------------------------------
  // Rope sync
  // --------------------------------------------------------
  const syncRope = () => {
    const spider = spiderRef.current;
    const attachment = attachmentRef.current;
    if (!spider || !attachment) return;

    const rect = spider.getBoundingClientRect();
    const attachmentRect = attachment.getBoundingClientRect();

    const computed = window.getComputedStyle(spider);
    const scale =
      parseFloat(computed.getPropertyValue("--spider-scale")) || 1;

    const isMobile = window.matchMedia("(max-width: 600px)").matches;

    const anchorX = isMobile
      ? window.innerWidth - 27.5
      : window.innerWidth - 80;

    const anchorY = 0;

    const attachmentX = attachmentRect.left + attachmentRect.width / 2;
    const attachmentY = attachmentRect.top;

    const dx = anchorX - attachmentX;
    const dy = anchorY - attachmentY;

    const distance = Math.hypot(dx, dy);
    const ropeLength = distance / scale;

    const localAttachmentX = (attachmentX - rect.left) / scale;
    const localAttachmentY = (attachmentY - rect.top) / scale;

    const angle = Math.atan2(dx, -dy) * (180 / Math.PI);

    spider.style.setProperty("--rope-length", `${ropeLength}px`);
    spider.style.setProperty("--rope-angle", `${angle}deg`);
    spider.style.setProperty(
      "--rope-attachment-x",
      `${localAttachmentX}px`
    );
    spider.style.setProperty(
      "--rope-attachment-y",
      `${localAttachmentY}px`
    );
  };

  const startAnimationRopeSync = () => {
    if (animationRafRef.current != null) return;

    const tick = () => {
      syncRope();
      animationRafRef.current = requestAnimationFrame(tick);
    };

    animationRafRef.current = requestAnimationFrame(tick);
  };

  const stopAnimationRopeSync = () => {
    if (animationRafRef.current != null) {
      cancelAnimationFrame(animationRafRef.current);
      animationRafRef.current = null;
    }
  };

  const setOffset = (x, y) => {
    offsetRef.current.x = x;
    offsetRef.current.y = y;

    const spider = spiderRef.current;
    if (spider) {
      spider.style.setProperty("--drag-x", `${x}px`);
      spider.style.setProperty("--drag-y", `${y}px`);
    }

    syncRope();
  };

  const stopSpring = () => {
    if (springRef.current.raf != null) {
      cancelAnimationFrame(springRef.current.raf);
      springRef.current.raf = null;
    }
  };

  const startElasticReturn = () => {
    stopSpring();

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setOffset(0, 0);
      return;
    }

    springRef.current.vx = 0;
    springRef.current.vy = 0;
    let lastTime = null;

    const tick = (now) => {
      if (lastTime === null) lastTime = now;
      const dt = Math.min((now - lastTime) / 1000, 0.032);
      lastTime = now;

      const { x, y } = offsetRef.current;

      const ax =
        -SPRING_STIFFNESS * x - SPRING_DAMPING * springRef.current.vx;
      const ay =
        -SPRING_STIFFNESS * y - SPRING_DAMPING * springRef.current.vy;

      springRef.current.vx += ax * dt;
      springRef.current.vy += ay * dt;

      const nextX = x + springRef.current.vx * dt;
      const nextY = y + springRef.current.vy * dt;

      setOffset(nextX, nextY);

      const settled =
        Math.abs(nextX) < SPRING_REST_POSITION &&
        Math.abs(nextY) < SPRING_REST_POSITION &&
        Math.abs(springRef.current.vx) < SPRING_REST_VELOCITY &&
        Math.abs(springRef.current.vy) < SPRING_REST_VELOCITY;

      if (settled) {
        setOffset(0, 0);
        springRef.current.raf = null;
        return;
      }

      springRef.current.raf = requestAnimationFrame(tick);
    };

    springRef.current.raf = requestAnimationFrame(tick);
  };

  const applyPendingMove = () => {
    moveRafRef.current = null;
    if (!dragRef.current.active) return;

    const dx = lastPointerRef.current.x - dragRef.current.startX;
    const dy = lastPointerRef.current.y - dragRef.current.startY;

    if (Math.hypot(dx, dy) > MOVE_THRESHOLD) dragRef.current.moved = true;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const minX = -vw * DRAG_LEFT_RATIO;
    const maxX = vw * DRAG_RIGHT_RATIO;
    const minY = -vh * DRAG_UP_RATIO;
    const maxY = vh * DRAG_DOWN_RATIO;

    const nextX = Math.max(
      minX,
      Math.min(maxX, dragRef.current.startOffsetX + dx)
    );
    const nextY = Math.max(
      minY,
      Math.min(maxY, dragRef.current.startOffsetY + dy)
    );

    setOffset(nextX, nextY);
  };

  const handlePointerDown = (event) => {
    if (isOpen) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const spider = spiderRef.current;
    if (!spider) return;

    stopSpring();
    spider.setPointerCapture?.(event.pointerId);

    lastPointerRef.current.x = event.clientX;
    lastPointerRef.current.y = event.clientY;

    dragRef.current = {
      active: true,
      moved: false,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startOffsetX: offsetRef.current.x,
      startOffsetY: offsetRef.current.y,
    };

    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (
      !dragRef.current.active ||
      event.pointerId !== dragRef.current.pointerId
    ) {
      return;
    }

    lastPointerRef.current.x = event.clientX;
    lastPointerRef.current.y = event.clientY;

    if (moveRafRef.current == null) {
      moveRafRef.current = requestAnimationFrame(applyPendingMove);
    }
  };

  const handlePointerUp = (event) => {
    if (
      !dragRef.current.active ||
      event.pointerId !== dragRef.current.pointerId
    ) {
      return;
    }

    const spider = spiderRef.current;

    if (moveRafRef.current != null) {
      cancelAnimationFrame(moveRafRef.current);
      moveRafRef.current = null;
    }

    if (event.type !== "pointercancel") {
      lastPointerRef.current.x = event.clientX;
      lastPointerRef.current.y = event.clientY;
      applyPendingMove();
    }

    dragRef.current.active = false;
    spider?.releasePointerCapture?.(event.pointerId);

    setIsDragging(false);
    startElasticReturn();
  };

  /* --------------------------------------------------------
     Rope-sync during animations
     Only run continuous sync for the entrance drop and the
     decorative swing. The popup drop animates the button
     rigidly (rope follows along naturally), so we skip it
     to avoid per-frame feedback jitter.
  -------------------------------------------------------- */
  const handleAnimationStart = (event) => {
    if (
      event.animationName === "spiderComeDown" ||
      event.animationName === "swing"
    ) {
      startAnimationRopeSync();
    }
  };

  const handleAnimationEnd = (event) => {
    if (
      event.target === event.currentTarget &&
      event.animationName === "spiderComeDown"
    ) {
      setEntranceReady(true);
    }

    if (
      event.animationName === "spiderComeDown" ||
      event.animationName === "spiderDrop" ||
      event.animationName === "spiderDropMobile" ||
      event.animationName === "swing"
    ) {
      stopAnimationRopeSync();
      syncRope();
    }
  };

  useLayoutEffect(() => {
    const onResize = () => syncRope();
    window.addEventListener("resize", onResize);
    syncRope();

    return () => {
      window.removeEventListener("resize", onResize);
      stopSpring();
      stopAnimationRopeSync();
      if (moveRafRef.current != null)
        cancelAnimationFrame(moveRafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Safety: ensure Spider-Man is visible even if the entrance
  // animation never fires.
  useEffect(() => {
    const safety = setTimeout(() => setEntranceReady(true), 2000);
    return () => clearTimeout(safety);
  }, []);

  // ESC closes the main popup.
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowForm(false);
        unlockScroll();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      unlockScroll();
    };
  }, []);

  // --------------------------------------------------------
  // AUTO WELCOME BUBBLE
  // --------------------------------------------------------
  useEffect(() => {
    bubbleTimerRef.current = setTimeout(() => {
      if (userInteractedRef.current) return;
      setBubbleOpen(true);

      bubbleHideTimerRef.current = setTimeout(() => {
        dismissBubble();
      }, BUBBLE_AUTO_HIDE_MS);
    }, BUBBLE_DELAY_MS);

    return () => {
      if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current);
      if (bubbleHideTimerRef.current)
        clearTimeout(bubbleHideTimerRef.current);
      if (bubbleLeavingTimerRef.current)
        clearTimeout(bubbleLeavingTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismissBubble = () => {
    if (bubbleLeaving) return;
    setBubbleLeaving(true);
    bubbleLeavingTimerRef.current = setTimeout(() => {
      setBubbleOpen(false);
      setBubbleLeaving(false);
      bubbleLeavingTimerRef.current = null;
    }, 300);
  };

  const handleSpiderClick = () => {
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }

    userInteractedRef.current = true;

    if (bubbleOpen) dismissBubble();

    if (isOpen) {
      setIsOpen(false);
      setShowForm(false);
      unlockScroll();
    } else {
      setIsOpen(true);
      setShowForm(false);
      lockScroll();
    }
  };

  const closePopup = () => {
    setIsOpen(false);
    setShowForm(false);
    unlockScroll();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const sendToWhatsApp = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) return;

    const whatsappMessage = `Hi Mohan,

Name: ${name}
Email: ${email}

Message:
${message}`;

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` +
      encodeURIComponent(whatsappMessage);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setForm({ name: "", email: "", message: "" });
  };

  return (
    <>
      {/* =====================================================
          SPIDER-MAN WELCOME BUBBLE
      ===================================================== */}

      {bubbleOpen && (
        <div
          className={`spiderman-bubble${
            bubbleLeaving ? " spiderman-bubble--leaving" : ""
          }`}
          role="status"
          aria-live="polite"
        >
          <button
            type="button"
            className="spiderman-bubble__close"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={dismissBubble}
            aria-label="Dismiss message"
          >
            ×
          </button>

          <p className="spiderman-bubble__text">
            <b>Thanks for visiting my portfolio!</b>{" "}
            Feel free to look around
            <span className="spiderman-bubble__dots" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </p>
        </div>
      )}

      {/* =====================================================
          DRAGGABLE SPIDER-MAN
      ===================================================== */}

      <button
        ref={spiderRef}
        type="button"
        className={[
          "spiderman-button",
          isOpen ? "spiderman-button-open" : "",
          isDragging ? "spiderman-dragging" : "",
          entranceReady ? "spiderman-ready" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={handleSpiderClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onAnimationStart={handleAnimationStart}
        onAnimationEnd={handleAnimationEnd}
        aria-label="Know more about Mohan"
        style={{
          "--drag-x": "0px",
          "--drag-y": "0px",
          "--rope-length": "0px",
          "--rope-angle": "0deg",
        }}
      >
        <div className="rope">
          <div className="container center">
            <div className="legs center">
              <div className="boot-l"></div>
              <div className="boot-r"></div>
            </div>

            <div className="costume center">
              <div className="spider">
                <div className="s1 center"></div>
                <div className="s2 center"></div>
                <div className="s3"></div>
                <div className="s4"></div>
              </div>

              <div className="belt center"></div>

              <div className="hand-r"></div>
              <div className="hand-l"></div>

              <div className="neck center"></div>

              <div ref={attachmentRef} className="mask center">
                <div className="eye-l"></div>
                <div className="eye-r"></div>
              </div>

              <div className="cover center"></div>
            </div>
          </div>
        </div>
      </button>

      {/* =====================================================
          MESSAGE POPUP
      ===================================================== */}

      {isOpen && (
        <div
          className="spiderman-popup-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePopup();
            }
          }}
        >
          <div className="spiderman-message">
            <button
              type="button"
              className="spiderman-close"
              onClick={closePopup}
              aria-label="Close"
            >
              ×
            </button>

            {!showForm ? (
              <>
                <div className="message-small">● KNOW MORE ABOUT ME</div>

                <h2>
                  MOHAN
                  <br />
                  <span>VENKATESHKUMAR</span>
                </h2>

                <div className="message-role">
                  PYTHON DEVELOPER
                  <b>•</b>
                  BACKEND DEVELOPER
                </div>

                <p>
                  I build reliable backend systems, REST APIs and business
                  applications using Python, Django and Django REST Framework.
                </p>

                <div className="message-skills">
                  <span>Python</span>
                  <span>Django</span>
                  <span>DRF</span>
                  <span>FastAPI</span>
                  <span>PostgreSQL</span>
                  <span>Redis</span>
                  <span>React</span>
                </div>

                <div className="message-links">
                  {GITHUB_URL ? (
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      GitHub ↗
                    </a>
                  ) : (
                    <button disabled>GitHub</button>
                  )}

                  {LINKEDIN_URL ? (
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn ↗
                    </a>
                  ) : (
                    <button disabled>LinkedIn</button>
                  )}
                </div>

                <a
                  href={resumeFile}
                  download="Mohan_Venkateshkumar_Resume.pdf"
                  className="resume-button"
                >
                  DOWNLOAD RESUME ↓
                </a>

                <button
                  type="button"
                  className="message-button"
                  onClick={() => setShowForm(true)}
                >
                  SEND ME A MESSAGE →
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="back-button"
                  onClick={() => setShowForm(false)}
                >
                  ← BACK
                </button>

                <div className="message-small">● LET'S CONNECT</div>

                <h2>
                  SEND ME
                  <br />
                  <span>A MESSAGE</span>
                </h2>

                <form onSubmit={sendToWhatsApp}>
                  <label>NAME</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                  />

                  <label>EMAIL</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="your@email.com"
                    required
                  />

                  <label>MESSAGE</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell me what you would like to discuss..."
                    rows="5"
                    required
                  />

                  <button type="submit" className="whatsapp-button">
                    SEND VIA WHATSAPP ↗
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}