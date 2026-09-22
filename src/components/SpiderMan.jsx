import { useEffect, useState } from "react";
import "./SpiderMan.css";

import resumeFile from "../assets/Mohan_Venkateshkumar_Resume.pdf";

const WHATSAPP_NUMBER = "916380246563";

const GITHUB_URL = "https://github.com/MOHAN123DOL";
const LINKEDIN_URL = "https://linkedin.com/in/mohan-v-3891331a3";

export default function SpiderMan() {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setShowForm(false);
        document.body.style.overflow = "";
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, []);

  const handleSpiderClick = () => {
    if (isOpen) {
      setIsOpen(false);
      setShowForm(false);
      document.body.style.overflow = "";
    } else {
      setIsOpen(true);
      setShowForm(false);
      document.body.style.overflow = "hidden";
    }
  };

  const closePopup = () => {
    setIsOpen(false);
    setShowForm(false);
    document.body.style.overflow = "";
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const sendToWhatsApp = (event) => {
    event.preventDefault();

    const name = form.name.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!name || !email || !message) {
      return;
    }

    const whatsappMessage = `Hi Mohan,

Name: ${name}
Email: ${email}

Message:
${message}`;

    const whatsappUrl =
      `https://wa.me/${WHATSAPP_NUMBER}?text=` +
      encodeURIComponent(whatsappMessage);

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    setForm({
      name: "",
      email: "",
      message: "",
    });
  };

  return (
    <>
      {/* =====================================================
          SIMPLE ORIGINAL SPIDER-MAN
      ===================================================== */}

      <button
        type="button"
        className={`spiderman-button ${isOpen ? "spiderman-button-open" : ""}`}
        onClick={handleSpiderClick}
        aria-label="Know more about Mohan"
      >
        <div className="container center">
          <div className="rope center">
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

              <div className="mask center">
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
