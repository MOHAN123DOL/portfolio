import { useEffect, useState } from "react";
import WelcomeIntro from "../components/WelcomeIntro.jsx";
import Hero from "../components/Hero.jsx";
import Projects from "../components/Projects.jsx";
import Footer from "../components/Footer.jsx";

export default function Home() {
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    document.body.style.overflow = introDone ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [introDone]);

  return (
    <>
      {!introDone && <WelcomeIntro onFinish={() => setIntroDone(true)} />}
      <main className="bg-ink">
        <Hero showWelcome={introDone} />
        <Projects />
        <Footer />
      </main>
    </>
  );
}
