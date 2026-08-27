export type Phase = "morning" | "afternoon" | "evening" | "night";
export type Weather =
  | "clear"
  | "cloudy"
  | "rain"
  | "thunder"
  | "snow"
  | "fog"
  | "heat";

export interface ThemeVars {
  bg: string;
  fg: string;
  fg2: string;
  tile: string;
  line: string;
  sheen: string;
  accent: string;
  accent2: string;
  onAccent: string;
  g1: string;
  g2: string;
  g3: string;
  skyTop: string;
  skyBot: string;
  fig: string;
  label: string;
}

export const PHASES: Record<Phase, ThemeVars> = {
  morning: {
    bg: "#f2efe6",
    fg: "#1b1a16",
    fg2: "rgba(27,26,22,.58)",
    tile: "rgba(255,253,247,.55)",
    line: "rgba(27,26,22,.10)",
    sheen: "rgba(255,255,255,.7)",
    accent: "#C8722F",
    accent2: "#D9A24B",
    onAccent: "#fffdf7",
    g1: "#ffd8a8",
    g2: "#ffc9c0",
    g3: "#d7e6c4",
    skyTop: "#8fc3e8",
    skyBot: "#ffd9a0",
    fig: "rgba(27,26,22,.70)",
    label: "Morning",
  },
  afternoon: {
    bg: "#eef1f6",
    fg: "#12161d",
    fg2: "rgba(18,22,29,.58)",
    tile: "rgba(255,255,255,.5)",
    line: "rgba(18,22,29,.10)",
    sheen: "rgba(255,255,255,.72)",
    accent: "#3E63DD",
    accent2: "#7C5CFF",
    onAccent: "#ffffff",
    g1: "#a8c0ff",
    g2: "#cfd8ff",
    g3: "#b9e6dd",
    skyTop: "#5fa8f0",
    skyBot: "#cfe9ff",
    fig: "rgba(18,22,29,.72)",
    label: "Afternoon",
  },
  evening: {
    bg: "#2a2033",
    fg: "#f6efe9",
    fg2: "rgba(246,239,233,.62)",
    tile: "rgba(255,240,230,.07)",
    line: "rgba(255,235,220,.14)",
    sheen: "rgba(255,235,215,.06)",
    accent: "#FF8A5B",
    accent2: "#E36AA8",
    onAccent: "#241a2b",
    g1: "#8a4a7a",
    g2: "#e0724f",
    g3: "#4b3a7a",
    skyTop: "#3d2a55",
    skyBot: "#ff9a5c",
    fig: "rgba(20,12,26,.85)",
    label: "Evening",
  },
  night: {
    bg: "#0d1119",
    fg: "#e8edf7",
    fg2: "rgba(232,237,247,.56)",
    tile: "rgba(180,205,255,.06)",
    line: "rgba(180,205,255,.13)",
    sheen: "rgba(180,205,255,.05)",
    accent: "#7FA6FF",
    accent2: "#9C8BFF",
    onAccent: "#0d1119",
    g1: "#1e3a6e",
    g2: "#31306b",
    g3: "#12414a",
    skyTop: "#080d18",
    skyBot: "#2b3f6b",
    fig: "rgba(4,7,13,.9)",
    label: "Night",
  },
};

export const WEATHERS: Weather[] = [
  "clear",
  "cloudy",
  "rain",
  "thunder",
  "snow",
  "fog",
  "heat",
];

export const PHASE_OPTIONS: Phase[] = [
  "morning",
  "afternoon",
  "evening",
  "night",
];

export const ROUTES: {
  href: string;
  label: string;
  icon: string;
}[] = [
  { href: "#/", label: "Home", icon: "home" },
  { href: "#/journey", label: "Journey", icon: "timeline" },
  { href: "#/projects", label: "Projects", icon: "folder_open" },
  { href: "#/skills", label: "Skills", icon: "memory" },
  { href: "#/writing", label: "Writing", icon: "edit_note" },
  { href: "#/certifications", label: "Certs", icon: "workspace_premium" },
  { href: "#/contact", label: "Contact", icon: "mail" },
];

// Every skill from data.ts's skillGroups that has a matching icon, deduped so
// AWS Lambda/RDS/API Gateway (which all share the same "aws" icon) only show
// up once — otherwise the falling pile would drop three identical AWS logos.
export const GRAPH_SKILLS = [
  "Python",
  "TypeScript",
  "JavaScript",
  "C",
  "C++",
  "Java",
  "HTML",
  "CSS",
  "React",
  "Node.js",
  "Express",
  "TailwindCSS",
  "FastAPI",
  "Django",
  "Spring Boot",
  "Vite",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "AWS",
  "Jenkins",
  "Docker",
  "Kubernetes",
  "Linux",
  "Git",
  "npm",
  "Figma",
];

export const PROJECT_SLIDES = [
  { name: "SplitIt", stack: "React · Gemini API · Express", tint: "#5B7BFF" },
  { name: "Add project two", stack: "stack · stack", tint: "#E36AA8" },
  { name: "Add project three", stack: "stack · stack", tint: "#4FB58B" },
];

export function codeToWeather(code: number, temp: number | null): Weather {
  if (code >= 95) return "thunder";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 51 && code <= 82) return "rain";
  if (code === 45 || code === 48) return "fog";
  if (temp != null && temp >= 31) return "heat";
  if (code >= 1 && code <= 3) return "cloudy";
  return "clear";
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function mixColor(a: string, b: string, k: number): string {
  if (a[0] !== "#" || b[0] !== "#") return a;
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return (
    "#" +
    A.map((v, i) =>
      Math.round(v + (B[i] - v) * k)
        .toString(16)
        .padStart(2, "0"),
    ).join("")
  );
}

export function computeTheme(phase: Phase, weather: Weather): ThemeVars {
  const t = { ...PHASES[phase] };
  if (weather === "rain" || weather === "thunder" || weather === "fog") {
    t.g1 = mixColor(t.g1, "#7d8794", 0.45);
    t.g3 = mixColor(t.g3, "#7d8794", 0.5);
    t.skyBot = mixColor(t.skyBot, "#9aa3ad", 0.5);
  }
  if (weather === "snow") {
    t.g2 = mixColor(t.g2, "#dfe8f5", 0.5);
    t.skyTop = mixColor(t.skyTop, "#c9d6e6", 0.4);
  }
  if (weather === "heat") {
    t.g1 = mixColor(t.g1, "#ff9a3c", 0.5);
    t.g2 = mixColor(t.g2, "#ffbe6b", 0.35);
    t.skyBot = mixColor(t.skyBot, "#ffb057", 0.55);
  }
  return t;
}

export const WEATHER_ICON: Record<Weather, string> = {
  clear: "clear_day",
  cloudy: "cloud",
  rain: "rainy",
  thunder: "thunderstorm",
  snow: "weather_snowy",
  fog: "foggy",
  heat: "device_thermostat",
};
