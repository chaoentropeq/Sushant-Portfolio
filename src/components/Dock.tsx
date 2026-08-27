import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  PHASES,
  PHASE_OPTIONS,
  ROUTES,
  WEATHERS,
  type Phase,
  type Weather,
} from "../theme";

const PRIMARY_HREFS = ["#/", "#/journey", "#/projects", "#/skills"];

const primaryRoutes = PRIMARY_HREFS.map(
  (href) => ROUTES.find((r) => r.href === href)!,
);
const moreRoutes = ROUTES.filter((r) => !PRIMARY_HREFS.includes(r.href));

function isActive(route: string, href: string) {
  return (
    route === href ||
    (href === "#/" && !ROUTES.some((r) => r.href === route))
  );
}

interface SettingsProps {
  phase: Phase;
  weather: Weather;
  temp: number | null;
  phaseOverride: Phase | null;
  weatherOverride: Weather | null;
  panelOpen: boolean;
  setPanelOpen: (fn: (v: boolean) => boolean) => void;
  setPhaseOverride: (v: Phase | null) => void;
  setWeatherOverride: (v: Weather | null) => void;
}

const navLinkBase: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  height: 40,
  padding: "0 14px",
  borderRadius: 12,
  textDecoration: "none",
  whiteSpace: "nowrap",
  fontFamily: "'JetBrains Mono',monospace",
  fontSize: 12,
  letterSpacing: ".07em",
  textTransform: "uppercase",
  transition: "background .2s ease,color .2s ease",
};

function NavLink({
  item,
  active,
  stacked,
  iconOnly,
}: {
  item: (typeof ROUTES)[number];
  active: boolean;
  stacked?: boolean;
  iconOnly?: boolean;
}) {
  return (
    <a
      href={item.href}
      className="nav-link"
      aria-label={iconOnly ? item.label : undefined}
      style={{
        ...navLinkBase,
        width: iconOnly ? 40 : stacked ? "100%" : undefined,
        padding: iconOnly ? 0 : navLinkBase.padding,
        justifyContent: iconOnly ? "center" : undefined,
        gap: iconOnly ? 0 : navLinkBase.gap,
        ...(active
          ? { color: "var(--onAccent)", background: "var(--accent)" }
          : undefined),
      }}
    >
      <span
        className="material-symbol"
        style={{ fontSize: 18, flex: "0 0 auto" }}
      >
        {item.icon}
      </span>
      {!iconOnly && item.label}
    </a>
  );
}

function Divider() {
  return (
    <span
      style={{
        width: 1,
        height: 24,
        background: "var(--line)",
        flex: "0 0 auto",
      }}
    />
  );
}

function HDivider() {
  return (
    <span
      style={{
        display: "block",
        height: 1,
        background: "var(--line)",
        margin: "6px 4px",
        flex: "0 0 auto",
      }}
    />
  );
}

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [onOutside]);
  return ref;
}

const popoverPanel: CSSProperties = {
  position: "absolute",
  bottom: "calc(100% + 12px)",
  right: 0,
  display: "flex",
  flexDirection: "column",
  gap: 3,
  padding: 8,
  minWidth: 190,
  maxWidth: "calc(100vw - 36px)",
  maxHeight: "calc(100dvh - 100px)",
  overflowY: "auto",
  borderRadius: 18,
  background: "linear-gradient(var(--tile),var(--tile)),var(--bg)",
  border: "1px solid var(--line)",
  backdropFilter: "blur(28px) saturate(1.5)",
  WebkitBackdropFilter: "blur(28px) saturate(1.5)",
  boxShadow: "0 24px 50px -30px rgba(0,0,0,.7)",
  transformOrigin: "bottom right",
};

const popoverMotion = {
  initial: { opacity: 0, scale: 0.94, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.94, y: 8 },
  transition: { type: "spring", stiffness: 420, damping: 32 } as const,
};

// The settings fields swap in for the nav links inside the SAME popover
// (rather than opening a second popover beside it) — on a narrow, short
// screen there isn't room for two popovers side by side, and the shared
// panel already has a max-height + scroll for short viewports.
const panelSwapMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.16 },
};

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

function SettingsToggleRow({
  panelOpen,
  setPanelOpen,
}: Pick<SettingsProps, "panelOpen" | "setPanelOpen">) {
  return (
    <button
      onClick={() => setPanelOpen((v) => !v)}
      className="nav-link"
      style={{
        ...navLinkBase,
        width: "100%",
        border: "none",
        cursor: "pointer",
        background: "transparent",
      }}
    >
      <span className="material-symbol" style={{ fontSize: 18, flex: "0 0 auto" }}>
        {panelOpen ? "arrow_back" : "tune"}
      </span>
      Time &amp; weather
    </button>
  );
}

function SettingsFields({
  phase,
  weather,
  temp,
  phaseOverride,
  weatherOverride,
  setPhaseOverride,
  setWeatherOverride,
}: Omit<SettingsProps, "panelOpen" | "setPanelOpen">) {
  const statusLine =
    PHASES[phase].label + " · " + weather + (temp != null ? ` · ${temp}°C` : "");

  return (
    <>
      <div style={{ padding: "8px 8px 4px" }}>
        <p
          style={{
            margin: "0 0 10px",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 10,
            letterSpacing: ".1em",
            color: "var(--fg2)",
          }}
        >
          {statusLine}
        </p>

        <p
          style={{
            margin: "0 0 8px",
            fontFamily: "'JetBrains Mono',monospace",
            fontSize: 10,
            letterSpacing: ".16em",
            textTransform: "uppercase",
            color: "var(--fg2)",
          }}
        >
          Time of day
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
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
            margin: "0 0 8px",
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
      </div>
    </>
  );
}

function DesktopNav({ route, settings }: { route: string; settings: SettingsProps }) {
  const [open, setOpen] = useState(false);
  const [prevRoute, setPrevRoute] = useState(route);
  // DesktopNav and MobileNav are both mounted at once (CSS just hides
  // whichever doesn't match the breakpoint), so without this guard a click
  // inside DesktopNav's own popover reads as "outside" to MobileNav's
  // listener (and vice versa) and force-closes the shared settings panel —
  // only act when THIS nav's popover is actually the one open.
  const ref = useClickOutside(() => {
    if (!open) return;
    setOpen(false);
    settings.setPanelOpen(() => false);
  });

  if (route !== prevRoute) {
    setPrevRoute(route);
    setOpen(false);
    settings.setPanelOpen(() => false);
  }

  return (
    <nav
      className="hidden md:flex"
      data-dock="1"
      style={{
        position: "fixed",
        left: "50%",
        bottom: 22,
        transform: "translateX(-50%)",
        zIndex: 50,
        alignItems: "center",
        gap: 4,
        padding: 6,
        borderRadius: 18,
        background: "var(--tile)",
        border: "1px solid var(--line)",
        backdropFilter: "blur(30px) saturate(1.6)",
        WebkitBackdropFilter: "blur(30px) saturate(1.6)",
        boxShadow:
          "0 26px 60px -30px rgba(0,0,0,.65),0 1px 0 var(--sheen) inset",
        transition: "background 1.2s ease,border-color 1.2s ease",
      }}
    >
      <NavLink
        item={primaryRoutes[0]}
        active={isActive(route, primaryRoutes[0].href)}
        iconOnly
      />
      <Divider />
      {primaryRoutes.slice(1).map((item) => (
        <NavLink
          key={item.href}
          item={item}
          active={isActive(route, item.href)}
          iconOnly
        />
      ))}
      <Divider />

      <div ref={ref} style={{ position: "relative" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="More pages"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 12,
            border: "none",
            cursor: "pointer",
            color: open ? "var(--onAccent)" : "var(--fg2)",
            background: open ? "var(--accent)" : "transparent",
            transition: "background .2s ease,color .2s ease",
          }}
        >
          <span className="material-symbol" style={{ fontSize: 20 }}>
            more_horiz
          </span>
        </button>
        <AnimatePresence>
          {open && (
            <motion.div style={popoverPanel} {...popoverMotion}>
              <AnimatePresence mode="wait" initial={false}>
                {settings.panelOpen ? (
                  <motion.div key="settings" {...panelSwapMotion}>
                    <SettingsToggleRow
                      panelOpen={settings.panelOpen}
                      setPanelOpen={settings.setPanelOpen}
                    />
                    <SettingsFields {...settings} />
                  </motion.div>
                ) : (
                  <motion.div key="links" {...panelSwapMotion}>
                    {moreRoutes.map((item) => (
                      <NavLink
                        key={item.href}
                        item={item}
                        active={isActive(route, item.href)}
                        stacked
                      />
                    ))}
                    <HDivider />
                    <SettingsToggleRow
                      panelOpen={settings.panelOpen}
                      setPanelOpen={settings.setPanelOpen}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function MobileNav({ route, settings }: { route: string; settings: SettingsProps }) {
  const [open, setOpen] = useState(false);
  const [prevRoute, setPrevRoute] = useState(route);
  const ref = useClickOutside(() => {
    if (!open) return;
    setOpen(false);
    settings.setPanelOpen(() => false);
  });

  if (route !== prevRoute) {
    setPrevRoute(route);
    setOpen(false);
    settings.setPanelOpen(() => false);
  }

  return (
    <div
      ref={ref}
      className="md:hidden"
      style={{
        position: "fixed",
        right: 18,
        bottom: 18,
        zIndex: 50,
      }}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            style={{ ...popoverPanel, minWidth: 200 }}
            {...popoverMotion}
          >
            <AnimatePresence mode="wait" initial={false}>
              {settings.panelOpen ? (
                <motion.div key="settings" {...panelSwapMotion}>
                  <SettingsToggleRow
                    panelOpen={settings.panelOpen}
                    setPanelOpen={settings.setPanelOpen}
                  />
                  <SettingsFields {...settings} />
                </motion.div>
              ) : (
                <motion.div key="links" {...panelSwapMotion}>
                  {[...primaryRoutes, ...moreRoutes].map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      active={isActive(route, item.href)}
                      stacked
                    />
                  ))}
                  <HDivider />
                  <SettingsToggleRow
                    panelOpen={settings.panelOpen}
                    setPanelOpen={settings.setPanelOpen}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: "1px solid var(--line)",
          cursor: "pointer",
          color: "var(--fg)",
          background: "var(--tile)",
          backdropFilter: "blur(28px) saturate(1.5)",
          WebkitBackdropFilter: "blur(28px) saturate(1.5)",
          boxShadow: "0 20px 44px -26px rgba(0,0,0,.65)",
        }}
      >
        <span className="material-symbol" style={{ fontSize: 24 }}>
          {open ? "close" : "menu"}
        </span>
      </button>
    </div>
  );
}

export function Dock({
  route,
  ...settings
}: { route: string } & SettingsProps) {
  return (
    <>
      <DesktopNav route={route} settings={settings} />
      <MobileNav route={route} settings={settings} />
    </>
  );
}
