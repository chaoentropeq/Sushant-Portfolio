import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PROJECT_SLIDES, type Phase, type Weather } from "../theme";
import { contacts } from "../data";
import { SkillsStack } from "../components/SkillsStack";
import { PageTransition } from "../components/PageTransition";
import { staggerItem, staggerParent } from "../motionVariants";
import { skillIconUrl } from "../skillIcons";
import handWave from "../assets/HandWave.png";
import resumeUrl from "../assets/Sushant_Resume.pdf?url";
import splititDesktop from "../assets/Split-it-images/splitit-desktop.jpeg";

interface SocialLink {
  label: string;
  href: string;
  icon?: string;
  symbol?: string;
}

const socialLinks: SocialLink[] = [
  {
    label: "GitHub",
    href: contacts.find((c) => c.label === "GitHub")!.href,
    icon: skillIconUrl("github"),
  },
  {
    label: "LinkedIn",
    href: contacts.find((c) => c.label === "LinkedIn")!.href,
    icon: skillIconUrl("linkedin"),
  },
  {
    label: "Email",
    href: contacts.find((c) => c.label === "Email")!.href,
    symbol: "mail",
  },
];

const easeOut = [0.16, 1, 0.3, 1] as const;
const springLift = { type: "spring", stiffness: 300, damping: 24 } as const;

const tileBase: CSSProperties = {
  background: "var(--tile)",
  border: "1px solid var(--line)",
  borderRadius: 26,
  backdropFilter: "blur(22px) saturate(1.3)",
  WebkitBackdropFilter: "blur(22px)",
  boxShadow: "0 1px 0 var(--sheen) inset,0 30px 60px -44px rgba(0,0,0,.55)",
};

const eyebrow: CSSProperties = {
  fontFamily: "'JetBrains Mono',monospace",
  fontSize: 11,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "var(--fg2)",
};

export function Home({
  phase,
  weather,
  hour,
  minute,
  motion: motionAmount,
}: {
  phase: Phase;
  weather: Weather;
  temp: number | null;
  hour: number;
  minute: number;
  motion: number;
  live: boolean;
}) {
  const [projectIndex, setProjectIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setProjectIndex((i) => (i + 1) % PROJECT_SLIDES.length);
    }, 3200);
    return () => clearInterval(id);
  }, []);

  const greeting =
    phase === "morning"
      ? "Good morning"
      : phase === "afternoon"
      ? "Good afternoon"
      : phase === "evening"
      ? "Good evening"
      : "Working late";

  const h = hour + minute / 60;
  const day = h >= 6 && h <= 20;
  const p = Math.min(Math.max((h - (day ? 6 : h < 6 ? -4 : 20)) / 14, 0), 1);
  const left = 12 + p * 72;
  const top = 58 - Math.sin(p * Math.PI) * 46;
  const orbStyle: CSSProperties = {
    position: "absolute",
    left: `${left.toFixed(1)}%`,
    top: `${top.toFixed(1)}%`,
    width: "22%",
    aspectRatio: "1",
    borderRadius: "50%",
    background: day
      ? "radial-gradient(circle at 40% 40%,#fff8e0,#ffd479)"
      : "radial-gradient(circle at 38% 36%,#ffffff,#cfd8ea)",
    boxShadow: `0 0 60px ${
      day ? "rgba(255,214,120,.85)" : "rgba(200,215,245,.55)"
    }`,
    transition: "all 2s cubic-bezier(.16,1,.3,1)",
  };

  const showClouds =
    weather === "cloudy" ||
    weather === "rain" ||
    weather === "thunder" ||
    weather === "fog" ||
    weather === "snow";
  const showHeat = weather === "heat";

  return (
    <PageTransition>
      <motion.div
        data-bento="1"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 md:gap-5 xl:gap-[18px] xl:items-stretch"
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {/* diorama — first on phone/tablet, top-right on desktop */}
        <motion.section
          variants={staggerItem}
          data-diorama-tile="1"
          whileHover={{ y: -3 }}
          transition={springLift}
          className="order-1 md:row-span-2 xl:order-none xl:col-[8/13] xl:row-[1/5] relative overflow-hidden flex flex-col gap-3 md:gap-4 xl:gap-[18px] p-4 md:p-5 xl:p-[26px]"
          style={tileBase}
        >
          <div
            data-diorama-box="1"
            className="relative rounded-[20px] overflow-hidden h-[200px] md:h-[320px] xl:h-auto xl:flex-1 xl:min-h-[280px]"
            style={{
              background:
                "linear-gradient(to bottom,var(--skyTop),var(--skyBot))",
              transition: "background 1.4s ease",
            }}
          >
            <div style={orbStyle} />
            {showClouds && (
              <>
                <div
                  style={{
                    position: "absolute",
                    top: "16%",
                    left: "-20%",
                    width: "70%",
                    height: "22%",
                    borderRadius: 100,
                    background: "rgba(255,255,255,.68)",
                    filter: "blur(14px)",
                    animation: "drift 22s ease-in-out infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "34%",
                    right: "-18%",
                    width: "62%",
                    height: "18%",
                    borderRadius: 100,
                    background: "rgba(255,255,255,.5)",
                    filter: "blur(16px)",
                    animation: "drift2 30s ease-in-out infinite",
                  }}
                />
              </>
            )}
            {showHeat && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(120% 60% at 50% 110%,rgba(255,120,40,.45),transparent 70%)",
                  animation: "shimmer 3.4s ease-in-out infinite",
                }}
              />
            )}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "34%",
                background:
                  "linear-gradient(to top,rgba(0,0,0,.22),transparent)",
              }}
            />
            <img
              src={handWave}
              alt="Sushant's memoji, waving"
              data-diorama-figure="1"
              style={{
                position: "absolute",
                left: "50%",
                bottom: 0,
                transform: "translateX(-50%)",
                height: "92%",
                width: "85%",
                objectFit: "contain",
                objectPosition: "bottom",
                filter: "drop-shadow(0 16px 20px rgba(0,0,0,.35))",
              }}
            />
            <div
              className="md:hidden absolute top-0 bottom-0 flex flex-col items-center justify-evenly"
              style={{
                right: 14,
                paddingTop: 20,
                paddingBottom: 20,
                zIndex: 2,
              }}
            >
              {socialLinks.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    s.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  aria-label={s.label}
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "var(--tile)",
                    border: "1px solid var(--line)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    boxShadow: "0 10px 22px -8px rgba(0,0,0,.5)",
                  }}
                >
                  {s.icon ? (
                    <img
                      src={s.icon}
                      alt={s.label}
                      width={20}
                      height={20}
                      draggable={false}
                    />
                  ) : (
                    <span
                      className="material-symbol"
                      style={{ fontSize: 19, color: "var(--accent)" }}
                    >
                      {s.symbol}
                    </span>
                  )}
                </motion.a>
              ))}
            </div>
          </div>
        </motion.section>

        {/* intro */}
        <motion.section
          variants={staggerItem}
          whileHover={{ y: -3 }}
          transition={springLift}
          className="order-2 md:order-4 md:col-span-2 xl:order-none xl:col-[1/8] xl:row-[1/4] p-5 md:p-6 xl:p-[38px]"
          style={tileBase}
        >
          <div className="flex flex-col md:flex-row xl:flex-col md:items-center xl:items-stretch gap-6 md:gap-8 xl:gap-0">
            <div className="flex-1">
              <p style={{ margin: "0 0 14px", ...eyebrow }}>
                {greeting} — Washington, DC
              </p>
              <h1 className="m-0 font-semibold leading-[0.98] tracking-[-0.035em] text-[clamp(1.875rem,3.8vw+0.6875rem,4.25rem)] xl:text-[clamp(2rem,5.7dvh,4.25rem)]">
                Sushant Shah <br className="hidden xl:block" />
                Kanu
              </h1>
              <p
                className="mt-4 md:mt-5 max-w-[44ch] leading-[1.5] text-[14px] sm:text-[15px] md:text-[16px] xl:text-[19px]"
                style={{ color: "var(--fg2)" }}
              >
                Software engineer. M.Eng. Computer Science at Virginia Tech. I
                build fast frontends and ship them on cloud infrastructure I can
                reason about end to end.
              </p>
            </div>
            <div className="flex flex-col xl:flex-row gap-3 mt-6 md:mt-0 xl:mt-[30px] md:w-[190px] xl:w-full">
              <motion.a
                href={resumeUrl}
                download="Sushant_Shah_Kanu_Resume.pdf"
                whileHover={{ y: -2, filter: "brightness(1.08)" }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
                className="w-full xl:w-auto xl:flex-1"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "14px 22px",
                  borderRadius: 14,
                  background: "var(--accent)",
                  color: "var(--onAccent)",
                  fontWeight: 600,
                  fontSize: 15,
                  boxShadow: "0 14px 30px -16px var(--accent)",
                }}
              >
                Download résumé
              </motion.a>
              <motion.a
                href="#/contact"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
                className="w-full xl:w-auto xl:flex-1"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "14px 22px",
                  borderRadius: 14,
                  border: "1px solid var(--line)",
                  color: "var(--fg)",
                  fontWeight: 600,
                  fontSize: 15,
                  background: "var(--sheen)",
                }}
              >
                Get in touch
              </motion.a>
            </div>
          </div>
        </motion.section>

        {/* projects preview */}
        <motion.a
          href="#/projects"
          variants={staggerItem}
          whileHover={{ y: -4 }}
          transition={springLift}
          className="order-3 md:order-5 xl:order-none xl:col-[1/5] xl:row-[4/7] relative overflow-hidden min-h-[260px] md:min-h-[300px] xl:min-h-0"
          style={{ ...tileBase, color: "var(--fg)" }}
        >
          <div style={{ position: "absolute", inset: 0 }}>
            <AnimatePresence initial={false}>
              {PROJECT_SLIDES.map((slide, i) =>
                i === projectIndex ? (
                  <motion.div
                    key={slide.name}
                    initial={{ opacity: 0, scale: 1.06 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.06 }}
                    transition={{ duration: 1.1, ease: easeOut }}
                    style={{ position: "absolute", inset: 0 }}
                  >
                    {slide.name === "SplitIt" ? (
                      <>
                        <img
                          src={splititDesktop}
                          alt=""
                          style={{
                            position: "absolute",
                            inset: 0,
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            objectPosition: "top",
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: `linear-gradient(135deg,${slide.tint}40,transparent 60%)`,
                          }}
                        />
                      </>
                    ) : (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: `linear-gradient(135deg,${slide.tint}55,transparent 62%),repeating-linear-gradient(45deg,var(--sheen),var(--sheen) 11px,transparent 11px,transparent 22px)`,
                        }}
                      />
                    )}
                  </motion.div>
                ) : null
              )}
            </AnimatePresence>
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to top,var(--bg) 4%,transparent 62%)",
                opacity: 0.94,
              }}
            />
          </div>
          <div className="relative h-full flex flex-col justify-between p-4 md:p-5 xl:p-[26px]">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <span style={eyebrow}>Projects</span>
              <span style={{ display: "flex", gap: 6 }}>
                {PROJECT_SLIDES.map((slide, i) => (
                  <motion.span
                    key={slide.name}
                    animate={{
                      width: i === projectIndex ? 18 : 6,
                      backgroundColor:
                        i === projectIndex ? "var(--accent)" : "var(--line)",
                    }}
                    transition={{ duration: 0.5, ease: easeOut }}
                    style={{ height: 6, borderRadius: 99 }}
                  />
                ))}
              </span>
            </div>
            <div>
              <span
                style={{
                  display: "block",
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11,
                  color: "var(--fg2)",
                  marginBottom: 6,
                }}
              >
                {PROJECT_SLIDES[projectIndex].stack}
              </span>
              <span className="block font-semibold leading-[1.1] tracking-[-0.025em] text-[20px] md:text-[22px] xl:text-[26px]">
                {PROJECT_SLIDES[projectIndex].name}
              </span>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 14,
                  fontSize: 14,
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                See all projects →
              </span>
            </div>
          </div>
        </motion.a>

        {/* skills — stacked icon pile */}
        <motion.a
          href="#/skills"
          variants={staggerItem}
          whileHover={{ y: -3 }}
          transition={springLift}
          className="order-4 md:order-6 xl:order-none xl:col-[5/8] xl:row-[4/7] relative overflow-hidden min-h-[260px] md:min-h-[300px] xl:min-h-0"
          style={{ ...tileBase, color: "var(--fg)" }}
        >
          <div
            style={{
              position: "absolute",
              top: 22,
              left: 24,
              right: 24,
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <span style={eyebrow}>Skills</span>
            <span
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 11,
              }}
            >
              all →
            </span>
          </div>
          <SkillsStack motionAmount={motionAmount} />
        </motion.a>

        {/* open to */}
        <motion.a
          href="#/contact"
          variants={staggerItem}
          whileHover={{ y: -3 }}
          transition={springLift}
          className="order-5 hidden md:order-3 md:flex xl:order-none xl:col-[8/13] xl:row-[5/6] items-center justify-between gap-4 px-5 md:px-6 xl:px-[26px] py-5 xl:py-0"
          style={{
            color: "var(--fg)",
            background: "var(--tile)",
            border: "1px solid var(--line)",
            borderRadius: 22,
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
          }}
        >
          <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span style={eyebrow}>Open to</span>
            <span className="font-semibold tracking-[-0.02em] text-[16px] md:text-[17px] xl:text-[19px]">
              SWE · Cloud · Architect
            </span>
          </span>
          <span
            className="material-symbol"
            style={{ fontSize: 22, color: "var(--accent)" }}
          >
            arrow_outward
          </span>
        </motion.a>

        {/* socials */}
        <motion.div
          variants={staggerItem}
          className="order-6 hidden md:order-2 md:flex xl:order-none xl:col-[8/13] xl:row-[6/7] items-stretch gap-3 xl:gap-[14px]"
        >
          {socialLinks.map((s) => (
            <motion.a
              key={s.label}
              href={s.href}
              target={s.href.startsWith("http") ? "_blank" : undefined}
              rel={
                s.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              whileHover={{ y: -3 }}
              transition={springLift}
              className="flex-1 flex items-center justify-center px-3 py-5 xl:py-0"
              aria-label={s.label}
              style={{
                color: "var(--fg)",
                background: "var(--tile)",
                border: "1px solid var(--line)",
                borderRadius: 22,
                backdropFilter: "blur(22px)",
                WebkitBackdropFilter: "blur(22px)",
              }}
            >
              {s.icon ? (
                <img
                  src={s.icon}
                  alt={s.label}
                  width={34}
                  height={34}
                  draggable={false}
                />
              ) : (
                <span
                  className="material-symbol"
                  style={{ fontSize: 34, color: "var(--accent)" }}
                >
                  {s.symbol}
                </span>
              )}
            </motion.a>
          ))}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
