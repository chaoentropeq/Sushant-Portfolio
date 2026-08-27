import { motion } from "framer-motion";
import { useEffect } from "react";

const easeOut = [0.16, 1, 0.3, 1] as const;

const NAME_PARTS = [
  { text: "Sushant", from: { x: -140, y: 0 } },
  { text: "Shah", from: { x: 0, y: -120 } },
  { text: "Kanu", from: { x: 140, y: 0 } },
];

const ENTER_MS = 1050;
const HOLD_MS = 650;

export function IntroSequence({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, ENTER_MS + HOLD_MS);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <motion.div
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.55, ease: easeOut }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg)",
      }}
    >
      <div style={{ display: "flex" }}>
        {NAME_PARTS.map((part, i) => (
          <motion.div
            key={part.text}
            initial={{ opacity: 0, ...part.from, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            transition={{ delay: i * 0.15, duration: 0.75, ease: easeOut }}
            style={{
              width: "clamp(88px,22vw,150px)",
              height: "clamp(88px,22vw,150px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--tile)",
              border: "1px solid var(--line)",
              borderTopLeftRadius: i === 0 ? 24 : 0,
              borderBottomLeftRadius: i === 0 ? 24 : 0,
              borderTopRightRadius: i === 2 ? 24 : 0,
              borderBottomRightRadius: i === 2 ? 24 : 0,
              backdropFilter: "blur(22px) saturate(1.3)",
              WebkitBackdropFilter: "blur(22px)",
              boxShadow: "0 30px 60px -30px rgba(0,0,0,.5)",
            }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 + 0.4, duration: 0.4, ease: easeOut }}
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: "clamp(11px,2.6vw,14px)",
                fontWeight: 600,
                letterSpacing: ".06em",
                textTransform: "uppercase",
                color: "var(--fg)",
              }}
            >
              {part.text}
            </motion.span>
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.15, duration: 0.5, ease: easeOut }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "9%",
          margin: 0,
          textAlign: "center",
          fontFamily: "'JetBrains Mono',monospace",
          fontSize: 12,
          letterSpacing: ".04em",
          color: "var(--fg2)",
        }}
      >
        Made with ❤️ by Sushant.
      </motion.p>
    </motion.div>
  );
}
