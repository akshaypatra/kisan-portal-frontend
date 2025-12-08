import React from 'react';
import { WiDaySunny, WiNightClear, WiCloud, WiCloudy, WiRain, WiThunderstorm, WiSnow } from 'react-icons/wi';

/**
 * WeatherMiniWidget.jsx (responsive)
 * - Responsive layout (desktop, tablet, mobile)
 * - Uses react-icons for weather glyphs
 * - Accepts `data` and `imageUrl` props. Default image uses the uploaded mockup.
 *
 * Usage:
 * import WeatherMiniWidget from './WeatherMiniWidget';
 * <WeatherMiniWidget />
 */

const IconMap = {
  Clear: ({ size = 72, color = '#FFD166' }) => <WiDaySunny size={size} color={color} />,
  'Clear Night': ({ size = 72, color = '#FFD166' }) => <WiNightClear size={size} color={color} />,
  Sunny: ({ size = 72, color = '#FFD166' }) => <WiDaySunny size={size} color={color} />,
  'Partly Cloudy': ({ size = 72, color = '#FFE8A1' }) => <WiCloudy size={size} color={color} />,
  Cloudy: ({ size = 72, color = '#B0C4DE' }) => <WiCloud size={size} color={color} />,
  Rain: ({ size = 72, color = '#76C7F0' }) => <WiRain size={size} color={color} />,
  Thunderstorm: ({ size = 72, color = '#9EC5FE' }) => <WiThunderstorm size={size} color={color} />,
  Snow: ({ size = 72, color = '#BCE5F7' }) => <WiSnow size={size} color={color} />,
};

function getWeatherIcon(condition) {
  if (!condition) return IconMap.Cloudy({});
  const c = condition.toLowerCase();
  if (c.includes('clear') && c.includes('night')) return IconMap['Clear Night']({});
  if (c.includes('clear') || c.includes('sunny')) return IconMap.Sunny({});
  if (c.includes('cloud') && c.includes('part')) return IconMap['Partly Cloudy']({});
  if (c.includes('cloud')) return IconMap.Cloudy({});
  if (c.includes('rain') || c.includes('shower')) return IconMap.Rain({});
  if (c.includes('thunder')) return IconMap.Thunderstorm({});
  if (c.includes('snow')) return IconMap.Snow({});
  return IconMap.Cloudy({});
}

const DayPill = ({ day, iconComponent, hi, lo }) => (
  <div className="day-pill d-flex flex-column align-items-center me-3" style={{ minWidth: 88 }}>
    <div className="fw-bold small text-white text-center">{day}</div>
    <div className="my-1">{iconComponent}</div>
    <div className="text-white small fw-semibold">{hi}°C / {lo}°C</div>
  </div>
);

export const defaultData = {
  location: 'Rourkela, IN',
  condition: 'Clear Sky',
  temp: 18,
  wind: '0 m/s',
  precip: '0 mm/hr',
  pressure: '1018 mb',
  days: [
    { d: 'SAT', hi: 26, lo: 12, cond: 'Partly Cloudy' },
    { d: 'SUN', hi: 26, lo: 11, cond: 'Partly Cloudy' },
    { d: 'MON', hi: 26, lo: 11, cond: 'Partly Cloudy' },
    { d: 'TUE', hi: 25, lo: 10, cond: 'Partly Cloudy' },
    { d: 'WED', hi: 25, lo: 10, cond: 'Partly Cloudy' },
    { d: 'THU', hi: 25, lo: 10, cond: 'Partly Cloudy' },
  ],
};

export default function WeatherMiniWidget({ data = defaultData, imageUrl = '/mnt/data/Screenshot 2025-11-21 at 7.47.16 PM.png' }) {
  // Note: imageUrl uses the uploaded file path from the conversation history.

  return (
    <div className="weather-mini-widget p-3" style={{ maxWidth: 1000,width: '100%' }}>
      <style>{`
        .wm-card{ background:#59B785; border-radius:12px; padding:20px; color:#fff; border:6px solid rgba(0,0,0,0.06); }
        .wm-left{ display:flex; flex-direction:column; align-items:center; gap:12px; }
        .wm-temp{ font-size:64px; font-weight:700; line-height:1; }
        .wm-condition{ font-size:20px; font-weight:700; }
        .wm-metrics{ text-align:right; min-width:160px }
        .day-strip{ display:flex; gap:12px; overflow:auto; padding-bottom:4px }
        .day-pill{ flex:0 0 auto }

        /* responsive tweaks */
        @media (max-width: 900px){ .wm-temp{ font-size:48px } .wm-metrics{ min-width:120px; font-size:14px } }
        @media (max-width: 640px){
          .wm-card{ padding:14px }
          .wm-temp{ font-size:36px }
          .wm-left{ order:0 }
          .wm-metrics{ order:2; text-align:left; margin-top:10px }
          .day-strip{ gap:10px }
        }
      `}</style>

      <div className="wm-card d-flex flex-wrap align-items-start">
        {/* left icon */}
        <div className="wm-left me-3 align-self-start">
          <div style={{ width: 84, height: 84, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {getWeatherIcon(data.condition)}
          </div>
          <div className="wm-condition">{data.condition}</div>
        </div>

        {/* center block */}
        <div style={{ flex: '1 1 360px', minWidth: 220 }} className="px-2">
          <div className="text-center mb-1">
            <div className="fw-bold" style={{ fontSize: 22 }}>{data.location}</div>
          </div>

          <div className="d-flex align-items-center justify-content-center mb-2">
            <div className="wm-temp">{data.temp}°C</div>
          </div>

          <div className="day-strip mt-2">
            {data.days.map((day, idx) => (
              <DayPill key={idx} day={day.d} iconComponent={getWeatherIcon(day.cond)} hi={day.hi} lo={day.lo} />
            ))}
          </div>
        </div>

        {/* right metrics */}
        <div className="wm-metrics ps-3 pt-1">
          <div className="small text-white-50 mb-3">&nbsp;</div>
          <div className="small fw-bold">Wind: <span className="fw-normal">{data.wind}</span></div>
          <div className="small fw-bold">Precip: <span className="fw-normal">{data.precip}</span></div>
          <div className="small fw-bold">Pressure: <span className="fw-normal">{data.pressure}</span></div>
          
        </div>
      </div>
    </div>
  );
}
