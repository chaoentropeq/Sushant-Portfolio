import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ROUTES } from "../theme";

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

function DesktopNav({ route }: { route: string }) {
  const [open, setOpen] = useState(false);
  const [prevRoute, setPrevRoute] = useState(route);
  const ref = useClickOutside(() => setOpen(false));

  if (route !== prevRoute) {
    setPrevRoute(route);
    setOpen(false);
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
              {moreRoutes.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  active={isActive(route, item.href)}
                  stacked
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function MobileNav({ route }: { route: string }) {
  const [open, setOpen] = useState(false);
  const [prevRoute, setPrevRoute] = useState(route);
  const ref = useClickOutside(() => setOpen(false));

  if (route !== prevRoute) {
    setPrevRoute(route);
    setOpen(false);
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
            {[...primaryRoutes, ...moreRoutes].map((item) => (
              <NavLink
                key={item.href}
                item={item}
                active={isActive(route, item.href)}
                stacked
              />
            ))}
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

export function Dock({ route }: { route: string }) {
  return (
    <>
      <DesktopNav route={route} />
      <MobileNav route={route} />
    </>
  );
}
