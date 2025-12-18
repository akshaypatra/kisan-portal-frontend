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

// Default coords if not overridden (only for API call, not for data)
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
  if (!condition) return <WiCloud size={72} color="#B0C4DE" />;

  const c = condition.toLowerCase();
  if (c.includes('clear') && c.includes('night')) return <WiNightClear size={72} color="#FFD166" />;
  if (c.includes('clear') || c.includes('sunny')) return <WiDaySunny size={72} color="#FFD166" />;
  if (c.includes('cloud') && c.includes('part')) return <WiCloudy size={72} color="#FFE8A1" />;
  if (c.includes('cloud')) return <WiCloud size={72} color="#B0C4DE" />;
  if (c.includes('rain') || c.includes('shower')) return <WiRain size={72} color="#76C7F0" />;
  if (c.includes('thunder')) return <WiThunderstorm size={72} color="#9EC5FE" />;
  if (c.includes('snow')) return <WiSnow size={72} color="#BCE5F7" />;
  return <WiCloud size={72} color="#B0C4DE" />;
}

const DEG = '\u00b0';

const DayPill = ({ day, iconComponent, hi, lo }) => {
  const hiDisplay = hi != null ? `${hi}${DEG}C` : '—';
  const loDisplay = lo != null ? `${lo}${DEG}C` : '—';

  return (
    <div
      className="day-pill d-flex flex-column align-items-center me-3"
      style={{ minWidth: 88 }}
    >
      <div className="fw-bold small text-white text-center">{day}</div>
      <div className="my-1">{iconComponent}</div>
      <div className="text-white small fw-semibold">
        {hiDisplay} / {loDisplay}
      </div>
    </div>
  );
};

/**
 * Map Google Weather API response → widget data
 * Returns `null` if API doesn't give usable forecastDays (no fake defaults).
 */
function mapGoogleToWidget(googleData, fallbackLocationLabel) {
  const days = googleData?.forecastDays || [];
  if (!days.length) return null; // 🚫 no fabricated data

  const first = days[0];

  const feels =
    first.feelsLikeMaxTemperature?.degrees ??
    first.maxTemperature?.degrees ??
    null;

  const condText =
    first.daytimeForecast?.weatherCondition?.description?.text || '';

  const windVal = first.daytimeForecast?.wind?.speed?.value ?? null; // assume km/h
  const precipVal =
    first.daytimeForecast?.precipitation?.qpf?.quantity ?? null; // mm (per day/period, as API defines)

  const pressureVal =
    first.daytimeForecast?.pressureMillibars ??
    first.pressureMillibars ??
    null;

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

    const hi = dObj.maxTemperature?.degrees ?? null;
    const lo = dObj.minTemperature?.degrees ?? null;

    const cond =
      dObj.daytimeForecast?.weatherCondition?.description?.text ||
      condText ||
      '';

    return {
      d: label,
      hi: hi != null ? Math.round(hi) : null,
      lo: lo != null ? Math.round(lo) : null,
      cond,
    };
  });

  return {
    // We use your label for display, because Google data may not have nice human-readable name
    locationLabel: fallbackLocationLabel,
    condition: condText || '',
    temp: feels != null ? Math.round(feels) : null,
    wind: windVal,      // number or null
    precip: precipVal,  // number or null
    pressure: pressureVal, // number or null
    days: widgetDays,
  };
}

export default function WeatherMiniWidget({
  latitude = DEFAULT_LAT,
  longitude = DEFAULT_LNG,
  // Just a label for the UI; not "weather data"
  locationLabel = 'Rourkela, IN',
}) {
  const [data, setData] = useState(null); // null until Google API fills it
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

        if (!mapped) {
          // API responded but no usable forecast
          setError('No forecast data returned by Google Weather API.');
          setData(null);
        } else {
          setData(mapped);
        }
      } catch (err) {
        console.error('Weather API error:', err);
        setError(err.message || 'Failed to load weather from Google.');
        // do not inject any fake data; keep whatever previous state we had
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [latitude, longitude, locationLabel]);

  const hasData = !!data;

  const tempDisplay =
    hasData && data.temp != null ? `${data.temp}${DEG}C` : '—';

  const windDisplay =
    hasData && data.wind != null ? `${data.wind} km/h` : '—';

  const precipDisplay =
    hasData && data.precip != null ? `${data.precip} mm` : '—';

  const pressureDisplay =
    hasData && data.pressure != null ? `${data.pressure} mb` : '—';

  const conditionText = hasData && data.condition ? data.condition : '';

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

        {hasData ? (
          <>
            {/* left icon & condition */}
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
                {getWeatherIcon(conditionText)}
              </div>
              <div className="wm-condition">{conditionText}</div>
              <div className="small text-white-50">
                Updated for {data.locationLabel}
              </div>
            </div>

            {/* center block */}
            <div
              style={{ flex: '1 1 360px', minWidth: 220 }}
              className="px-2 text-center"
            >
              <div className="text-center mb-1">
                <div className="fw-bold" style={{ fontSize: 22 }}>
                  {data.locationLabel}
                </div>
              </div>

              <div className="d-flex align-items-center justify-content-center mb-2">
                <div className="wm-temp">{tempDisplay}</div>
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
              {error && <div className="small text-warning mb-2">{error}</div>}
              <div className="small fw-bold">
                Wind: <span className="fw-normal">{windDisplay}</span>
              </div>
              <div className="small fw-bold">
                Precip: <span className="fw-normal">{precipDisplay}</span>
              </div>
              <div className="small fw-bold">
                Pressure: <span className="fw-normal">{pressureDisplay}</span>
              </div>
            </div>
          </>
        ) : (
          // No data yet (initial load or API issue)
          <div className="w-100 text-center">
            <div className="fw-bold mb-1">{locationLabel}</div>
            <div>
              {loading
                ? 'Loading weather data from Google…'
                : 'No weather data available.'}
            </div>
            {error && (
              <div className="small text-warning mt-2">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
