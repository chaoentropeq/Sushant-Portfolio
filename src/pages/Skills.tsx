import { motion } from "framer-motion";
import { skillGroups } from "../data";
import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";
import { staggerItem, staggerParent } from "../motionVariants";
import { SKILL_ICON_SLUGS, skillIconUrl } from "../skillIcons";

export function Skills() {
  return (
    <PageTransition>
      <PageHeader eyebrow="Skills" title="The toolkit" />
      <motion.div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 18,
        }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {skillGroups.map((g) => (
          <motion.section
            key={g.name}
            variants={staggerItem}
            style={{
              background: "var(--tile)",
              border: "1px solid var(--line)",
              borderRadius: 24,
              padding: 28,
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          >
            <h3
              style={{
                margin: "0 0 18px",
                fontSize: 13,
                fontFamily: "'JetBrains Mono',monospace",
                letterSpacing: ".14em",
                textTransform: "uppercase",
                color: "var(--fg2)",
              }}
            >
              {g.name}
            </h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {g.items.map((i) => {
                const slug = SKILL_ICON_SLUGS[i];
                return (
                  <motion.span
                    key={i}
                    whileHover={{ y: -2, scale: 1.04 }}
                    transition={{ type: "spring", stiffness: 350, damping: 20 }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      padding: "9px 15px",
                      borderRadius: 99,
                      border: "1px solid var(--line)",
                      background: "var(--sheen)",
                      fontSize: 14,
                      fontWeight: 500,
                    }}
                  >
                    {slug && (
                      <img src={skillIconUrl(slug)} alt="" width={16} height={16} draggable={false} />
                    )}
                    {i}
                  </motion.span>
                );
              })}
            </div>
          </motion.section>
        ))}
      </motion.div>
    </PageTransition>
  );
}
