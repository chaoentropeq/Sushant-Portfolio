import { useEffect, useRef } from "react";
import type { Phase, Weather } from "../theme";

interface Particle {
  x: number;
  y: number;
  r: number;
  s: number;
  /** True once this particle has been let into the diorama's photo frame instead of bouncing off its outer edge. Drawn on the front canvas, clipped to the frame, falling slowed until it either lands on the rough head/shoulders shape or reaches the frame's floor. */
  insideFrame?: boolean;
}

interface Splash {
  x: number;
  y: number;
  born: number;
}

interface Droplet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  born: number;
}

interface TileRect {
  left: number;
  right: number;
  top: number;
}

interface FrameRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

const TILE_SELECTOR = "[data-bento] > *";
const SPLASH_TTL = 300;
const DROPLET_TTL = 240;
const FRAME_ENTRY_CHANCE = 0.4;
const FRAME_SLOWDOWN = 0.45;
const FRAME_RADIUS = 20;

// A rough, hand-tuned head+shoulders bump — not traced from the actual
// image — so drops land somewhere plausible without needing pixel-perfect
// silhouette data. Only occupies the top portion of the figure's bounding
// box, so it never looks like the whole body is catching rain.
const HEAD_WIDTH_FRAC = 0.4;
const HEAD_TOP_FRAC = 0.04;
const SHOULDER_WIDTH_FRAC = 0.82;
const SHOULDER_Y_FRAC = 0.32;

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/** Pre-render a soft radial-gradient disc once so per-frame draws are cheap `drawImage` blits instead of per-particle `createRadialGradient` calls. */
function makeSoftDiscSprite(size: number, inner: string, outer: string) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const sctx = c.getContext("2d")!;
  const g = sctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, inner);
  g.addColorStop(0.45, inner);
  g.addColorStop(1, outer);
  sctx.fillStyle = g;
  sctx.beginPath();
  sctx.arc(size / 2, size / 2, size / 2, 0, 6.3);
  sctx.fill();
  return c;
}

export function SkyCanvas({
  weather,
  phase,
  motion,
}: {
  weather: Weather;
  phase: Phase;
  motion: number;
}) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);
  const liveRef = useRef({ weather, phase, motion });

  useEffect(() => {
    liveRef.current = { weather, phase, motion };
  });

  useEffect(() => {
    const back = backRef.current;
    const front = frontRef.current;
    if (!back || !front) return;
    const ctx = back.getContext("2d");
    const fctx = front.getContext("2d");
    if (!ctx || !fctx) return;

    const flakeSprite = makeSoftDiscSprite(
      48,
      "rgba(255,255,255,.95)",
      "rgba(255,255,255,0)",
    );

    let W = 0;
    let H = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const size = () => {
      W = back.clientWidth;
      H = back.clientHeight;
      for (const c of [back, front]) {
        c.width = W * dpr;
        c.height = H * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", size);
    size();

    const reduceMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let reduceMotion = reduceMotionQuery.matches;
    const onReduceMotionChange = (e: MediaQueryListEvent) => {
      reduceMotion = e.matches;
    };
    reduceMotionQuery.addEventListener("change", onReduceMotionChange);

    let tileRects: TileRect[] = [];
    let dioramaTileIndex = -1;
    let dioramaFrame: FrameRect | null = null;
    let dioramaFigure: FrameRect | null = null;
    const refreshTiles = () => {
      const els = Array.from(
        document.querySelectorAll<HTMLElement>(TILE_SELECTOR),
      );
      tileRects = els.map((el) => {
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top };
      });
      dioramaTileIndex = els.findIndex((el) =>
        el.hasAttribute("data-diorama-tile"),
      );

      const frameEl = document.querySelector<HTMLElement>(
        "[data-diorama-box]",
      );
      dioramaFrame = frameEl
        ? (() => {
            const r = frameEl.getBoundingClientRect();
            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
          })()
        : null;

      const figureEl = document.querySelector<HTMLImageElement>(
        "[data-diorama-figure]",
      );
      dioramaFigure = figureEl
        ? (() => {
            const r = figureEl.getBoundingClientRect();
            return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
          })()
        : null;
    };
    refreshTiles();

    // Tile rects otherwise only refresh every 6th animation frame (~100ms) —
    // fine for scroll, but a resize (or a breakpoint flipping the whole
    // layout) should snap the collision geometry into sync immediately
    // rather than let particles bounce off where a box used to be.
    let resizeRefreshQueued = false;
    const onResize = () => {
      if (resizeRefreshQueued) return;
      resizeRefreshQueued = true;
      requestAnimationFrame(() => {
        resizeRefreshQueued = false;
        refreshTiles();
      });
    };
    window.addEventListener("resize", onResize);

    /**
     * A rough approximate landing height at world-x `x` — a head-shaped
     * bump centered over the figure with flatter "shoulders" either side,
     * confined to the top ~third of the figure's bounding box. Returns null
     * outside the shoulder span entirely, so drops there just fall through
     * to the frame floor instead of bouncing on empty space.
     */
    const roughLandY = (x: number): number | null => {
      if (!dioramaFigure) return null;
      const width = dioramaFigure.right - dioramaFigure.left;
      if (width <= 0) return null;
      const frac = (x - dioramaFigure.left) / width;
      const shoulderHalf = SHOULDER_WIDTH_FRAC / 2;
      if (frac < 0.5 - shoulderHalf || frac > 0.5 + shoulderHalf) return null;

      const figH = dioramaFigure.bottom - dioramaFigure.top;
      const headHalf = HEAD_WIDTH_FRAC / 2;
      if (frac >= 0.5 - headHalf && frac <= 0.5 + headHalf) {
        const t = (frac - (0.5 - headHalf)) / HEAD_WIDTH_FRAC;
        const domeFrac =
          SHOULDER_Y_FRAC - (SHOULDER_Y_FRAC - HEAD_TOP_FRAC) * Math.sin(t * Math.PI);
        return dioramaFigure.top + domeFrac * figH;
      }
      return dioramaFigure.top + SHOULDER_Y_FRAC * figH;
    };

    const findTileHit = (x: number, prevY: number, nextY: number) => {
      for (let i = 0; i < tileRects.length; i++) {
        const t = tileRects[i];
        if (x >= t.left && x <= t.right && prevY <= t.top && nextY > t.top) {
          return i;
        }
      }
      return -1;
    };

    let parts: Particle[] = [];
    let kind: Weather | null = null;
    let flash = 0;
    let t0 = performance.now();
    let frameCount = 0;
    let raf = 0;
    const splashes: Splash[] = [];
    const droplets: Droplet[] = [];

    const seed = (n: number) => {
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random(),
        s: Math.random(),
      }));
    };

    const drawOverlay = (now: number, dt: number) => {
      fctx.clearRect(0, 0, W, H);

      for (let i = splashes.length - 1; i >= 0; i--) {
        const s = splashes[i];
        const progress = (now - s.born) / SPLASH_TTL;
        if (progress >= 1) {
          splashes.splice(i, 1);
          continue;
        }
        const grow = easeOutCubic(progress);
        const radius = 2 + grow * 7;
        const alpha = Math.pow(1 - progress, 1.6) * 0.5;
        fctx.strokeStyle = `rgba(215,228,248,${alpha})`;
        fctx.lineWidth = 1.1;
        fctx.beginPath();
        fctx.ellipse(s.x, s.y, radius, radius * 0.38, 0, 0, 6.3);
        fctx.stroke();
      }

      for (let i = droplets.length - 1; i >= 0; i--) {
        const d = droplets[i];
        const age = now - d.born;
        if (age > DROPLET_TTL) {
          droplets.splice(i, 1);
          continue;
        }
        d.vy += 0.006 * dt;
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        const k = 1 - age / DROPLET_TTL;
        fctx.fillStyle = `rgba(215,228,248,${0.65 * k})`;
        fctx.beginPath();
        fctx.arc(d.x, d.y, 1.1 * k + 0.4, 0, 6.3);
        fctx.fill();
      }
    };

    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const { weather: w, motion: m, phase: p } = liveRef.current;

      if (reduceMotion && w === kind) return;

      const dt = Math.min(now - t0, 40);
      t0 = now;
      frameCount++;
      if (frameCount % 6 === 0) refreshTiles();

      if (w !== kind) {
        kind = w;
        seed(
          w === "rain"
            ? Math.round(220 * m) + 40
            : w === "thunder"
              ? Math.round(300 * m) + 60
              : w === "snow"
                ? Math.round(140 * m) + 30
                : w === "fog"
                  ? 9
                  : w === "heat"
                    ? 26
                    : 0,
        );
      }
      ctx.clearRect(0, 0, W, H);
      drawOverlay(now, dt);
      if (!parts.length) return;

      if (w === "rain" || w === "thunder") {
        const outerColor =
          p === "night" || p === "evening"
            ? "rgba(200,220,255,.42)"
            : "rgba(70,90,120,.30)";
        const v = (w === "thunder" ? 1.5 : 1) * (0.6 + m);
        ctx.strokeStyle = outerColor;
        ctx.lineWidth = 0.9 + v * 0.35;

        const frameClipped = !!dioramaFrame;
        if (dioramaFrame) {
          fctx.save();
          fctx.beginPath();
          fctx.roundRect(
            dioramaFrame.left,
            dioramaFrame.top,
            dioramaFrame.right - dioramaFrame.left,
            dioramaFrame.bottom - dioramaFrame.top,
            FRAME_RADIUS,
          );
          fctx.clip();
          fctx.strokeStyle = outerColor;
          fctx.lineWidth = 0.9 + v * FRAME_SLOWDOWN * 0.35;
        }

        parts.forEach((pt) => {
          const len = (12 + pt.s * 22) * (0.75 + v * 0.28);

          if (pt.insideFrame) {
            if (!dioramaFrame) {
              pt.insideFrame = false;
              pt.y = -30;
              pt.x = Math.random() * W;
              return;
            }
            const innerLen = len * 0.6;
            fctx.beginPath();
            fctx.moveTo(pt.x, pt.y);
            fctx.lineTo(pt.x - 2.2, pt.y + innerLen);
            fctx.stroke();
            const prevTip = pt.y + innerLen;
            const iv = v * FRAME_SLOWDOWN;
            pt.y += (0.55 + pt.s * 0.75) * dt * iv;
            pt.x -= 0.09 * dt * iv;
            const nextTip = pt.y + innerLen;
            const surfaceY = roughLandY(pt.x);
            const hitsShape =
              surfaceY !== null && prevTip <= surfaceY && nextTip > surfaceY;
            const hitsFloor = pt.y > dioramaFrame.bottom;
            if (hitsShape || hitsFloor) {
              // Only a floor landing bounces — a drop landing mid-way on the
              // rough head/shoulders shape just disappears, no splash.
              if (hitsFloor) {
                splashes.push({ x: pt.x, y: dioramaFrame.bottom, born: now });
                const dropletCount = 1 + Math.floor(Math.random() * 2);
                for (let d = 0; d < dropletCount; d++) {
                  droplets.push({
                    x: pt.x,
                    y: dioramaFrame.bottom,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: -(0.18 + Math.random() * 0.16),
                    born: now,
                  });
                }
              }
              pt.insideFrame = false;
              pt.y = -30;
              pt.x = Math.random() * W;
            }
            return;
          }

          ctx.beginPath();
          ctx.moveTo(pt.x, pt.y);
          ctx.lineTo(pt.x - 2.2, pt.y + len);
          ctx.stroke();
          const prevTip = pt.y + len;
          pt.y += (0.55 + pt.s * 0.75) * dt * v;
          pt.x -= 0.09 * dt * v;
          const nextTip = pt.y + len;
          const hit = findTileHit(pt.x, prevTip, nextTip);
          if (hit !== -1) {
            if (
              hit === dioramaTileIndex &&
              dioramaFrame &&
              Math.random() < FRAME_ENTRY_CHANCE
            ) {
              pt.insideFrame = true;
              pt.y = dioramaFrame.top + 1;
              return;
            }
            splashes.push({ x: pt.x, y: tileRects[hit].top, born: now });
            const dropletCount = 2 + Math.floor(Math.random() * 2);
            for (let d = 0; d < dropletCount; d++) {
              droplets.push({
                x: pt.x,
                y: tileRects[hit].top,
                vx: (Math.random() - 0.5) * 0.6,
                vy: -(0.28 + Math.random() * 0.22),
                born: now,
              });
            }
            pt.y = -30;
            pt.x = Math.random() * W;
          } else if (pt.y > H) {
            pt.y = -30;
            pt.x = Math.random() * W;
          }
        });

        if (frameClipped) fctx.restore();

        if (w === "thunder") {
          flash -= dt;
          if (flash < -1400 && Math.random() < 0.02) flash = 130;
          if (flash > 0) {
            ctx.fillStyle = `rgba(220,235,255,${(flash / 130) * 0.18})`;
            ctx.fillRect(0, 0, W, H);
          }
        }
      } else if (w === "snow") {
        const frameClipped = !!dioramaFrame;
        if (dioramaFrame) {
          fctx.save();
          fctx.beginPath();
          fctx.roundRect(
            dioramaFrame.left,
            dioramaFrame.top,
            dioramaFrame.right - dioramaFrame.left,
            dioramaFrame.bottom - dioramaFrame.top,
            FRAME_RADIUS,
          );
          fctx.clip();
        }

        parts.forEach((pt) => {
          if (pt.insideFrame) {
            if (!dioramaFrame) {
              pt.insideFrame = false;
              pt.y = -10;
              pt.x = Math.random() * W;
              return;
            }
            const drift =
              Math.sin(now / 1400 + pt.r * 9) * 6 +
              Math.sin(now / 470 + pt.r * 23) * 2;
            const drawX = pt.x + drift;
            const twinkle = 0.55 + Math.sin(now / 650 + pt.r * 17) * 0.2;
            const d = (1 + pt.s * 2.4) * 3.1;
            fctx.globalAlpha = twinkle;
            fctx.drawImage(flakeSprite, drawX - d / 2, pt.y - d / 2, d, d);
            fctx.globalAlpha = 1;
            const prevY = pt.y;
            const iv = (0.6 + m) * FRAME_SLOWDOWN;
            pt.y += (0.03 + pt.s * 0.06) * dt * iv;
            const surfaceY = roughLandY(drawX);
            const hitsShape =
              surfaceY !== null && prevY <= surfaceY && pt.y > surfaceY;
            if (hitsShape || pt.y > dioramaFrame.bottom) {
              pt.insideFrame = false;
              pt.y = -10;
              pt.x = Math.random() * W;
            }
            return;
          }

          const drift =
            Math.sin(now / 1400 + pt.r * 9) * 14 +
            Math.sin(now / 470 + pt.r * 23) * 5;
          const drawX = pt.x + drift;
          const twinkle = 0.55 + Math.sin(now / 650 + pt.r * 17) * 0.2;
          const d = (1 + pt.s * 2.4) * 3.1;
          ctx.globalAlpha = twinkle;
          ctx.drawImage(flakeSprite, drawX - d / 2, pt.y - d / 2, d, d);
          ctx.globalAlpha = 1;
          const prevY = pt.y;
          pt.y += (0.03 + pt.s * 0.06) * dt * (0.6 + m);
          const hit = findTileHit(drawX, prevY, pt.y);
          if (hit !== -1) {
            if (
              hit === dioramaTileIndex &&
              dioramaFrame &&
              Math.random() < FRAME_ENTRY_CHANCE
            ) {
              pt.insideFrame = true;
              pt.y = dioramaFrame.top + 1;
              return;
            }
            pt.y = -10;
            pt.x = Math.random() * W;
          } else if (pt.y > H) {
            pt.y = -10;
            pt.x = Math.random() * W;
          }
        });

        if (frameClipped) fctx.restore();
      } else if (w === "fog") {
        parts.forEach((pt) => {
          const x = ((pt.x + now * 0.006 * (0.4 + pt.s)) % (W + 700)) - 350;
          const g = ctx.createRadialGradient(x, pt.y, 0, x, pt.y, 300);
          g.addColorStop(0, "rgba(220,228,238,.16)");
          g.addColorStop(1, "rgba(220,228,238,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(x, pt.y, 300, 0, 6.3);
          ctx.fill();
        });
      } else if (w === "heat") {
        parts.forEach((pt) => {
          const y = H - ((pt.y + now * 0.02 * (0.4 + pt.s)) % H) * 0.9;
          const wob = Math.sin(now / 700 + pt.r * 8) * 14;
          const g = ctx.createRadialGradient(
            pt.x + wob,
            y,
            0,
            pt.x + wob,
            y,
            70,
          );
          g.addColorStop(0, "rgba(255,170,80,.10)");
          g.addColorStop(1, "rgba(255,170,80,0)");
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(pt.x + wob, y, 70, 0, 6.3);
          ctx.fill();
        });
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", size);
      window.removeEventListener("resize", onResize);
      reduceMotionQuery.removeEventListener("change", onReduceMotionChange);
    };
  }, []);

  return (
    <>
      <canvas
        ref={backRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />
      <canvas
        ref={frontRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 11,
        }}
      />
    </>
  );
}
