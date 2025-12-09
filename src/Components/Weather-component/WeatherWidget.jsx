import React, { useEffect, useState } from 'react';
import {
  WiDaySunny,
  WiNightClear,
  WiCloud,
  WiCloudy,
  WiRain,
  WiThunderstorm,
  WiSnow,
} from 'react-icons/wi';

/**
 * WeatherMiniWidget.jsx (Google Weather API)
 *
 * Uses Google Maps Weather API - forecast.days:
 *   https://weather.googleapis.com/v1/forecast/days:lookup
 *
 * NOTE: For production, DO NOT hardcode your API key in frontend.
 * Proxy this call via your backend or use a restricted key.
 */

// ⚠️ Dev only: move this key to backend / env variable in real app
const GOOGLE_WEATHER_API_KEY = 'AIzaSyANvoVWdwZhYshqOhx6dNJR90nrInqfBy8';

// Default: Rourkela, Odisha
const DEFAULT_LAT = 22.255985;
const DEFAULT_LNG = 84.8156292;

const IconMap = {
  Clear: ({ size = 72, color = '#FFD166' }) => (
    <WiDaySunny size={size} color={color} />
  ),
  'Clear Night': ({ size = 72, color = '#FFD166' }) => (
    <WiNightClear size={size} color={color} />
  ),
  Sunny: ({ size = 72, color = '#FFD166' }) => (
    <WiDaySunny size={size} color={color} />
  ),
  'Partly Cloudy': ({ size = 72, color = '#FFE8A1' }) => (
    <WiCloudy size={size} color={color} />
  ),
  Cloudy: ({ size = 72, color = '#B0C4DE' }) => (
    <WiCloud size={size} color={color} />
  ),
  Rain: ({ size = 72, color = '#76C7F0' }) => <WiRain size={size} color={color} />,
  Thunderstorm: ({ size = 72, color = '#9EC5FE' }) => (
    <WiThunderstorm size={size} color={color} />
  ),
  Snow: ({ size = 72, color = '#BCE5F7' }) => <WiSnow size={size} color={color} />,
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
  <div
    className="day-pill d-flex flex-column align-items-center me-3"
    style={{ minWidth: 88 }}
  >
    <div className="fw-bold small text-white text-center">{day}</div>
    <div className="my-1">{iconComponent}</div>
    <div className="text-white small fw-semibold">
      {hi}°C / {lo}°C
    </div>
  </div>
);

export const defaultData = {
  location: 'Rourkela, IN',
  condition: 'Clear Sky',
  temp: 15,
  wind: '0 m/s',
  precip: '0 mm/hr',
  pressure: '1018 mb',
  days: [
    { d: "SAT", hi: 32, lo: 24, cond: "Partly Cloudy" },
    { d: "SUN", hi: 31, lo: 23, cond: "Cloudy" },
    { d: "MON", hi: 30, lo: 22, cond: "Cloudy" },
    { d: "TUE", hi: 29, lo: 22, cond: "Cloudy" },
    { d: "WED", hi: 29, lo: 21, cond: "Partly Cloudy" },
    { d: "THU", hi: 30, lo: 22, cond: "Partly Cloudy" },
  ],
};

function mapGoogleToWidget(googleData, fallbackLocation = 'Rourkela, IN') {
  const days = googleData?.forecastDays || [];
  if (!days.length) return defaultData;

  const first = days[0];

  // Temperature
  const max = first.maxTemperature?.degrees ?? null;
  const feels = first.feelsLikeMaxTemperature?.degrees ?? max ?? 24;

  // Condition text from daytime forecast
  const condText =
    first.daytimeForecast?.weatherCondition?.description?.text || 'Clear';

  // wind & precip from daytime forecast
  const windSpeed =
    first.daytimeForecast?.wind?.speed?.value != null
      ? `${first.daytimeForecast.wind.speed.value} km/h`
      : '—';

  const precipQty =
    first.daytimeForecast?.precipitation?.qpf?.quantity != null
      ? `${first.daytimeForecast.precipitation.qpf.quantity} mm`
      : '—';

  // Build day pills
  const widgetDays = days.slice(0, 7).map((dObj) => {
    let label = 'DAY';
    if (dObj.displayDate) {
      const { year, month, day } = dObj.displayDate;
      const dt = new Date(year, month - 1, day);
      if (!isNaN(dt.getTime())) {
        label = dt
          .toLocaleDateString('en-IN', { weekday: 'short' })
          .toUpperCase();
      }
    }

    const hi = dObj.maxTemperature?.degrees ?? 0;
    const lo = dObj.minTemperature?.degrees ?? 0;

    const cond =
      dObj.daytimeForecast?.weatherCondition?.description?.text || condText;

    return {
      d: label,
      hi: Math.round(hi),
      lo: Math.round(lo),
      cond,
    };
  });

  return {
    location: fallbackLocation,
    condition: condText,
    temp: Math.round(feels),
    wind: windSpeed,
    precip: precipQty,
    pressure: '—',
    days: widgetDays,
  };
}

export default function WeatherMiniWidget({
  // You can override lat/lng if you want another city
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LNG,
  locationLabel = 'Rourkela, IN',
}) {
  const [data, setData] = useState(defaultData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError('');

      try {
        const url = `https://weather.googleapis.com/v1/forecast/days:lookup?key=${GOOGLE_WEATHER_API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}&days=7`;
        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`Weather API failed. Status: ${res.status}`);
        }

        const json = await res.json();
        const mapped = mapGoogleToWidget(json, locationLabel);
        setData(mapped);
      } catch (err) {
        console.error('Weather API error:', err);
        setError(err.message || 'Failed to load weather');
        setData((prev) => ({ ...prev, location: locationLabel }));
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude, locationLabel]);

  return (
    <div
      className="weather-mini-widget p-3"
      style={{ maxWidth: 1000, width: '100%' }}
    >
      <style>{`
        .wm-card{
          background:#59B785;
          border-radius:12px;
          padding:20px;
          color:#fff;
          border:6px solid rgba(0,0,0,0.06);
          position:relative;
        }
        .wm-left{
          display:flex;
          flex-direction:column;
          align-items:center;
          gap:12px;
        }
        .wm-temp{
          font-size:64px;
          font-weight:700;
          line-height:1;
        }
        .wm-condition{
          font-size:20px;
          font-weight:700;
        }
        .wm-metrics{
          text-align:right;
          min-width:160px
        }
        .day-strip{
          display:flex;
          gap:12px;
          overflow:auto;
          padding-bottom:4px
        }
        .day-pill{ flex:0 0 auto }

        .wm-loading-tag{
          position:absolute;
          top:8px;
          right:12px;
          font-size:11px;
          padding:2px 8px;
          border-radius:999px;
          background:rgba(255,255,255,0.18);
        }

        /* responsive tweaks */
        @media (max-width: 900px){
          .wm-temp{ font-size:48px }
          .wm-metrics{ min-width:120px; font-size:14px }
        }
        @media (max-width: 640px){
          .wm-card{ padding:14px }
          .wm-temp{ font-size:34px }
          .wm-left{ order:0 }
          .wm-metrics{ order:2; text-align:left; margin-top:10px }
          .day-strip{ gap:10px }
        }
      `}</style>

      <div className="wm-card d-flex flex-wrap align-items-start">
        {loading && <div className="wm-loading-tag">Loading…</div>}

        {/* left icon */}
        <div className="wm-left me-3 align-self-start">
          <div
            style={{
              width: 84,
              height: 84,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
        <div className="wm-metrics ps-3 pt-1">
          {error && (
            <div className="small text-warning mb-2">{error}</div>
          )}
          <div className="small fw-bold">
            Wind: <span className="fw-normal">{data.wind}</span>
          </div>
          <div className="small fw-bold">
            Precip: <span className="fw-normal">{data.precip}</span>
          </div>
          <div className="small fw-bold">
            Pressure: <span className="fw-normal">{data.pressure}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
