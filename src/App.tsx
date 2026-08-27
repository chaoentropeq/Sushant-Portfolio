import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { usePortfolio } from "./hooks/usePortfolio";
import { IntroSequence } from "./components/IntroSequence";
import { BackgroundBlobs } from "./components/BackgroundBlobs";
import { SkyCanvas } from "./components/SkyCanvas";
import { Dock } from "./components/Dock";
import { SettingsPanel } from "./components/SettingsPanel";
import { Home } from "./pages/Home";
import { Journey } from "./pages/Journey";
import { Projects } from "./pages/Projects";
import { Skills } from "./pages/Skills";
import { Writing } from "./pages/Writing";
import { Certifications } from "./pages/Certifications";
import { Contact } from "./pages/Contact";

function Page({
  route,
  portfolio,
}: {
  route: string;
  portfolio: ReturnType<typeof usePortfolio>;
}) {
  switch (route) {
    case "#/journey":
      return <Journey />;
    case "#/projects":
      return <Projects />;
    case "#/skills":
      return <Skills />;
    case "#/writing":
      return <Writing />;
    case "#/certifications":
      return <Certifications />;
    case "#/contact":
      return <Contact />;
    default:
      return (
        <Home
          phase={portfolio.phase}
          weather={portfolio.weather}
          temp={portfolio.temp}
          hour={portfolio.hour}
          minute={portfolio.minute}
          motion={portfolio.motion}
          live={portfolio.live}
        />
      );
  }
}

function App() {
  const portfolio = usePortfolio();
  const [introDone, setIntroDone] = useState(false);

  return (
    <>
      <AnimatePresence>
        {!introDone && (
          <IntroSequence key="intro" onDone={() => setIntroDone(true)} />
        )}
      </AnimatePresence>
      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          background: "var(--bg)",
          color: "var(--fg)",
          fontFamily: "'Space Grotesk',Helvetica,sans-serif",
          overflowX: "clip",
          transition: "color 1.2s ease, opacity .6s ease",
          opacity: introDone ? 1 : 0,
          pointerEvents: introDone ? "auto" : "none",
        }}
      >
      <BackgroundBlobs />
      <SkyCanvas
        weather={portfolio.weather}
        phase={portfolio.phase}
        motion={portfolio.motion}
      />

      <a
        href="#/"
        style={{
          position: "fixed",
          top: 22,
          left: 26,
          zIndex: 30,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--fg)",
        }}
      >
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 8,
            background: "linear-gradient(140deg,var(--accent),var(--accent2))",
            display: "block",
          }}
        />
        <span
          style={{
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            letterSpacing: ".14em",
            textTransform: "uppercase",
          }}
        >
          SSK
        </span>
      </a>

      <main
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1180,
          margin: "0 auto",
          padding: "84px 22px 140px",
        }}
      >
        {introDone && (
          <AnimatePresence mode="wait">
            <Page key={portfolio.route} route={portfolio.route} portfolio={portfolio} />
          </AnimatePresence>
        )}
      </main>

      <Dock route={portfolio.route} />

      <SettingsPanel
        phase={portfolio.phase}
        weather={portfolio.weather}
        temp={portfolio.temp}
        phaseOverride={portfolio.phaseOverride}
        weatherOverride={portfolio.weatherOverride}
        panelOpen={portfolio.panelOpen}
        setPanelOpen={portfolio.setPanelOpen}
        setPhaseOverride={portfolio.setPhaseOverride}
        setWeatherOverride={portfolio.setWeatherOverride}
      />
      </div>
    </>
  );
}

export default App;
