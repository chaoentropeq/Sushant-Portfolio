import { motion } from "framer-motion";
import { posts } from "../data";
import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";
import { staggerItem, staggerParent } from "../motionVariants";

export function Writing() {
  return (
    <PageTransition>
      <PageHeader eyebrow="Writing" title="Notes on building" />
      <motion.div
        style={{ display: "grid", gap: 14 }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {posts.map((p) => (
          <motion.a
            key={p.title}
            href="#/writing"
            variants={staggerItem}
            whileHover={{ x: 6 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            style={{
              color: "var(--fg)",
              background: "var(--tile)",
              border: "1px solid var(--line)",
              borderRadius: 22,
              padding: "26px 28px",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
              display: "flex",
              gap: 22,
              alignItems: "baseline",
              justifyContent: "space-between",
              flexWrap: "wrap",
            }}
          >
            <span style={{ fontSize: 21, fontWeight: 600, letterSpacing: "-.02em", maxWidth: "46ch" }}>
              {p.title}
            </span>
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--fg2)" }}>
              {p.meta}
            </span>
          </motion.a>
        ))}
      </motion.div>
      <p style={{ margin: "22px 0 0", fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: "var(--fg2)" }}>
        placeholder titles — send me the real posts and I'll wire them up
      </p>
    </PageTransition>
  );
}
