import { motion } from "framer-motion";
import { certs } from "../data";
import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";
import { staggerItem, staggerParent } from "../motionVariants";

export function Certifications() {
  return (
    <PageTransition>
      <PageHeader eyebrow="Certifications" title="Credentials" />
      <motion.div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
          gap: 18,
        }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {certs.map((c, i) => (
          <motion.section
            key={`${c.name}-${i}`}
            variants={staggerItem}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            style={{
              background: "var(--tile)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              padding: 28,
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(140deg,var(--accent),var(--accent2))",
              }}
            />
            <span style={{ fontSize: 19, fontWeight: 600, letterSpacing: "-.02em" }}>
              {c.name}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--fg2)" }}>
              {c.meta}
            </span>
          </motion.section>
        ))}
      </motion.div>
    </PageTransition>
  );
}
