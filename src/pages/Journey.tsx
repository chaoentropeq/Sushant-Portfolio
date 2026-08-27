import { motion } from "framer-motion";
import { journey } from "../data";
import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";
import { staggerItem, staggerParent } from "../motionVariants";

const MARKER = 40;

export function Journey() {
  return (
    <PageTransition>
      <PageHeader eyebrow="Journey" title="How I got here" />
      <motion.div
        className="relative mt-8 md:mt-10"
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        <div
          className="absolute inset-y-0"
          style={{ left: MARKER / 2 - 1, width: 1, background: "var(--line)" }}
        />

        <div className="flex flex-col gap-6 md:gap-7">
          {journey.map((j) => (
            <motion.div
              key={j.title}
              variants={staggerItem}
              className="relative flex gap-5 md:gap-7"
            >
              <span
                className="material-symbol flex-shrink-0"
                style={{
                  width: MARKER,
                  height: MARKER,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  border: "1px solid var(--line)",
                  background: j.type === "work" ? "var(--accent)" : "var(--tile)",
                  color:
                    j.type === "work"
                      ? "var(--onAccent)"
                      : j.type === "break"
                        ? "var(--accent2)"
                        : "var(--accent)",
                  backdropFilter: "blur(22px)",
                  WebkitBackdropFilter: "blur(22px)",
                }}
              >
                {j.type === "work"
                  ? "work"
                  : j.type === "break"
                    ? "favorite"
                    : "school"}
              </span>

              <motion.section
                whileHover={{ y: -3 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className="flex-1 p-5 md:p-7"
                style={{
                  minWidth: 0,
                  background: "var(--tile)",
                  border: "1px solid var(--line)",
                  borderRadius: 22,
                  backdropFilter: "blur(22px)",
                  WebkitBackdropFilter: "blur(22px)",
                }}
              >
                <span
                  className="block"
                  style={{
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 12,
                    color: "var(--fg2)",
                  }}
                >
                  {j.period}
                </span>
                <h3
                  className="text-[18px] md:text-[20px]"
                  style={{
                    margin: "8px 0 4px",
                    fontWeight: 600,
                    letterSpacing: "-.015em",
                  }}
                >
                  {j.title}
                </h3>
                <p
                  className="text-[13px] md:text-[14px]"
                  style={{ margin: "0 0 12px", color: "var(--fg2)" }}
                >
                  {j.org}
                </p>
                <p
                  className="text-[14px] md:text-[15px]"
                  style={{ margin: 0, lineHeight: 1.65, color: "var(--fg2)" }}
                >
                  {j.body}
                </p>
              </motion.section>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </PageTransition>
  );
}
