import { useEffect, useRef } from "react";
import * as Matter from "matter-js";
import { GRAPH_SKILLS } from "../theme";
import { SKILL_ICON_SLUGS, skillIconUrl } from "../skillIcons";

const STACK_SKILLS = GRAPH_SKILLS.filter((name) => SKILL_ICON_SLUGS[name]);
const WALL_THICKNESS = 60;

function chipSize(i: number) {
  return 44 + ((i * 37) % 5) * 5;
}

export function SkillsStack({ motionAmount }: { motionAmount: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const { Engine, World, Bodies, Body, Runner } = Matter;
    const engine = Engine.create();
    engine.gravity.y = 1.1;
    const world = engine.world;

    let width = container.clientWidth || 300;
    let height = container.clientHeight || 340;

    const floor = Bodies.rectangle(
      width / 2,
      height + WALL_THICKNESS / 2,
      width * 2,
      WALL_THICKNESS,
      { isStatic: true, friction: 0.6 },
    );
    const leftWall = Bodies.rectangle(
      -WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height * 4,
      { isStatic: true },
    );
    const rightWall = Bodies.rectangle(
      width + WALL_THICKNESS / 2,
      height / 2,
      WALL_THICKNESS,
      height * 4,
      { isStatic: true },
    );
    World.add(world, [floor, leftWall, rightWall]);

    const bodies = STACK_SKILLS.map((_, i) => {
      const size = chipSize(i);
      const startX = 24 + Math.random() * Math.max(width - 48, 20);
      const body = Bodies.rectangle(startX, -80 - i * 46, size, size, {
        restitution: 0.42,
        friction: 0.4,
        frictionAir: 0.012,
        chamfer: { radius: size * 0.28 },
      });
      Body.setAngle(body, (Math.random() - 0.5) * 1.4);
      Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.22);
      return body;
    });

    let cancelled = false;
    const timers: number[] = [];
    bodies.forEach((body, i) => {
      const t = window.setTimeout(
        () => {
          if (!cancelled) World.add(world, body);
        },
        i * (170 / (0.45 + motionAmount)),
      );
      timers.push(t);
    });

    const runner = Runner.create();
    Runner.run(runner, engine);

    let raf = 0;
    const sync = () => {
      raf = requestAnimationFrame(sync);
      bodies.forEach((body, i) => {
        const el = chipRefs.current[i];
        if (!el) return;
        const size = chipSize(i);
        el.style.transform = `translate3d(${body.position.x - size / 2}px, ${body.position.y - size / 2}px, 0) rotate(${body.angle}rad)`;
      });
    };
    raf = requestAnimationFrame(sync);

    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect) return;
      width = rect.width;
      height = rect.height;
      Body.setPosition(floor, { x: width / 2, y: height + WALL_THICKNESS / 2 });
      Body.setPosition(rightWall, { x: width + WALL_THICKNESS / 2, y: height / 2 });
    });
    ro.observe(container);

    return () => {
      cancelled = true;
      timers.forEach((t) => clearTimeout(t));
      cancelAnimationFrame(raf);
      ro.disconnect();
      Runner.stop(runner);
      World.clear(world, false);
      Engine.clear(engine);
    };
  }, [motionAmount]);

  return (
    <div ref={containerRef} style={{ position: "absolute", inset: 0 }}>
      {STACK_SKILLS.map((name, i) => {
        const slug = SKILL_ICON_SLUGS[name];
        const size = chipSize(i);
        return (
          <div
            key={name}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size,
              height: size,
              borderRadius: size * 0.28,
              background:
                "linear-gradient(145deg,color-mix(in srgb,var(--skyTop) 42%,transparent),color-mix(in srgb,var(--skyBot) 42%,transparent))",
              border: "1px solid color-mix(in srgb,var(--skyBot) 45%,transparent)",
              boxShadow: "0 14px 26px -14px rgba(0,0,0,.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: size * 0.16,
              willChange: "transform",
              transform: "translate3d(-999px,-999px,0)",
            }}
          >
            <img
              src={skillIconUrl(slug)}
              alt={name}
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        );
      })}
    </div>
  );
}
