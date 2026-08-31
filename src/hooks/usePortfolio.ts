import { useEffect, useMemo, useState } from "react";
import {
  type Phase,
  type Weather,
  codeToWeather,
  computeTheme,
} from "../theme";

const OVERRIDE_KEY = "ssk.portfolio.override";

interface StoredOverride {
  phaseOverride: Phase | null;
  weatherOverride: Weather | null;
}

function phaseFromHour(hour: number): Phase {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 21) return "evening";
  return "night";
}

export function usePortfolio() {
  const [route, setRoute] = useState(
    () => (typeof location !== "undefined" && location.hash) || "#/"
  );
  const [hour, setHour] = useState(() => new Date().getHours());
  const [minute, setMinute] = useState(() => new Date().getMinutes());
  const [weather, setWeather] = useState<Weather>("clear");
  const [temp, setTemp] = useState<number | null>(null);
  const [place, setPlace] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const [phaseOverride, setPhaseOverride] = useState<Phase | null>(null);
  const [weatherOverride, setWeatherOverride] = useState<Weather | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    const onHash = () => {
      setRoute(location.hash || "#/");
      setPanelOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const d = new Date();
      setHour((h) => (d.getHours() !== h ? d.getHours() : h));
      setMinute((m) => (d.getMinutes() !== m ? d.getMinutes() : m));
    }, 20000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(OVERRIDE_KEY) || "null"
      ) as StoredOverride | null;
      if (saved) {
        setPhaseOverride(saved.phaseOverride ?? null);
        setWeatherOverride(saved.weatherOverride ?? null);
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  useEffect(() => {
    const fetchAt = (
      lat: number | string,
      lon: number | string,
      at: string
    ) => {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`
      )
        .then((r) => r.json())
        .then((j) => {
          const c = j?.current;
          if (!c) return;
          setTemp(Math.round(c.temperature_2m));
          setWeather(codeToWeather(c.weather_code, c.temperature_2m));
          setLive(true);
          setPlace(at);
        })
        .catch(() => {});
    };
    const fallback = () => fetchAt(38.9072, -77.0369, "Washington, DC");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (p) =>
          fetchAt(
            p.coords.latitude.toFixed(3),
            p.coords.longitude.toFixed(3),
            "your area"
          ),
        fallback,
        // enableHighAccuracy asks the device for a GPS-grade fix instead of
        // the coarse Wi-Fi/IP-based positioning browsers default to, which
        // can be off by several km on desktop — easily enough to miss
        // localized weather (e.g. rain) that the coarse fix's location
        // doesn't have. A longer timeout gives that fix time to land before
        // falling back.
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else fallback();
  }, []);
  const motion = 0.7;

  const phase = useMemo(
    () => phaseOverride || phaseFromHour(hour),
    [phaseOverride, hour]
  );

  const resolvedWeather = weatherOverride || weather;

  const theme = useMemo(
    () => computeTheme(phase, resolvedWeather),
    [phase, resolvedWeather]
  );

  useEffect(() => {
    const r = document.documentElement.style;
    (Object.keys(theme) as (keyof typeof theme)[]).forEach((k) => {
      if (k !== "label") r.setProperty(`--${k}`, theme[k]);
    });
    document.body.style.background = theme.bg;
  }, [theme]);

  const setPhaseOverrideAndPersist = (val: Phase | null) => {
    setPhaseOverride(val);
    try {
      localStorage.setItem(
        OVERRIDE_KEY,
        JSON.stringify({ phaseOverride: val, weatherOverride })
      );
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  };

  const setWeatherOverrideAndPersist = (val: Weather | null) => {
    setWeatherOverride(val);
    try {
      localStorage.setItem(
        OVERRIDE_KEY,
        JSON.stringify({ phaseOverride, weatherOverride: val })
      );
    } catch {
      /* ignore quota / privacy-mode errors */
    }
  };

  return {
    route: route === "" ? "#/" : route,
    hour,
    minute,
    weather: resolvedWeather,
    temp,
    place,
    live,
    phase,
    theme,
    motion,
    panelOpen,
    setPanelOpen,
    phaseOverride,
    weatherOverride,
    setPhaseOverride: setPhaseOverrideAndPersist,
    setWeatherOverride: setWeatherOverrideAndPersist,
  };
}

export type PortfolioState = ReturnType<typeof usePortfolio>;
