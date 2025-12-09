import React, { useEffect, useMemo, useState } from "react";
import {
  WiDaySunny,
  WiNightClear,
  WiCloud,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
} from "react-icons/wi";
import { FiAlertTriangle, FiMapPin, FiRefreshCw, FiSearch } from "react-icons/fi";

/**
 * WeatherWidget
 * - Pulls live forecast from Open-Meteo (no API key needed)
 * - Lets farmers change the region (city/district name)
 * - Raises in-app + browser alert pop-up when heavy rain is predicted soon
 */

const IconMap = {
  Clear: ({ size = 72, color = "#FFD166" }) => <WiDaySunny size={size} color={color} />,
  "Clear Night": ({ size = 72, color = "#FFD166" }) => <WiNightClear size={size} color={color} />,
  Sunny: ({ size = 72, color = "#FFD166" }) => <WiDaySunny size={size} color={color} />,
  "Partly Cloudy": ({ size = 72, color = "#FFE8A1" }) => <WiCloudy size={size} color={color} />,
  Cloudy: ({ size = 72, color = "#B0C4DE" }) => <WiCloud size={size} color={color} />,
  Rain: ({ size = 72, color = "#76C7F0" }) => <WiRain size={size} color={color} />,
  Thunderstorm: ({ size = 72, color = "#9EC5FE" }) => <WiThunderstorm size={size} color={color} />,
  Snow: ({ size = 72, color = "#BCE5F7" }) => <WiSnow size={size} color={color} />,
};

function getWeatherIcon(condition) {
  if (!condition) return IconMap.Cloudy({});
  const c = condition.toLowerCase();
  if (c.includes("clear") && c.includes("night")) return IconMap["Clear Night"]({});
  if (c.includes("clear") || c.includes("sunny")) return IconMap.Sunny({});
  if (c.includes("cloud") && c.includes("part")) return IconMap["Partly Cloudy"]({});
  if (c.includes("cloud")) return IconMap.Cloudy({});
  if (c.includes("rain") || c.includes("shower")) return IconMap.Rain({});
  if (c.includes("thunder")) return IconMap.Thunderstorm({});
  if (c.includes("snow")) return IconMap.Snow({});
  return IconMap.Cloudy({});
}

const DEG = "\u00b0";

const DEFAULT_LOCATION = {
  name: "Rourkela",
  admin1: "Odisha",
  country: "IN",
  latitude: 22.237,
  longitude: 84.864,
};

const ALERT_THRESHOLDS = {
  precipProbability: 70, // %
  precipAmount: 8, // mm/hr
};

const weatherCodeMap = {
  0: "Clear",
  1: "Mainly Clear",
  2: "Partly Cloudy",
  3: "Cloudy",
  45: "Fog",
  48: "Fog",
  51: "Light Drizzle",
  53: "Drizzle",
  55: "Heavy Drizzle",
  56: "Freezing Drizzle",
  57: "Freezing Drizzle",
  61: "Light Rain",
  63: "Rain",
  65: "Heavy Rain",
  66: "Freezing Rain",
  67: "Freezing Rain",
  71: "Snow",
  73: "Snow",
  75: "Heavy Snow",
  77: "Snow Grains",
  80: "Rain Showers",
  81: "Rain Showers",
  82: "Heavy Showers",
  85: "Snow Showers",
  86: "Snow Showers",
  95: "Thunderstorm",
  96: "Thunderstorm",
  99: "Thunderstorm",
};

const DayPill = ({ day, iconComponent, hi, lo }) => (
  <div className="day-pill d-flex flex-column align-items-center me-3" style={{ minWidth: 88 }}>
    <div className="fw-bold small text-white text-center">{day}</div>
    <div className="my-1">{iconComponent}</div>
    <div className="text-white small fw-semibold">
      {hi}
      {DEG}C / {lo}
      {DEG}C
    </div>
  </div>
);

export const defaultData = {
  location: "Rourkela, IN",
  condition: "Normal",
  temp: 28,
  wind: "0 km/h",
  precip: "0 mm/hr",
  pressure: "1012 hPa",
  days: [
    { d: "SAT", hi: 32, lo: 24, cond: "Partly Cloudy" },
    { d: "SUN", hi: 31, lo: 23, cond: "Cloudy" },
    { d: "MON", hi: 30, lo: 22, cond: "Cloudy" },
    { d: "TUE", hi: 29, lo: 22, cond: "Cloudy" },
    { d: "WED", hi: 29, lo: 21, cond: "Partly Cloudy" },
    { d: "THU", hi: 30, lo: 22, cond: "Partly Cloudy" },
  ],
};

function formatLocation(loc) {
  if (!loc) return "";
  const region = [loc.name, loc.admin1].filter(Boolean).join(", ");
  return [region, loc.country].filter(Boolean).join(", ");
}

function weatherCodeToCond(code) {
  return weatherCodeMap[code] || "Cloudy";
}

function findRainAlert(apiData) {
  const hourly = apiData?.hourly;
  const currentTime = apiData?.current_weather?.time;
  if (!hourly?.time || !currentTime) return null;

  const now = new Date(currentTime);
  const horizon = new Date(now.getTime() + 12 * 60 * 60 * 1000); // look 12 hours ahead

  for (let i = 0; i < hourly.time.length; i++) {
    const t = new Date(hourly.time[i]);
    if (t < now || t > horizon) continue;

    const prob = Number(hourly.precipitation_probability?.[i] || 0);
    const precip = Number(hourly.precipitation?.[i] || 0);

    if (prob >= ALERT_THRESHOLDS.precipProbability || precip >= ALERT_THRESHOLDS.precipAmount) {
      return {
        key: `${hourly.time[i]}-${prob}-${precip}`,
        time: t,
        probability: prob,
        amount: precip,
        message: `Heavy rain likely around ${t.toLocaleTimeString("en-IN", {
          hour: "numeric",
          minute: "2-digit",
        })} (chance ${prob}%, ~${precip.toFixed(1)} mm/hr)`,
      };
    }
  }
  return null;
}

export default function WeatherWidget({ initialLocation = DEFAULT_LOCATION }) {
  const [query, setQuery] = useState(formatLocation(initialLocation) || "Rourkela");
  const [activeLocation, setActiveLocation] = useState(initialLocation);
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [alertInfo, setAlertInfo] = useState(null);
  const [lastAlertKey, setLastAlertKey] = useState(null);
  const [status, setStatus] = useState("normal");

  const statusColor = useMemo(
    () => (status === "alert" ? "#b71c1c" : "#1b5e20"),
    [status]
  );

  useEffect(() => {
    fetchWeather(activeLocation);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLocation]);

  useEffect(() => {
    if (alertInfo && alertInfo.key !== lastAlertKey) {
      setLastAlertKey(alertInfo.key);
      window.alert(alertInfo.message);
    }
  }, [alertInfo, lastAlertKey]);

  async function resolveLocation(searchText) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      searchText
    )}&count=1&language=en&format=json`;
    const res = await fetch(geoUrl);
    if (!res.ok) throw new Error("Could not fetch location");
    const json = await res.json();
    const match = json?.results?.[0];
    if (!match) throw new Error("No matching place found");
    return {
      name: match.name,
      admin1: match.admin1,
      country: match.country_code,
      latitude: match.latitude,
      longitude: match.longitude,
    };
  }

  async function fetchWeather(location) {
    if (!location?.latitude || !location?.longitude) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        latitude: location.latitude,
        longitude: location.longitude,
        hourly: "precipitation_probability,precipitation,pressure_msl,temperature_2m,wind_speed_10m",
        daily: "weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        current_weather: "true",
        timezone: "auto",
      });
      const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      if (!res.ok) throw new Error("Weather data unavailable");
      const json = await res.json();

      const timeIndex =
        json.hourly?.time?.findIndex((t) => t === json.current_weather?.time) ?? 0;
      const safeIndex = timeIndex >= 0 ? timeIndex : 0;

      const widgetData = {
        location: formatLocation(location) || "--",
        condition: weatherCodeToCond(json.current_weather?.weathercode),
        temp: Math.round(json.current_weather?.temperature ?? 0),
        wind: `${Math.round(json.current_weather?.windspeed ?? 0)} km/h`,
        precip: `${(json.hourly?.precipitation?.[safeIndex] ?? 0).toFixed(1)} mm/hr`,
        pressure: `${Math.round(json.hourly?.pressure_msl?.[safeIndex] ?? 0)} hPa`,
        days: (json.daily?.time || []).slice(0, 6).map((day, idx) => ({
          d: new Date(day).toLocaleDateString("en-US", { weekday: "short" }).toUpperCase(),
          hi: Math.round(json.daily?.temperature_2m_max?.[idx] ?? 0),
          lo: Math.round(json.daily?.temperature_2m_min?.[idx] ?? 0),
          cond: weatherCodeToCond(json.daily?.weathercode?.[idx]),
        })),
      };

      const alert = findRainAlert(json);
      setStatus(alert ? "alert" : "normal");
      setAlertInfo(alert);
      setData(widgetData);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong");
      setStatus("normal");
    } finally {
      setLoading(false);
    }
  }

  async function onSearchSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setLoading(true);
      const loc = await resolveLocation(query.trim());
      setActiveLocation(loc);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to find that place");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="weather-mini-widget p-3"
      style={{ maxWidth: 560, width: "100%", margin: "0 auto" }}
    >
      <style>{`
        .wm-card{ background:#59B785; border-radius:12px; padding:12px; color:#fff; border:6px solid rgba(0,0,0,0.06); position:relative; overflow:hidden; }
        .wm-left{ display:flex; flex-direction:column; align-items:center; gap:8px; }
        .wm-temp{ font-size:52px; font-weight:700; line-height:1; }
        .wm-condition{ font-size:20px; font-weight:700; }
        .wm-metrics{ text-align:center; min-width:160px; width:100%; }
        .day-strip{
          display:flex;
          gap:12px;
          overflow-x:auto;
          overflow-y:hidden;
          padding:8px 6px 10px;
          width:100%;
          scroll-behavior:smooth;
          -webkit-overflow-scrolling:touch;
        }
        .day-strip::-webkit-scrollbar{ height:6px; }
        .day-strip::-webkit-scrollbar-thumb{ background:rgba(255,255,255,0.35); border-radius:6px; }
        .day-strip::-webkit-scrollbar-track{ background:rgba(255,255,255,0.12); }
        .day-pill{ flex:0 0 auto; scroll-snap-align:start; }
        .wm-status-pill{ background:${statusColor}; padding:6px 12px; border-radius:999px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:6px; text-transform:uppercase; }
        .wm-search{ background:rgba(255,255,255,0.14); border-radius:10px; padding:10px 12px; border:1px solid rgba(255,255,255,0.35); }
        .wm-search input{ background:transparent; border:none; outline:none; color:#fff; width:100%; }
        .wm-search ::placeholder{ color:rgba(255,255,255,0.9); }
        .wm-alert-banner{ background:rgba(255,193,7,0.18); border:1px dashed rgba(255,255,255,0.6); color:#fff; border-radius:10px; padding:10px 12px; display:flex; gap:10px; align-items:flex-start; }
        .spin{ animation: spin 1s linear infinite; }
        @keyframes spin { from{ transform: rotate(0deg); } to{ transform: rotate(360deg); } }

        /* responsive tweaks */
        @media (max-width: 900px){ .wm-temp{ font-size:44px } .wm-metrics{ min-width:120px; font-size:14px } }
        @media (max-width: 640px){
          .wm-card{ padding:14px }
          .wm-temp{ font-size:34px }
          .wm-left{ order:0 }
          .wm-metrics{ order:2; text-align:left; margin-top:10px }
          .day-strip{ gap:10px }
        }
      `}</style>

      <div className="wm-card d-flex flex-column align-items-center">
        <div className="d-flex w-100 align-items-center justify-content-center gap-2 mb-2 flex-wrap">
          <div className="wm-status-pill text-center">
            <FiAlertTriangle />
            Status: {status === "alert" ? "Heavy rain watch" : "Normal"}
          </div>
          <form
            onSubmit={onSearchSubmit}
            className="d-flex align-items-center gap-2"
            style={{ flex: "1 1 260px", maxWidth: 420 }}
          >
            <div className="wm-search d-flex align-items-center gap-2 w-100">
              <FiMapPin />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search region (e.g., Rourkela, Odisha)"
              />
              <button
                type="submit"
                className="btn btn-sm btn-light d-flex align-items-center gap-1"
                style={{ color: "#2f7a3a", fontWeight: 700 }}
              >
                {loading ? <FiRefreshCw className="spin" /> : <FiSearch />}
                {loading ? "Loading" : "Update"}
              </button>
            </div>
          </form>
        </div>

        {alertInfo && (
          <div className="wm-alert-banner w-100 mb-3 text-center">
            <FiAlertTriangle size={20} />
            <div>
              <div className="fw-bold">Weather Alert</div>
              <div className="small">{alertInfo.message}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="w-100 alert alert-warning py-2 px-3 text-center">
            {error} - showing last known data.
          </div>
        )}

        {/* left icon */}
        <div className="wm-left align-self-center">
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {getWeatherIcon(data.condition)}
          </div>
          <div className="wm-condition">{data.condition}</div>
          <div className="small text-white-50">Updated for {data.location}</div>
        </div>

        {/* center block */}
        <div style={{ flex: "1 1 360px", minWidth: 220 }} className="px-2 text-center">
          <div className="text-center mb-1">
            <div className="fw-bold" style={{ fontSize: 22 }}>
              {data.location}
            </div>
          </div>

      <div className="d-flex align-items-center justify-content-center mb-2">
            <div className="wm-temp">
              {data.temp}
              {DEG}C
            </div>
          </div>

          <div className="day-strip mt-2">
            {data.days.map((day, idx) => (
              <DayPill
                key={idx}
                day={day.d}
                iconComponent={getWeatherIcon(day.cond)}
                hi={day.hi}
                lo={day.lo}
              />
            ))}
          </div>
        </div>

        {/* right metrics */}
        <div className="wm-metrics pt-1">
          <div className="small text-white-50 mb-3">Region-based live feed</div>
          <div className="small fw-bold">
            Wind: <span className="fw-normal">{data.wind}</span>
          </div>
          <div className="small fw-bold">
            Precip: <span className="fw-normal">{data.precip}</span>
          </div>
          <div className="small fw-bold">
            Pressure: <span className="fw-normal">{data.pressure}</span>
          </div>
          <div className="small fw-bold">
            Status:{" "}
            <span className="fw-normal" style={{ textTransform: "capitalize" }}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
