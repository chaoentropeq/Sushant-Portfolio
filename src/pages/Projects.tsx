import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { splitItLink, splitItStack, otherProjects } from "../data";
import { PageHeader } from "../components/PageHeader";
import { staggerItem, staggerParent } from "../motionVariants";
import { SKILL_ICON_SLUGS, skillIconUrl } from "../skillIcons";
import splititDesktopHome from "../assets/Split-it-images/splitit-desktop.jpeg";
import splititUploadBill from "../assets/Split-it-images/Split-It-upload-bill.jpeg";
import splititAddBill from "../assets/Split-it-images/Split-It-add-bill(wbill).jpeg";
import splititAssignShare from "../assets/Split-it-images/Split-It-assign-share.jpeg";
import splititDesktopSplitConfirmed from "../assets/Split-it-images/Split-It-desktop-split-confirmerd.jpeg";
import splititMobileHome from "../assets/Split-it-images/splitit-mobile-home.jpeg";
import splititMobileSplitConfirmed from "../assets/Split-it-images/splitit-mobile-split-confirmed.jpeg";

const HEADER_GAP = 40;
const STACK_BASE_TOP_FALLBACK = 200;
const STACK_PEEK = 78;
const STACK_BOTTOM_OVERSHOOT = 120;
const OFFSCREEN_Y = 1200;
const SCROLL_SENSITIVITY = 1 / 500;
const CONTENT_MAX_WIDTH = 1180;
const CONTENT_SIDE_PADDING = 22;
// Phones (either orientation) are always narrow enough that the stacking
// mechanic doesn't fit — 767px is the conventional phone/tablet boundary.
// Tablets are tall enough to use the stack in portrait; it's specifically
// landscape tablets (wide but short) where it breaks down, so that case is
// keyed off orientation + a height cap rather than width.
const NARROW_QUERY = "(max-width: 767px)";
const LANDSCAPE_SHORT_QUERY = "(orientation: landscape) and (max-height: 900px)";
const SWIPE_PAGE_THRESHOLD = 70;
const SCREENSHOT_CYCLE_INTERVAL = 3200;
const STACK_ICON_FALLBACKS: Record<string, string> = { "Gemini API": "auto_awesome" };

interface Shot {
  src: string;
  label: string;
}

interface ProjectData {
  name: string;
  meta?: string;
  body: string;
  stack: string[];
  link?: string;
  linkLabel?: string;
  images: Shot[];
}

const projects: ProjectData[] = [
  {
    name: "SplitIt",
    meta: "10+ active daily users",
    body: "Create a group, photograph the bill, split it fairly. The Gemini API parses line items straight out of the image, so nobody types a receipt in by hand. A relational schema in MySQL handles accounts and records the splits, served through a secure, serverless REST API on AWS Lambda and API Gateway.",
    stack: splitItStack,
    link: splitItLink,
    linkLabel: "Live site",
    images: [
      // "Desktop" is the cycle pool used for the large-screen hero shot —
      // tablet viewports reuse it too, since no tablet-specific shots exist
      // yet. "Landing"/"Mobile" are the phone-sized pool.
      { src: splititDesktopHome, label: "Desktop" },
      { src: splititUploadBill, label: "Desktop" },
      { src: splititAddBill, label: "Desktop" },
      { src: splititAssignShare, label: "Desktop" },
      { src: splititDesktopSplitConfirmed, label: "Desktop" },
      { src: splititMobileHome, label: "Landing" },
      { src: splititMobileSplitConfirmed, label: "Mobile" },
    ],
  },
  ...otherProjects.map((p) => ({
    name: p.name,
    body: p.body,
    stack: p.stack,
    link: p.link,
    linkLabel: p.linkLabel,
    images: [] as Shot[],
  })),
];

function clampNum(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function useViewportSize() {
  const [size, setSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 375,
    height: typeof window !== "undefined" ? window.innerHeight : 700,
  }));
  useEffect(() => {
    const onResize = () =>
      setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return size;
}

function StackChip({ tech, compact }: { tech: string; compact?: boolean }) {
  const slug = SKILL_ICON_SLUGS[tech];
  const fallbackIcon = STACK_ICON_FALLBACKS[tech];
  if (compact) {
    return (
      <span
        title={tech}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 26,
          height: 26,
          borderRadius: 99,
          flex: "0 0 auto",
          border: "1px solid var(--line)",
          background: "var(--sheen)",
        }}
      >
        {slug ? (
          <img src={skillIconUrl(slug)} alt={tech} width={14} height={14} draggable={false} />
        ) : fallbackIcon ? (
          <span className="material-symbol" style={{ fontSize: 13, color: "var(--accent)" }}>
            {fallbackIcon}
          </span>
        ) : null}
      </span>
    );
  }
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        padding: "6px 12px",
        borderRadius: 99,
        border: "1px solid var(--line)",
        background: "var(--sheen)",
        fontFamily: "'JetBrains Mono',monospace",
        fontSize: 11,
        whiteSpace: "nowrap",
      }}
    >
      {slug ? (
        <img src={skillIconUrl(slug)} alt="" width={14} height={14} draggable={false} />
      ) : fallbackIcon ? (
        <span className="material-symbol" style={{ fontSize: 14, color: "var(--accent)" }}>
          {fallbackIcon}
        </span>
      ) : null}
      {tech}
    </span>
  );
}

/** Crossfades through `shots` on a loop; a single static image if there's only one. */
function CyclingImage({
  shots,
  alt,
  style,
}: {
  shots: Shot[];
  alt: string;
  style: React.CSSProperties;
}) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (shots.length < 2) return;
    setI(0);
    const id = setInterval(() => setI((v) => (v + 1) % shots.length), SCREENSHOT_CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, [shots]);

  if (shots.length === 0) return null;
  if (shots.length < 2) {
    return <img src={shots[0].src} alt={alt} style={style} />;
  }

  return (
    <AnimatePresence>
      <motion.img
        key={shots[i].src}
        src={shots[i].src}
        alt={alt}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        style={style}
      />
    </AnimatePresence>
  );
}

/* ---------------------------------------------------------------------- */
/* Desktop / tall-viewport: scroll-jacked stacking cards                   */
/* ---------------------------------------------------------------------- */

interface DeviceFrameProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
}

function PhoneFrame({ src, alt, style }: DeviceFrameProps) {
  return (
    <div
      style={{
        position: "absolute",
        padding: 8,
        borderRadius: 28,
        background: "var(--fig)",
        boxShadow: "0 30px 55px -26px rgba(0,0,0,.55)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 20,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 7,
            left: "50%",
            transform: "translateX(-50%)",
            width: "32%",
            height: 9,
            borderRadius: 99,
            background: "var(--fig)",
            zIndex: 2,
          }}
        />
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
        />
      </div>
    </div>
  );
}

function TabletFrame({ src, alt, style }: DeviceFrameProps) {
  return (
    <div
      style={{
        position: "absolute",
        padding: 10,
        borderRadius: 20,
        background: "var(--fig)",
        boxShadow: "0 30px 55px -26px rgba(0,0,0,.55)",
        ...style,
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 5,
          left: "50%",
          transform: "translateX(-50%)",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "rgba(255,255,255,.35)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: 11,
          overflow: "hidden",
          background: "#000",
        }}
      >
        <img
          src={src}
          alt={alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center" }}
        />
      </div>
    </div>
  );
}

function StackedProjectCard({
  project,
  index,
  progress,
  top,
}: {
  project: ProjectData;
  index: number;
  progress: MotionValue<number>;
  top: number;
}) {
  // Each card has its own fixed top/height (shorter than the one it stacks
  // on, see DesktopProjectStack) so a settled card never has to move to
  // reveal its sliver — the only motion is sliding up from off-screen into
  // that fixed resting spot the first time it's revealed.
  const y = useTransform(progress, [index - 1, index], [OFFSCREEN_Y, 0]);

  return (
    <motion.div
      style={{
        position: "fixed",
        top,
        left: "50%",
        x: "-50%",
        y,
        width: `min(calc(100vw - ${CONTENT_SIDE_PADDING * 2}px),${CONTENT_MAX_WIDTH}px)`,
        height: `calc(100dvh - ${top}px + ${STACK_BOTTOM_OVERSHOOT}px)`,
        zIndex: 10 + index,
        borderRadius: 26,
        border: "1px solid var(--line)",
        background: "var(--tile)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        boxShadow: "0 1px 0 var(--sheen) inset,0 50px 90px -50px rgba(0,0,0,.55)",
        display: "flex",
        flexDirection: "column",
        padding: "26px 28px 28px",
        gap: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
          <h2
            style={{
              margin: 0,
              fontWeight: 600,
              letterSpacing: "-.02em",
              fontSize: "clamp(1.375rem,1vw + 1.125rem,1.875rem)",
            }}
          >
            {project.name}
          </h2>
          {project.meta && (
            <span
              style={{
                fontFamily: "'JetBrains Mono',monospace",
                fontSize: 11,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--fg2)",
              }}
            >
              {project.meta}
            </span>
          )}
        </div>
        {project.link && (
          <motion.a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 12,
              background: "var(--accent)",
              color: "var(--onAccent)",
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: "nowrap",
              flex: "0 0 auto",
            }}
          >
            {project.linkLabel ?? "Live site"}
            <span className="material-symbol" style={{ fontSize: 16 }}>
              arrow_outward
            </span>
          </motion.a>
        )}
      </div>

      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--fg)", maxWidth: "62ch" }}>
        {project.body}
      </p>

      <motion.div
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
        variants={staggerParent}
        initial="hidden"
        animate="show"
      >
        {project.stack.map((t) => (
          <motion.div key={t} variants={staggerItem}>
            <StackChip tech={t} />
          </motion.div>
        ))}
      </motion.div>

      <div style={{ flex: "1 1 auto", minHeight: 0, position: "relative" }}>
        {project.images.length > 0 ? (
          <div style={{ position: "relative", height: "100%" }}>
            <CyclingImage
              shots={project.images.filter((s) => s.label === "Desktop")}
              alt={`${project.name} — desktop`}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top center",
                borderRadius: 18,
                border: "1px solid var(--line)",
              }}
            />
            {project.images.find((s) => s.label === "Landing") && (
              <PhoneFrame
                src={project.images.find((s) => s.label === "Landing")!.src}
                alt={`${project.name} — phone`}
                style={{
                  bottom: "3%",
                  right: "23%",
                  width: "min(15%,165px)",
                  aspectRatio: "9/19",
                  transform: "rotate(-5deg)",
                }}
              />
            )}
            {project.images.find((s) => s.label === "Mobile") && (
              <TabletFrame
                src={project.images.find((s) => s.label === "Mobile")!.src}
                alt={`${project.name} — tablet`}
                style={{
                  bottom: "-3%",
                  right: "1%",
                  width: "min(23%,245px)",
                  aspectRatio: "3/4",
                  transform: "rotate(4deg)",
                }}
              />
            )}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              border: "1px dashed var(--line)",
              borderRadius: 18,
              color: "var(--fg2)",
              fontFamily: "'JetBrains Mono',monospace",
              fontSize: 12,
            }}
          >
            screenshots coming soon
          </div>
        )}
      </div>
    </motion.div>
  );
}

function DesktopProjectStack() {
  const headerRef = useRef<HTMLDivElement>(null);
  const [baseTop, setBaseTop] = useState(STACK_BASE_TOP_FALLBACK);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () =>
      setBaseTop(Math.round(el.getBoundingClientRect().bottom + HEADER_GAP));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const rawProgress = useMotionValue(0);
  const progress = useSpring(rawProgress, { stiffness: 260, damping: 32, mass: 0.9 });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const maxProgress = projects.length - 1;

    const applyDelta = (delta: number) => {
      const p = rawProgress.get();
      const np = Math.max(0, Math.min(maxProgress, p + delta * SCROLL_SENSITIVITY));
      rawProgress.set(np);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      applyDelta(e.deltaY);
    };

    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0].clientY;
      applyDelta((touchStartY - y) * 2.2);
      touchStartY = y;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        e.preventDefault();
        applyDelta(160);
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        e.preventDefault();
        applyDelta(-160);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [rawProgress]);

  return (
    <div style={{ position: "relative" }}>
      <div ref={headerRef}>
        <PageHeader eyebrow="Projects" title="Things I've built end to end" maxWidth="20ch" />
      </div>

      {projects.map((p, i) => (
        <StackedProjectCard
          key={p.name}
          project={p}
          index={i}
          progress={progress}
          top={baseTop + i * STACK_PEEK}
        />
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------- */
/* Phone / short-landscape-tablet: intro fan → full-screen swipe carousel  */
/* ---------------------------------------------------------------------- */

const FADE_SCRIM =
  "linear-gradient(to top,var(--bg) 0%,var(--bg) 34%,transparent 100%)";

const NO_SCREENSHOT = (
  <div
    style={{
      position: "absolute",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "var(--fg2)",
      fontFamily: "'JetBrains Mono',monospace",
      fontSize: 11,
      textAlign: "center",
      padding: 16,
    }}
  >
    screenshots coming soon
  </div>
);

const SHOT_IMG_STYLE: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  objectPosition: "top center",
};

/**
 * Fan cards (the decorative deck, and a project that isn't the one being
 * looked at) show a single static shot — the landing page. Once a project
 * is actually open (`cycle`), it loops through its mobile screenshots.
 */
function ProjectScreenshot({ project, cycle }: { project: ProjectData; cycle?: boolean }) {
  const pool = project.images.filter((s) => s.label === "Landing" || s.label === "Mobile");
  const staticShot =
    project.images.find((s) => s.label === "Landing") ??
    project.images.find((s) => s.label === "Mobile") ??
    project.images[0];

  const [i, setI] = useState(0);
  useEffect(() => {
    if (!cycle || pool.length < 2) return;
    setI(0);
    const id = setInterval(() => setI((v) => (v + 1) % pool.length), SCREENSHOT_CYCLE_INTERVAL);
    return () => clearInterval(id);
  }, [cycle, project.name, pool.length]);

  if (!cycle || pool.length < 2) {
    if (!staticShot) return NO_SCREENSHOT;
    return <img src={staticShot.src} alt="" style={SHOT_IMG_STYLE} />;
  }

  return (
    <AnimatePresence>
      <motion.img
        key={pool[i].src}
        src={pool[i].src}
        alt=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
        style={SHOT_IMG_STYLE}
      />
    </AnimatePresence>
  );
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir >= 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir >= 0 ? -40 : 40, opacity: 0 }),
};

function MobileProjectShowcase() {
  const { width: vw, height: vh } = useViewportSize();

  // Tall, near-identical rectangles fanned out from a single pivot point
  // sitting just below the bottom edge — the fan's own overflow:hidden
  // clips each card's bottom (and rounded corner) so they read as anchored
  // to the bottom of the screen, nudging the user to scroll to free them.
  // Width is derived from height at a fixed ratio (not computed from vw
  // separately) so the card always reads as "tall with good width" rather
  // than needle-thin or squat, at any viewport size.
  const fanHeight = clampNum(vh * 0.58, 300, 420);
  const fanWidth = clampNum(fanHeight * 0.64, 175, 250);
  const peekFraction = 0.58;
  const pivotX = vw / 2;
  const pivotY = vh + fanHeight * (1 - peekFraction);
  const fanLeft0 = pivotX - fanWidth / 2;
  const fanTop0 = pivotY - fanHeight;

  // Narrower phones fan out wider (so three tall cards nearly span the
  // screen); wide short-landscape tablets fan out gently so the cards
  // don't look chunky or oversized.
  const widthT = clampNum((vw - 375) / (1279 - 375), 0, 1);
  const fanAngle = 15 - 6 * widthT;

  const rawGrowth = useMotionValue(0);
  const growth = useSpring(rawGrowth, { stiffness: 220, damping: 30, mass: 0.9 });

  const [[activeIndex, direction], setActiveState] = useState<[number, number]>([0, 0]);
  const [isOpen, setIsOpen] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const hasHintedRef = useRef(false);

  const paginate = useCallback((dir: number) => {
    setActiveState(([i]) => [(i + dir + projects.length) % projects.length, dir]);
    setShowSwipeHint(false);
  }, []);

  useEffect(() => {
    const unsub = growth.on("change", (v) => setIsOpen(v >= 0.999));
    return unsub;
  }, [growth]);

  useEffect(() => {
    if (!isOpen || hasHintedRef.current || projects.length < 2) return;
    hasHintedRef.current = true;
    setShowSwipeHint(true);
    const t = setTimeout(() => setShowSwipeHint(false), 2800);
    return () => clearTimeout(t);
  }, [isOpen]);

  const left = useTransform(growth, (g) => fanLeft0 * (1 - g));
  const top = useTransform(growth, (g) => fanTop0 * (1 - g));
  const width = useTransform(growth, (g) => fanWidth + (vw - fanWidth) * g);
  const height = useTransform(growth, (g) => fanHeight + (vh - fanHeight) * g);
  const rotate = useTransform(growth, (g) => -fanAngle * (1 - g));
  const radius = useTransform(growth, (g) => 26 - 26 * g);

  const detailOpacity = useTransform(growth, [0.55, 0.95], [0, 1]);
  const introOpacity = useTransform(growth, [0, 0.3], [1, 0]);
  const introY = useTransform(growth, [0, 0.3], [0, -16]);
  const backOpacity = useTransform(growth, [0, 0.35], [1, 0]);
  const backScale = useTransform(growth, [0, 0.4], [1, 0.85]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    let axisLock: "x" | "y" | null = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let horizontalAccum = 0;

    const inProject = () => rawGrowth.get() >= 0.999;

    const applyVertical = (delta: number) => {
      const next = clampNum(rawGrowth.get() + delta / 600, 0, 1);
      rawGrowth.set(next);
      if (next <= 0.001) {
        setActiveState((prev) => (prev[0] === 0 && prev[1] === 0 ? prev : [0, 0]));
      }
    };

    const applyHorizontal = (deltaX: number) => {
      if (!inProject()) return;
      horizontalAccum += deltaX;
      if (Math.abs(horizontalAccum) > SWIPE_PAGE_THRESHOLD) {
        paginate(horizontalAccum > 0 ? 1 : -1);
        horizontalAccum = 0;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (inProject() && Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        applyHorizontal(e.deltaX);
      } else {
        applyVertical(e.deltaY);
      }
    };

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      axisLock = null;
      horizontalAccum = 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const x = e.touches[0].clientX;
      const y = e.touches[0].clientY;
      if (!axisLock) {
        if (Math.abs(x - touchStartX) > 8 || Math.abs(y - touchStartY) > 8) {
          axisLock = Math.abs(x - touchStartX) > Math.abs(y - touchStartY) ? "x" : "y";
        }
      }
      if (axisLock === "x" && inProject()) {
        const dx = x - touchStartX;
        if (Math.abs(dx) > SWIPE_PAGE_THRESHOLD) {
          paginate(dx < 0 ? 1 : -1);
          touchStartX = x;
        }
      } else if (axisLock === "y") {
        applyVertical((touchStartY - y) * 2.2);
        touchStartY = y;
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        applyVertical(160);
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        applyVertical(-160);
      } else if (e.key === "ArrowRight" && inProject()) {
        e.preventDefault();
        paginate(1);
      } else if (e.key === "ArrowLeft" && inProject()) {
        e.preventDefault();
        paginate(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [rawGrowth, paginate]);

  const active = projects[activeIndex];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 10, overflow: "hidden" }}>
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          padding: "84px 22px 0",
          opacity: introOpacity,
          y: introY,
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 11,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--fg2)",
          }}
        >
          Projects
        </p>
        <h1
          style={{
            margin: "0 0 10px",
            fontWeight: 600,
            letterSpacing: "-.03em",
            lineHeight: 1.05,
            fontSize: "clamp(1.75rem,5vw + 0.5rem,2.5rem)",
          }}
        >
          Things I've built
          <br />
          end to end
        </h1>
        <p style={{ margin: 0, fontSize: 14, color: "var(--fg2)" }}>
          Scroll to know about them.
        </p>
      </motion.div>

      {[
        { slotIndex: 2, rotateDeg: fanAngle },
        { slotIndex: 1, rotateDeg: 0 },
      ].map(({ slotIndex, rotateDeg }) => {
        const proj = projects[slotIndex];
        return (
          <motion.div
            key={slotIndex}
            style={{
              position: "absolute",
              left: fanLeft0,
              top: fanTop0,
              width: fanWidth,
              height: fanHeight,
              rotate: rotateDeg,
              transformOrigin: "50% 100%",
              opacity: backOpacity,
              scale: backScale,
              borderRadius: 22,
              border: "1px solid var(--line)",
              background: "var(--tile)",
              backdropFilter: "blur(18px)",
              WebkitBackdropFilter: "blur(18px)",
              overflow: "hidden",
            }}
          >
            {proj && (
              <>
                <ProjectScreenshot project={proj} />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "52%",
                    background: FADE_SCRIM,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    right: 14,
                    bottom: 12,
                    fontFamily: "'JetBrains Mono',monospace",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--fg)",
                  }}
                >
                  {proj.name}
                </span>
              </>
            )}
          </motion.div>
        );
      })}

      <motion.div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          rotate,
          transformOrigin: "50% 100%",
          borderRadius: radius,
          border: "1px solid var(--line)",
          background: "var(--tile)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          boxShadow: "0 1px 0 var(--sheen) inset,0 40px 80px -40px rgba(0,0,0,.55)",
          overflow: "hidden",
        }}
      >
        <AnimatePresence custom={direction} mode="popLayout" initial={false}>
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ position: "absolute", inset: 0 }}
          >
            <ProjectScreenshot project={active} cycle={isOpen} />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "60%",
                background: FADE_SCRIM,
              }}
            />

            <div
              style={{
                position: "absolute",
                left: 18,
                right: 18,
                bottom: 16,
                maxHeight: "56%",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    letterSpacing: "-.02em",
                    fontSize: "clamp(1.25rem,3vw + 0.75rem,1.75rem)",
                  }}
                >
                  {active.name}
                </h2>
                {active.link && (
                  <motion.a
                    href={active.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={active.linkLabel ?? "Live site"}
                    style={{
                      opacity: detailOpacity,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36,
                      height: 36,
                      borderRadius: 11,
                      flex: "0 0 auto",
                      background: "var(--accent)",
                      color: "var(--onAccent)",
                    }}
                  >
                    <span className="material-symbol" style={{ fontSize: 18 }}>
                      arrow_outward
                    </span>
                  </motion.a>
                )}
              </div>
              <motion.div
                style={{ opacity: detailOpacity, display: "flex", gap: 6, flexWrap: "wrap" }}
              >
                {active.stack.map((t) => (
                  <StackChip key={t} tech={t} compact />
                ))}
              </motion.div>
              <motion.p
                style={{
                  opacity: detailOpacity,
                  margin: 0,
                  fontSize: 13.5,
                  lineHeight: 1.55,
                  color: "var(--fg)",
                }}
              >
                {active.body}
              </motion.p>
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {showSwipeHint && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              style={{
                position: "absolute",
                right: 18,
                top: "30%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                pointerEvents: "none",
              }}
            >
              <motion.span
                className="material-symbol"
                animate={{ x: [14, -14, 14] }}
                transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  fontSize: 32,
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--sheen)",
                  color: "var(--fg)",
                }}
              >
                swipe
              </motion.span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono',monospace",
                  fontSize: 11,
                  letterSpacing: ".08em",
                  textTransform: "uppercase",
                  color: "var(--fg)",
                  background: "var(--sheen)",
                  padding: "6px 12px",
                  borderRadius: 99,
                }}
              >
                Swipe for next project
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {projects.length > 1 && (
          <motion.div
            style={{
              opacity: detailOpacity,
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 6,
              pointerEvents: "none",
            }}
          >
            {projects.map((p, i) => (
              <span
                key={p.name}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: i === activeIndex ? "var(--accent)" : "var(--line)",
                }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export function Projects() {
  const isNarrowPhone = useMediaQuery(NARROW_QUERY);
  const isLandscapeShort = useMediaQuery(LANDSCAPE_SHORT_QUERY);

  if (isNarrowPhone || isLandscapeShort) return <MobileProjectShowcase />;
  return <DesktopProjectStack />;
}
