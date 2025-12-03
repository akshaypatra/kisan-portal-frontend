import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMandiRecords } from './mandiSlice';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

/**
 * MandiMarketDashboardRedux.jsx
 * - Improved UI with charts and filter-dropdowns populated from API results
 * - Fetches the API once on mount with a large limit (client-side filtering/pagination)
 * - Uses Bootstrap for layout and Recharts for visualizations
 *
 * NOTE: Ensure you have installed:
 *   npm install recharts date-fns
 * and that Bootstrap CSS is loaded globally.
 */

const COLORS = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc949',
  '#af7aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ac',
];

export default function MandiMarketDashboardRedux() {
  const dispatch = useDispatch();
  const { records = [], total = 0, loading = false, error = null } = useSelector((s) => s.mandi || {});

  // UI / query state — we'll fetch once and do client-side filtering
  const [apiKey] = useState('579b464db66ec23bdd0000016b29150f2bac4f8057aa9349a264fa7d');
  const [format] = useState('json');
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(true);

  // selected filter values (dropdowns)
  const [selected, setSelected] = useState({
    state: '',
    district: '',
    market: '',
    commodity: '',
    variety: '',
    grade: '',
  });

  // Chart selection
  //eslint-disable-next-line no-unused-vars
  const [timeSeriesCommodity, setTimeSeriesCommodity] = useState('');

  // Fetch once on mount with a big limit (client-side paging)
  useEffect(() => {
    dispatch(fetchMandiRecords({ apiKey, format, offset: 0, limit: 8000, filters: {} }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  // derive lists for dropdowns from fetched records
  const dropdownLists = useMemo(() => {
    const states = new Set();
    const districts = new Set();
    const markets = new Set();
    const commodities = new Set();
    const varieties = new Set();
    const grades = new Set();

    for (const r of records || []) {
      if (r.state) states.add(r.state);
      if (r.district) districts.add(r.district);
      if (r.market || r.mandi) markets.add(r.market || r.mandi);
      if (r.commodity) commodities.add(r.commodity);
      if (r.variety) varieties.add(r.variety);
      if (r.grade) grades.add(r.grade);
    }

    const toSortedArray = (s) => Array.from(s).filter(Boolean).sort((a,b)=>String(a).localeCompare(b));

    return {
      states: toSortedArray(states),
      districts: toSortedArray(districts),
      markets: toSortedArray(markets),
      commodities: toSortedArray(commodities),
      varieties: toSortedArray(varieties),
      grades: toSortedArray(grades),
    };
  }, [records]);

  // apply client-side filtering + search
  const filteredRecords = useMemo(() => {
    const q = (search || '').trim().toLowerCase();
    return (records || []).filter((r) => {
      if (selected.state && String(r.state) !== selected.state) return false;
      if (selected.district && String(r.district) !== selected.district) return false;
      const marketVal = r.market || r.mandi || '';
      if (selected.market && String(marketVal) !== selected.market) return false;
      if (selected.commodity && String(r.commodity) !== selected.commodity) return false;
      if (selected.variety && String(r.variety) !== selected.variety) return false;
      if (selected.grade && String(r.grade) !== selected.grade) return false;

      if (!q) return true;

      // search across common fields
      const hay = `${r.commodity || ''} ${marketVal} ${r.variety || ''} ${r.state || ''} ${r.district || ''}`.toLowerCase();
      return hay.includes(q);
    });
  }, [records, selected, search]);

  // pagination slice
  const pagedRecords = useMemo(() => {
    const start = offset;
    const end = offset + limit;
    return filteredRecords.slice(start, end);
  }, [filteredRecords, offset, limit]);

  // derived stats
  const uniqueMarkets = useMemo(() => new Set(filteredRecords.map(r => r.market || r.mandi).filter(Boolean)).size, [filteredRecords]);
  const uniqueCommodities = useMemo(() => new Set(filteredRecords.map(r => r.commodity).filter(Boolean)).size, [filteredRecords]);
  const avgModal = useMemo(() => {
    const vals = filteredRecords.map(r => Number(r.modal_price ?? r.modal ?? r.modalprice ?? r.modalPrice)).filter(v => Number.isFinite(v));
    if (!vals.length) return null;
    return vals.reduce((a,b)=>a+b,0)/vals.length;
  }, [filteredRecords]);

  // Charts: 1) avg modal per commodity  2) market share by commodity count  3) time series for selected commodity
  const commodityAggregates = useMemo(() => {
    const map = new Map();
    for (const r of filteredRecords) {
      const key = r.commodity || 'Unknown';
      const v = Number(r.modal_price ?? r.modal ?? r.modalprice ?? r.modalPrice);
      const entry = map.get(key) || { sum: 0, count: 0 };
      if (Number.isFinite(v)) {
        entry.sum += v;
        entry.count += 1;
      }
      map.set(key, entry);
    }
    const arr = [];
    for (const [commodity, { sum, count }] of map.entries()) {
      arr.push({ commodity, avgModal: count ? sum / count : 0, count });
    }
    // sort by count desc
    return arr.sort((a,b)=>b.count - a.count).slice(0, 20);
  }, [filteredRecords]);

  const marketShareData = useMemo(() => {
    const map = new Map();
    for (const r of filteredRecords) {
      const c = r.commodity || 'Unknown';
      map.set(c, (map.get(c) || 0) + 1);
    }
    const arr = Array.from(map.entries()).map(([commodity, value]) => ({ commodity, value }));
    return arr.sort((a,b)=>b.value - a.value).slice(0, 10);
  }, [filteredRecords]);

  function onSelectChange(e) {
    const { name, value } = e.target;
    setSelected(prev => ({ ...prev, [name]: value }));
    setOffset(0);
  }

  function clearAll() {
    setSelected({ state: '', district: '', market: '', commodity: '', variety: '', grade: '' });
    setSearch('');
    setOffset(0);
    setTimeSeriesCommodity('');
  }

  function onPrev() { setOffset(o => Math.max(0, o - limit)); }
  function onNext() { setOffset(o => Math.min(o + limit, Math.max(0, filteredRecords.length - 1))); }

  return (
    <div className="container my-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h2 className="mb-0">Mandi Prices Dashboard</h2>
          <div className="text-muted small">Interactive marketplace analysis — data.gov.in / AGMARKNET</div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary" onClick={clearAll} disabled={loading}>Reset</button>
          <button className="btn btn-primary" onClick={() => dispatch(fetchMandiRecords({ apiKey, format, offset: 0, limit: 8000, filters: {} }))} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div className="card card-body mb-3">
        <div className="row gy-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">🔎</span>
              <input className="form-control" placeholder="Search commodity, market, variety, state..." value={search} onChange={(e)=>setSearch(e.target.value)} />
            </div>
          </div>

          <div className="col-auto">
            <div className="form-check form-switch">
              <input className="form-check-input" id="filtersSwitch" type="checkbox" checked={filtersOpen} onChange={() => setFiltersOpen(s => !s)} />
              <label className="form-check-label small" htmlFor="filtersSwitch">Show filters</label>
            </div>
          </div>

          <div className="col-auto ms-md-auto d-flex gap-2">
            <div className="d-flex align-items-center">
              <small className="text-muted me-2">Limit</small>
              <input type="number" className="form-control form-control-sm" value={limit} min={1} max={200} onChange={(e)=>{ setLimit(Number(e.target.value)); setOffset(0); }} style={{width: '6rem'}} />
            </div>
          </div>
        </div>

        {filtersOpen && (
          <div className="row mt-3 g-2">
            <div className="col-md-2">
              <select name="state" value={selected.state} onChange={onSelectChange} className="form-select">
                <option value="">All States</option>
                {dropdownLists.states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-md-2">
              <select name="district" value={selected.district} onChange={onSelectChange} className="form-select">
                <option value="">All Districts</option>
                {dropdownLists.districts.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-md-2">
              <select name="market" value={selected.market} onChange={onSelectChange} className="form-select">
                <option value="">All Markets</option>
                {dropdownLists.markets.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-md-2">
              <select name="commodity" value={selected.commodity} onChange={(e)=>{ onSelectChange(e); setTimeSeriesCommodity(e.target.value); }} className="form-select">
                <option value="">All Commodities</option>
                {dropdownLists.commodities.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-md-2">
              <select name="variety" value={selected.variety} onChange={onSelectChange} className="form-select">
                <option value="">All Varieties</option>
                {dropdownLists.varieties.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="col-md-2">
              <select name="grade" value={selected.grade} onChange={onSelectChange} className="form-select">
                <option value="">All Grades</option>
                {dropdownLists.grades.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Summary + Charts */}
      <div className="row g-3 mb-3">
        <div className="col-lg-3">
          <div className="card h-100 shadow-sm p-3">
            <div className="text-muted small">Markets</div>
            <h3 className="mb-0">{uniqueMarkets}</h3>
            <div className="text-muted small mt-2">Records: {filteredRecords.length}</div>
          </div>
        </div>

        <div className="col-lg-3">
          <div className="card h-100 shadow-sm p-3">
            <div className="text-muted small">Commodities</div>
            <h3 className="mb-0">{uniqueCommodities}</h3>
            <div className="text-muted small mt-2">Total results: {total || records.length}</div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card h-100 shadow-sm p-3">
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-muted small">Avg Modal Price</div>
                <h3 className="mb-0">{avgModal ? avgModal.toFixed(2) : '—'}</h3>
              </div>
              <div className="text-muted small">Currency: INR</div>
            </div>
            <div className="mt-3">
              <small className="text-muted">Top commodities by count (bar) — click legend items to focus (recharts built-in)</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <h6>Average Modal Price (Top Commodities)</h6>
            <div style={{height: 320}}>
              <ResponsiveContainer>
                <BarChart data={commodityAggregates} layout="vertical" margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
                  <XAxis type="number" />
                  <YAxis dataKey="commodity" type="category" width={140} />
                  <Tooltip formatter={(v) => v ? Number(v).toFixed(2) : v} />
                  <Bar dataKey="avgModal" name="Avg Modal (₹)" fill="#4e79a7" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card shadow-sm p-3 h-100">
            <h6>Market Share by Commodity (count)</h6>
            <div style={{height: 320}}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={marketShareData} dataKey="value" nameKey="commodity" innerRadius={50} outerRadius={110} paddingAngle={2} label={(entry) => entry.commodity}>
                    {marketShareData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="position-relative mt-3">
        {loading && (
          <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{background: 'rgba(255,255,255,0.6)', zIndex: 5}}>
            <div className="text-center">
              <div className="spinner-border text-primary" role="status" aria-hidden="true"></div>
              <div className="mt-2 text-muted">Loading market prices...</div>
            </div>
          </div>
        )}

        <div className="table-responsive shadow-sm rounded">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th style={{minWidth: '110px'}}>Arrival Date</th>
                <th style={{minWidth: '140px'}}>Market</th>
                <th>Commodity</th>
                <th>Variety / Grade</th>
                <th style={{minWidth: '110px'}} className="text-end">Min (₹)</th>
                <th style={{minWidth: '110px'}} className="text-end">Max (₹)</th>
                <th style={{minWidth: '110px'}} className="text-end">Modal (₹)</th>
              </tr>
            </thead>
            <tbody>
              {(pagedRecords.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">{error ? <span className="text-danger">Error: {error}</span> : 'No records to display.'}</td>
                </tr>
              )}

              {pagedRecords.map((r, i) => (
                <tr key={i}>
                  <td className="align-middle">{r.arrival_date || r.arrivalDate || '-'}</td>
                  <td className="align-middle">{r.market || r.mandi || '-'}</td>
                  <td className="align-middle">{r.commodity || '-'}</td>
                  <td className="align-middle">{(r.variety || r.grade) ? `${r.variety || ''}${r.variety && r.grade ? ' / ' : ''}${r.grade || ''}` : '-'}</td>
                  <td className="text-end align-middle">{(r.min_price ?? r.min ?? r.low_price) ?? '-'}</td>
                  <td className="text-end align-middle">{(r.max_price ?? r.max ?? r.high_price) ?? '-'}</td>
                  <td className="text-end align-middle">{(r.modal_price ?? r.modal ?? r.modalprice) ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-3">
          <div className="text-muted small">Showing {pagedRecords.length} · Filtered total: {filteredRecords.length}</div>
          <div className="btn-group">
            <button className="btn btn-outline-secondary" onClick={onPrev} disabled={offset === 0 || loading}>Prev</button>
            <button className="btn btn-outline-secondary" onClick={onNext} disabled={loading || offset + limit >= filteredRecords.length}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
