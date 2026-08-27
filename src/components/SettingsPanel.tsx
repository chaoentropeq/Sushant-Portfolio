import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PHASES, PHASE_OPTIONS, WEATHERS, type Phase, type Weather } from "../theme";

function pillStyle(active: boolean): CSSProperties {
  return {
    padding: "7px 11px",
    borderRadius: 10,
    cursor: "pointer",
    fontFamily: "'JetBrains Mono',monospace",
    fontSize: 11,
    border: `1px solid ${active ? "transparent" : "var(--line)"}`,
    background: active ? "var(--accent)" : "transparent",
    color: active ? "var(--onAccent)" : "var(--fg2)",
    transition: "background .25s ease,color .25s ease,border-color .25s ease",
  };
}

export function SettingsPanel({
  phase,
  weather,
  temp,
  phaseOverride,
  weatherOverride,
  panelOpen,
  setPanelOpen,
  setPhaseOverride,
  setWeatherOverride,
}: {
  phase: Phase;
  weather: Weather;
  temp: number | null;
  phaseOverride: Phase | null;
  weatherOverride: Weather | null;
  panelOpen: boolean;
  setPanelOpen: (fn: (v: boolean) => boolean) => void;
  setPhaseOverride: (v: Phase | null) => void;
  setWeatherOverride: (v: Weather | null) => void;
}) {
  const statusLine =
    PHASES[phase].label +
    " · " +
    weather +
    (temp != null ? ` · ${temp}°C` : "");

  return (
    <div
      style={{
        position: "fixed",
        right: 22,
        top: 22,
        zIndex: 40,
        display: "flex",
        flexDirection: "column-reverse",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -10 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            style={{
              width: 246,
              maxWidth: "calc(100vw - 44px)",
              padding: 16,
              borderRadius: 20,
              background: "var(--tile)",
              border: "1px solid var(--line)",
              backdropFilter: "blur(26px) saturate(1.5)",
              WebkitBackdropFilter: "blur(26px) saturate(1.5)",
              boxShadow: "0 24px 50px -30px rgba(0,0,0,.6)",
              transformOrigin: "top right",
            }}
          >
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--fg2)",
              }}
            >
              Time of day
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 16,
              }}
            >
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                style={pillStyle(!phaseOverride)}
                onClick={() => setPhaseOverride(null)}
              >
                auto
              </motion.button>
              {PHASE_OPTIONS.map((p) => (
                <motion.button
                  key={p}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  style={pillStyle(phaseOverride === p)}
                  onClick={() => setPhaseOverride(p)}
                >
                  {p}
                </motion.button>
              ))}
            </div>
            <p
              style={{
                margin: "0 0 10px",
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 10,
                letterSpacing: ".16em",
                textTransform: "uppercase",
                color: "var(--fg2)",
              }}
            >
              Weather
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.95 }}
                style={pillStyle(!weatherOverride)}
                onClick={() => setWeatherOverride(null)}
              >
                auto
              </motion.button>
              {WEATHERS.map((w) => (
                <motion.button
                  key={w}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.95 }}
                  style={pillStyle(weatherOverride === w)}
                  onClick={() => setWeatherOverride(w)}
                >
                  {w}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setPanelOpen((v) => !v)}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 26 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "11px 16px",
          borderRadius: 99,
          border: "1px solid var(--line)",
          background: "var(--tile)",
          backdropFilter: "blur(26px) saturate(1.5)",
          WebkitBackdropFilter: "blur(26px) saturate(1.5)",
          color: "var(--fg)",
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          cursor: "pointer",
          boxShadow: "0 18px 40px -26px rgba(0,0,0,.6)",
        }}
      >
        <span
          style={{
            width: 9,
            height: 9,
            borderRadius: "50%",
            background: "var(--accent)",
            boxShadow: "0 0 12px var(--accent)",
          }}
        />
        <span>{statusLine}</span>
      </motion.button>
    </div>
  );
}
