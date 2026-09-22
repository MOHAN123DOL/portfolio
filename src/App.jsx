import { useState } from "react";
import WelcomeIntro from "./components/WelcomeIntro";
import SpiderMan from "./components/SpiderMan";
import Home from "./pages/Home";

export default function App() {
  const [welcomeFinished, setWelcomeFinished] = useState(false);

  return (
    <>
      <Home />

      {!welcomeFinished && (
        <WelcomeIntro
          onFinish={() => setWelcomeFinished(true)}
        />
      )}

      {welcomeFinished && <SpiderMan />}
    </>
  );
}