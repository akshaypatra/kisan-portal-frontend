// src/components/MandiMarketDashboardRedux.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMandiRecords } from './mandiSlice';

/**
 * MandiMarketDashboardRedux.jsx
 * Polished Bootstrap UI for mandi market data (Redux).
 *
 * Changes:
 * - Uses `arrival_date` as the primary date column (per your request).
 * - Expects records to include fields: state, district, market, commodity, variety, grade,
 *   arrival_date, min_price, max_price, modal_price (falls back gracefully if missing).
 *
 * Usage:
 * - Requires redux store with mandi slice and fetchMandiRecords thunk.
 * - Ensure Bootstrap CSS is loaded globally (import 'bootstrap/dist/css/bootstrap.min.css').
 */

export default function MandiMarketDashboardRedux() {
  const dispatch = useDispatch();
  const { records, total, loading, error } = useSelector((s) => s.mandi || { records: [], total: 0, loading: false, error: null });

  // UI / query state
  const [apiKey, setApiKey] = useState('579b464db66ec23bdd0000016b29150f2bac4f8057aa9349a264fa7d');
  const [format, setFormat] = useState('json'); // xml/json/csv
  const [offset, setOffset] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    state: '',
    district: '',
    market: '',
    commodity: '',
    variety: '',
    grade: ''
  });

  // Fetch when query params change
  useEffect(() => {
    const args = { apiKey, format, offset, limit, filters };
    dispatch(fetchMandiRecords(args));
  }, [dispatch, apiKey, format, offset, limit, filters]);

  function onFilterChange(e) {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setOffset(0);
  }

  function onPrev() {
    setOffset((o) => Math.max(0, o - limit));
  }
  function onNext() {
    setOffset((o) => o + limit);
  }

  // client-side search across visible fields
  const visibleRecords = useMemo(() => {
    if (!search) return records || [];
    const q = search.toLowerCase();
    return (records || []).filter((r) => {
      return (
        (r.commodity && String(r.commodity).toLowerCase().includes(q)) ||
        (r.market && String(r.market).toLowerCase().includes(q)) ||
        (r.variety && String(r.variety).toLowerCase().includes(q)) ||
        (r.state && String(r.state).toLowerCase().includes(q)) ||
        (r.district && String(r.district).toLowerCase().includes(q))
      );
    });
  }, [records, search]);

  // Derived stats for summary cards
  const uniqueMarkets = useMemo(() => new Set((records || []).map((r) => r.market).filter(Boolean)).size, [records]);
  const uniqueCommodities = useMemo(() => new Set((records || []).map((r) => r.commodity).filter(Boolean)).size, [records]);
  const avgModal = useMemo(() => {
    const vals = (records || []).map((r) => {
      const v = r.modal_price ?? r.modal ?? r.modalprice ?? r.modalPrice;
      return Number(v);
    }).filter((v) => Number.isFinite(v));
    if (!vals.length) return null;
    return (vals.reduce((a,b)=>a+b,0) / vals.length);
  }, [records]);

  return (
    <div className="container my-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h2 className="mb-0">Mandi Prices Dashboard</h2>
          <div className="text-muted small">Live market prices · data.gov.in / AGMARKNET — prices are quoted per quintal (₹/quintal)</div>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary"
            onClick={() => { setFilters({ state:'', district:'', market:'', commodity:'', variety:'', grade:'' }); setSearch(''); setOffset(0); }}
            disabled={loading}
          >
            Reset
          </button>
          <button
            className="btn btn-primary"
            onClick={() => dispatch(fetchMandiRecords({ apiKey, format, offset, limit, filters }))}
            disabled={loading}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Controls row */}
      <div className="card card-body mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text">🔎</span>
              <input
                className="form-control"
                placeholder="Search commodity, market, variety, state..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="col-auto">
            <div className="form-check form-switch">
              <input className="form-check-input" id="filtersSwitch" type="checkbox" checked={filtersOpen} onChange={() => setFiltersOpen(s => !s)} />
              <label className="form-check-label small" htmlFor="filtersSwitch">Show advanced filters</label>
            </div>
          </div>

          <div className="col-auto ms-md-auto d-flex gap-2">
            <div className="d-none d-md-flex align-items-center">
              <small className="text-muted me-2">Format</small>
              <select className="form-select form-select-sm" value={format} onChange={(e) => setFormat(e.target.value)}>
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
              </select>
            </div>

            <div className="d-flex align-items-center">
              <small className="text-muted me-2">Limit</small>
              <input type="number" className="form-control form-control-sm" value={limit} min={1} max={100} onChange={(e) => { setLimit(Number(e.target.value)); setOffset(0); }} style={{width: '5.5rem'}} />
            </div>
          </div>
        </div>

        {/* Collapsible advanced filters */}
        {filtersOpen && (
          <div className="row mt-3 g-2">
            <div className="col-md-2"><input name="state" value={filters.state} onChange={onFilterChange} className="form-control" placeholder="State" /></div>
            <div className="col-md-2"><input name="district" value={filters.district} onChange={onFilterChange} className="form-control" placeholder="District" /></div>
            <div className="col-md-2"><input name="market" value={filters.market} onChange={onFilterChange} className="form-control" placeholder="Market" /></div>
            <div className="col-md-2"><input name="commodity" value={filters.commodity} onChange={onFilterChange} className="form-control" placeholder="Commodity" /></div>
            <div className="col-md-2"><input name="variety" value={filters.variety} onChange={onFilterChange} className="form-control" placeholder="Variety" /></div>
            <div className="col-md-2"><input name="grade" value={filters.grade} onChange={onFilterChange} className="form-control" placeholder="Grade" /></div>
          </div>
        )}
      </div>

      {/* Summary cards */}
      <div className="row g-3 mb-3">
        <div className="col-sm-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-subtitle text-muted mb-1">Markets</h6>
                  <h3 className="mb-0">{uniqueMarkets}</h3>
                </div>
                <div className="text-muted small">Records: {records?.length ?? 0}</div>
              </div>
              <div className="mt-2 text-muted small">Unique markets in current page</div>
            </div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-subtitle text-muted mb-1">Commodities</h6>
                  <h3 className="mb-0">{uniqueCommodities}</h3>
                </div>
                <div className="text-muted small">Total results: {total ?? '—'}</div>
              </div>
              <div className="mt-2 text-muted small">Unique commodities in current page</div>
            </div>
          </div>
        </div>

        <div className="col-sm-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h6 className="card-subtitle text-muted mb-1">Avg Modal Price</h6>
                  <h3 className="mb-0">{avgModal ? avgModal.toFixed(2) : '—'}</h3>
                </div>
                <div className="text-muted small">Currency: INR</div>
              </div>
              <div className="mt-2 text-muted small">Average modal price (page)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Table + overlay */}
      <div className="position-relative">
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
              {(!records || records.length === 0) && (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    {error ? <span className="text-danger">Error: {error}</span> : 'No records to display. Try different filters or click Refresh.'}
                  </td>
                </tr>
              )}

              {visibleRecords.map((r, i) => (
                <tr key={i}>
                  <td className="align-middle">{r.arrival_date || r.arrivalDate || '-'}</td>
                  <td className="align-middle">{r.market || r.mandi || '-'}</td>
                  <td className="align-middle">{r.commodity || '-'}</td>
                  <td className="align-middle">{(r.variety || r.grade) ? `${r.variety || ''}${r.variety && r.grade ? ' / ' : ''}${r.grade || ''}` : '-'}</td>
                  <td className="text-end align-middle">{(r.min_price ?? r.min ?? r.low_price) ?? '-'}</td>
                  <td className="text-end align-middle">{(r.max_price ?? r.max ?? r.high_price) ?? '-'}</td>
                  <td className="text-end align-middle">{(r.modal_price ?? r.modal ?? r.modalprice ?? '-')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination & footer */}
      <div className="d-flex justify-content-between align-items-center mt-3">
        <div className="text-muted small">Showing {records?.length ?? 0} records · Total: {total ?? '—'}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" onClick={onPrev} disabled={offset === 0 || loading}>Prev</button>
          <button className="btn btn-outline-secondary" onClick={onNext} disabled={loading || (records && records.length < limit)}>Next</button>
        </div>
      </div>

      
    </div>
  );
}
