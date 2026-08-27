import { useState } from "react";
import { motion } from "framer-motion";
import { contacts } from "../data";
import { PageHeader } from "../components/PageHeader";
import { PageTransition } from "../components/PageTransition";
import { staggerItem, staggerParent } from "../motionVariants";

const copyable = contacts.filter((c) => c.label !== "Location");

/** Just the handle/username — the part after the last "/", or before the "@" for an email. */
function usernameOf(value: string): string {
  if (value.includes("@")) return value.split("@")[0];
  const parts = value.split("/");
  return parts[parts.length - 1];
}

export function Contact() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedLabel(label);
      setTimeout(() => {
        setCopiedLabel((l) => (l === label ? null : l));
      }, 1500);
    } catch {
      // Clipboard API unavailable — the row is still a working link either way.
    }
  };

  return (
    <PageTransition>
      <PageHeader eyebrow="Contact" title="However's easiest for you." maxWidth="18ch" />

      <motion.div
        className="flex flex-col gap-3 mt-8 md:mt-9 xl:mt-10"
        style={{ maxWidth: 640 }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        <p style={{ margin: "0 0 6px", fontSize: 15, lineHeight: 1.65, color: "var(--fg2)" }}>
          Email's fastest — I reply within a day. Copy any of these, or open the link directly.
        </p>

        {copyable.map((c) => (
          <motion.div
            key={c.label}
            variants={staggerItem}
            className="flex items-center gap-3 md:gap-4"
            style={{
              padding: "14px 16px",
              borderRadius: 16,
              border: "1px solid var(--line)",
              background: "var(--tile)",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          >
            <span
              style={{
                flex: "0 0 auto",
                width: 72,
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 11,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--fg2)",
              }}
            >
              {c.label}
            </span>
            <a
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              style={{
                flex: "1 1 auto",
                minWidth: 0,
                fontWeight: 600,
                color: "var(--fg)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              <span className="md:hidden">{usernameOf(c.value)}</span>
              <span className="hidden md:inline">{c.value}</span>
            </a>
            <motion.button
              onClick={() => copy(c.label, c.value)}
              whileTap={{ scale: 0.9 }}
              aria-label={`Copy ${c.label}`}
              style={{
                flex: "0 0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: "var(--sheen)",
                color: copiedLabel === c.label ? "var(--accent)" : "var(--fg2)",
              }}
            >
              <span className="material-symbol" style={{ fontSize: 17 }}>
                {copiedLabel === c.label ? "check" : "content_copy"}
              </span>
            </motion.button>
          </motion.div>
        ))}
      </motion.div>
    </PageTransition>
  );
}
