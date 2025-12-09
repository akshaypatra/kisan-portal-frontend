/* Full-file: SeedSellerDashboard.jsx (updated SellView using react-qr-scanner) */
import React, { useEffect, useMemo, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FiLayers, FiPlusCircle, FiShoppingCart, FiBarChart2, FiClipboard, FiUser } from 'react-icons/fi';
import { AiOutlineQrcode } from 'react-icons/ai';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { seedAPI, plotsAPI } from '../../services/api';
import CONFIG from '../../config';
import Select from 'react-select';
import { Scanner } from '@yudiel/react-qr-scanner';
import AIAdvisoryBanner from '../../Components/Common/AIAdvisoryBanner';
// import { QrReader } from 'react-qr-reader';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend);

// ----------------------- Helpers & mock data -----------------------
function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : initial; } catch { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} }, [key, state]);
  return [state, setState];
}

function genQR(batch) {
  return JSON.stringify({ id: batch.id, seed: batch.seed, breed: batch.breed, remaining: batch.remaining });
}

const DEMO_BATCHES = [
  { id: 'B-1001', seed: 'Hybrid Maize', breed: 'H-200', total: 1000, sold: 420, remaining: 580, testInfo: 'Germination 92%', pestInfo: 'None', howToGrow: 'Row spacing 20cm', trace: 'tx:0xab12' },
  { id: 'B-1002', seed: 'Short Millet', breed: 'S-50', total: 500, sold: 150, remaining: 350, testInfo: 'Germination 85%', pestInfo: 'Rust observed', howToGrow: 'Broadcast sowing', trace: '' },
  { id: 'B-1003', seed: 'Pulse Mix', breed: 'P-10', total: 300, sold: 75,  remaining: 225, testInfo: 'Purity 98%', pestInfo: 'None', howToGrow: 'Intercrop friendly', trace: 'ipfs:Qm...' },
];

const DEMO_SALES = [
  { id: 'S-1', batchId: 'B-1001', qty: 50, date: '2025-11-10', plot: 'P-101' },
  { id: 'S-2', batchId: 'B-1002', qty: 30, date: '2025-11-12', plot: 'P-112' },
  { id: 'S-3', batchId: 'B-1001', qty: 70, date: '2025-11-15', plot: 'P-130' },
  { id: 'S-4', batchId: 'B-1003', qty: 20, date: '2025-11-20', plot: 'P-150' },
  { id: 'S-5', batchId: 'B-1001', qty: 100, date: '2025-11-22', plot: 'P-170' },
  { id: 'S-6', batchId: 'B-1002', qty: 50, date: '2025-11-24', plot: 'P-190' },
  { id: 'S-7', batchId: 'B-1003', qty: 25, date: '2025-11-27', plot: 'P-199' },
];

function salesHistogram(sales) {
  const buckets = { '1-25': 0, '26-50': 0, '51-100': 0, '101+': 0 };
  sales.forEach(s => {
    const q = s.qty;
    if (q <= 25) buckets['1-25']++;
    else if (q <= 50) buckets['26-50']++;
    else if (q <= 100) buckets['51-100']++;
    else buckets['101+']++;
  });
  return buckets;
}

function totalSalesOverTime(sales) {
  const map = {};
  sales.forEach(s => { map[s.date] = (map[s.date] || 0) + s.qty; });
  const dates = Object.keys(map).sort();
  return { dates, values: dates.map(d => map[d]) };
}

// ----------------------- UI Parts (unchanged except SellView) -----------------------

function TopActions({ active, onChange }) {
  return (
    <div className="d-flex gap-2 flex-wrap mb-3">
      <button className={`btn ${active==='batches' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={()=>onChange('batches')}><FiLayers className="me-1"/> See Batches</button>
      <button className={`btn ${active==='new' ? 'btn-success' : 'btn-outline-success'}`} onClick={()=>onChange('new')}><FiPlusCircle className="me-1"/> Add New Batch</button>
      <button className={`btn ${active==='sell' ? 'btn-warning' : 'btn-outline-warning'}`} onClick={()=>onChange('sell')}><FiShoppingCart className="me-1"/> Sell to Farmer</button>
      {/* <button className={`btn ${active==='sales' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={()=>onChange('sales')}><FiBarChart2 className="me-1"/> Total Sales</button> */}
    </div>
  );
}

function BatchOverviewCard({ batch, onCopy }) {
  const sold = batch.sold || 0;
  const remaining = batch.remaining || (batch.total - sold);
  const pieData = { labels: ['Sold','Remaining'], datasets:[{ data:[sold,remaining], backgroundColor:['#ff6384','#36a2eb'] }] };

  return (
    <div className="card p-3 shadow-sm h-100">
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div>
          <h6 className="mb-0">{batch.seed} <small className="text-muted">{batch.breed}</small></h6>
          <div className="small text-muted">{batch.id}</div>
        </div>
        <div className="text-end small">
          <div className="fw-bold">{batch.remaining}/{batch.total}</div>
          <div className="text-muted">remaining</div>
        </div>
      </div>

      <div className="d-flex gap-3">
        <div style={{width:120}}>
          <Pie data={pieData} />
        </div>
        <div className="flex-grow-1">
          <p className="small text-muted mb-1">{batch.testInfo}</p>
          <p className="small text-muted mb-2">{batch.pestInfo}</p>
          <p className="small"><strong>How to grow:</strong> {batch.howToGrow}</p>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-sm btn-outline-primary" onClick={()=>onCopy(batch)}><FiClipboard className="me-1"/> Copy QR</button>
            <Link className="btn btn-sm btn-outline-dark" href="#" onClick={(e)=>{e.preventDefault(); alert('Open batch details (demo)')}}>View details</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function NewBatchView({ breeds, onCreateBreed, onCreateBatch, loading }) {
  const [breedForm, setBreedForm] = useState({
    seed: '',
    breed: '',
    testInfo: '',
    pestInfo: '',
    howToGrow: '',
  });
  const [batchForm, setBatchForm] = useState({
    breedId: '',
    seed: '',
    breedName: '',
    total: 100,
    testInfo: '',
    pestInfo: '',
    howToGrow: '',
    trace: '',
  });
  const [savingBreed, setSavingBreed] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  function handleBreedChange(field, value) {
    setBreedForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitBreed(e) {
    e.preventDefault();
    if (!breedForm.seed.trim() || !breedForm.breed.trim()) {
      alert('Seed and breed are required');
      return;
    }
    setSavingBreed(true);
    const result = await onCreateBreed({
      seed_name: breedForm.seed.trim(),
      breed_name: breedForm.breed.trim(),
      test_info: breedForm.testInfo,
      pest_notes: breedForm.pestInfo,
      how_to_grow: breedForm.howToGrow,
    });
    setSavingBreed(false);
    if (result?.success) {
      setStatusMsg('Breed saved.');
      setBreedForm({ seed: '', breed: '', testInfo: '', pestInfo: '', howToGrow: '' });
      setTimeout(() => setStatusMsg(''), 3000);
    } else if (result?.error) {
      setStatusMsg(`Error: ${result.error}`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  }

  function handleBatchField(field, value) {
    setBatchForm((prev) => ({ ...prev, [field]: value }));
  }

  const breedOptions = useMemo(
    () =>
      breeds.map((b) => ({
        value: String(b.id),
        label: `${b.seed} - ${b.breed}`,
        data: b,
      })),
    [breeds]
  );

  const selectedBreedOption = useMemo(
    () =>
      breedOptions.find((opt) => opt.value === String(batchForm.breedId)) || null,
    [breedOptions, batchForm.breedId]
  );

  function handleBreedSelect(option) {
    if (!option) {
      setBatchForm((prev) => ({
        ...prev,
        breedId: '',
        seed: '',
        breedName: '',
        testInfo: '',
        pestInfo: '',
        howToGrow: '',
      }));
      return;
    }
    const selected = option.data;
    setBatchForm((prev) => ({
      ...prev,
      breedId: option.value,
      seed: selected?.seed || '',
      breedName: selected?.breed || '',
      testInfo: selected?.testInfo || '',
      pestInfo: selected?.pestInfo || '',
      howToGrow: selected?.howToGrow || '',
    }));
  }

  const breedSelected = Boolean(batchForm.breedId);

  async function submitBatch(e) {
    e.preventDefault();
    if (!batchForm.breedId) {
      alert('Select a breed for this batch');
      return;
    }
    if (!batchForm.total || Number(batchForm.total) <= 0) {
      alert('Enter total units');
      return;
    }
    setSavingBatch(true);
    const payload = {
      breed_id: Number(batchForm.breedId),
      total_units: Number(batchForm.total),
      seed_name: batchForm.seed,
      breed_name: batchForm.breedName,
      test_info: batchForm.testInfo,
      pest_notes: batchForm.pestInfo,
      how_to_grow: batchForm.howToGrow,
      trace_code: batchForm.trace,
    };
    const result = await onCreateBatch(payload);
    setSavingBatch(false);
    if (result?.success) {
      setStatusMsg('Batch created.');
      setBatchForm({
        breedId: '',
        seed: '',
        breedName: '',
        total: 100,
        testInfo: '',
        pestInfo: '',
        howToGrow: '',
        trace: '',
      });
      setTimeout(() => setStatusMsg(''), 3000);
    } else if (result?.error) {
      setStatusMsg(`Error: ${result.error}`);
      setTimeout(() => setStatusMsg(''), 4000);
    }
  }

  return (
    <div className="row g-4">
      <div className="col-12">
        {statusMsg && <div className="alert alert-success py-2">{statusMsg}</div>}
        {loading && <div className="alert alert-info py-2">Syncing seed data...</div>}
      </div>
      <div className="col-12 col-lg-5">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Create Seed Breed</h5>
            <form onSubmit={submitBreed} className="row g-3">
              <div className="col-12">
                <label className="form-label">Seed</label>
                <input className="form-control" value={breedForm.seed} onChange={(e) => handleBreedChange('seed', e.target.value)} placeholder="e.g. Mustard" />
              </div>
              <div className="col-12">
                <label className="form-label">Breed name</label>
                <input className="form-control" value={breedForm.breed} onChange={(e) => handleBreedChange('breed', e.target.value)} placeholder="e.g. M-201" />
              </div>
              <div className="col-12">
                <label className="form-label">Test info</label>
                <input className="form-control" value={breedForm.testInfo} onChange={(e) => handleBreedChange('testInfo', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">Pest notes</label>
                <input className="form-control" value={breedForm.pestInfo} onChange={(e) => handleBreedChange('pestInfo', e.target.value)} />
              </div>
              <div className="col-12">
                <label className="form-label">How to grow</label>
                <textarea className="form-control" rows={3} value={breedForm.howToGrow} onChange={(e) => handleBreedChange('howToGrow', e.target.value)} />
              </div>
              <div className="col-12 text-end">
                <button className="btn btn-success" disabled={savingBreed}>
                  {savingBreed ? 'Saving...' : 'Save Breed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="col-12 col-lg-7">
        <div className="card shadow-sm">
          <div className="card-body">
            <h5 className="mb-3">Create Batch</h5>
            <form onSubmit={submitBatch} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Select Breed</label>
                <Select
                  classNamePrefix="seed-select"
                  options={breedOptions}
                  value={selectedBreedOption}
                  onChange={handleBreedSelect}
                  placeholder="Start typing seed or breed"
                  isClearable
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Total units</label>
                <input
                  type="number"
                  min={1}
                  className="form-control"
                  value={batchForm.total}
                  onChange={(e) => handleBatchField('total', e.target.value)}
                  disabled={!breedSelected}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Seed</label>
                <input
                  className="form-control"
                  value={batchForm.seed}
                  onChange={(e) => handleBatchField('seed', e.target.value)}
                  disabled={!breedSelected}
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Breed name</label>
                <input
                  className="form-control"
                  value={batchForm.breedName}
                  onChange={(e) => handleBatchField('breedName', e.target.value)}
                  disabled={!breedSelected}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Test info</label>
                <input
                  className="form-control"
                  value={batchForm.testInfo}
                  onChange={(e) => handleBatchField('testInfo', e.target.value)}
                  disabled={!breedSelected}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Pest notes</label>
                <input
                  className="form-control"
                  value={batchForm.pestInfo}
                  onChange={(e) => handleBatchField('pestInfo', e.target.value)}
                  disabled={!breedSelected}
                />
              </div>
              <div className="col-12">
                <label className="form-label">How to grow</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={batchForm.howToGrow}
                  onChange={(e) => handleBatchField('howToGrow', e.target.value)}
                  disabled={!breedSelected}
                />
              </div>
              <div className="col-12">
                <label className="form-label">Trace / QR value (optional)</label>
                <input
                  className="form-control"
                  value={batchForm.trace}
                  onChange={(e) => handleBatchField('trace', e.target.value)}
                  placeholder="tx hash or link"
                  disabled={!breedSelected}
                />
              </div>
              <div className="col-12 text-end">
                <button className="btn btn-primary" disabled={savingBatch || !breedSelected}>
                  {savingBatch ? 'Saving...' : breedSelected ? 'Create Batch' : 'Select a breed first'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function PlotSummaryCard({ info, loading, error }) {
  if (loading) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <span className="text-muted">Loading plot details...</span>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body">
          <div className="alert alert-warning mb-0">{error}</div>
        </div>
      </div>
    );
  }
  if (!info) {
    return (
      <div className="card shadow-sm h-100">
        <div className="card-body text-muted">
          Scan a plot QR or enter a Plot ID to preview farmer details.
        </div>
      </div>
    );
  }

  let photoSrc = null;
  if (info.photo_file) {
    if (info.photo_file.startsWith('http')) {
      photoSrc = info.photo_file;
    } else {
      const base = CONFIG.API_BASE_URL.replace(/\/$/, '');
      const path = info.photo_file.startsWith('/') ? info.photo_file : `/${info.photo_file}`;
      photoSrc = `${base}${path}`;
    }
  }

  return (
    <div className="card shadow-sm h-100">
      {photoSrc ? (
        <img src={photoSrc} alt="Plot" className="card-img-top" style={{ maxHeight: 180, objectFit: 'cover' }} />
      ) : (
        <div
          className="d-flex align-items-center justify-content-center bg-light text-muted"
          style={{ height: 180, fontWeight: 600 }}
        >
          Plot #{info.id}
        </div>
      )}
      <div className="card-body">
        <h5 className="card-title mb-2">{info.plot_name}</h5>
        <p className="mb-1">
          <strong>Farmer:</strong> {info.farmer_name || 'Unknown'}
        </p>
        <p className="mb-1">
          <strong>Location:</strong> {info.farmer_location || 'Not available'}
        </p>
        <p className="mb-1">
          <strong>Area:</strong> {info.user_provided_area || '-'} acres
        </p>
        {info.description && (
          <p className="text-muted mb-0">
            <strong>Notes:</strong> {info.description}
          </p>
        )}
      </div>
    </div>
  );
}

function QRScannerModal({ title, onClose, onDetected }) {
  const [hasDecoded, setHasDecoded] = useState(false);

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-md">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <Scanner
              onScan={(text) => {
                if (text && !hasDecoded) {
                  setHasDecoded(true);
                  onDetected(text);
                }
              }}
              onError={(error) => console.error(error?.message || error)}
              constraints={{ facingMode: 'environment' }}
              style={{ width: '100%' }}
            />
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== Updated SellView — uses react-qr-scanner ===================== */
function SellView({ batches, onRecord, onUpdateBatch }) {
  const [plotInput, setPlotInput] = useState('');
  const [plotInfo, setPlotInfo] = useState(null);
  const [plotLoading, setPlotLoading] = useState(false);
  const [plotError, setPlotError] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showPlotScanner, setShowPlotScanner] = useState(false);
  const [showBatchScanner, setShowBatchScanner] = useState(false);

  const batchOptions = useMemo(
    () =>
      batches.map((b) => ({
        value: String(b.id),
        label: `${b.id} - ${b.seed}`,
        data: b,
      })),
    [batches]
  );

  useEffect(() => {
    if (!plotInput) {
      setPlotInfo(null);
      setPlotError('');
      return;
    }
    const timer = setTimeout(() => {
      fetchPlotDetails(plotInput);
    }, 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plotInput]);

  const fetchPlotDetails = async (value) => {
    if (!value) return;
    setPlotLoading(true);
    setPlotError('');
    try {
      const response = await plotsAPI.getPublicDetails(value);
      setPlotInfo(response.data);
      setPlotError('');
    } catch (err) {
      const rawDetail = err?.response?.data?.detail;
      const message =
        typeof rawDetail === 'string'
          ? rawDetail
          : Array.isArray(rawDetail)
          ? rawDetail.map((d) => d?.msg || JSON.stringify(d)).join(', ')
          : err?.message || 'Unable to find plot';
      setPlotInfo(null);
      setPlotError(message);
    } finally {
      setPlotLoading(false);
    }
  };

  const batchSelected = Boolean(selectedBatch);

  function submit(e){ 
    e && e.preventDefault();
    if(!batchSelected) return alert('Please select a batch.');
    if(!plotInfo) return alert('Please select or scan a plot.');
    if(quantity <= 0) return alert('Quantity must be at least 1.');
    // create sale record
    const sale = {
      id:'S-'+Math.floor(Math.random()*90000+1000),
      batchId: selectedBatch.value,
      qty: Number(quantity),
      date: new Date().toISOString(),
      plot: plotInfo.id,
      plotName: plotInfo.plot_name,
    };
    onRecord(sale);

    // update local batch counts if caller provided onUpdateBatch
    if (typeof onUpdateBatch === 'function') {
      onUpdateBatch(selectedBatch.value, Number(quantity));
    }

    // reset fields
    setPlotInput(''); setPlotInfo(null); setSelectedBatch(null); setQuantity(1);
  }

  const extractScannerText = (result) => {
    if (!result) return '';
    let payload = result;
    if (Array.isArray(payload) && payload.length) {
      payload = payload[0];
    }
    if (typeof payload === 'object') {
      return payload?.text || payload?.rawValue || payload?.data || '';
    }
    return String(payload);
  };

  const handlePlotScan = (result) => {
    console.log('QR plot scan raw result:', result);
    const text = extractScannerText(result);
    if (!text) return;
    let value = text;
    try {
      const parsed = JSON.parse(text);
      value = parsed.plot_id || parsed.id || parsed.plot || text;
    } catch {
      value = text;
    }
    setPlotInput(String(value));
    setShowPlotScanner(false);
  };

  const handleBatchScan = (result) => {
    console.log('QR batch scan raw result:', result);
    const text = extractScannerText(result);
    if (!text) return;
    let value = text;
    try {
      const parsed = JSON.parse(text);
      value = parsed.id || parsed.batchId || text;
    } catch {
      value = text;
    }
    const option = batchOptions.find((opt) => opt.value === String(value));
    if (option) {
      setSelectedBatch(option);
    } else {
      alert(`Batch ${value} not found in your inventory.`);
    }
    setShowBatchScanner(false);
  };

  const selectedBatchOption = selectedBatch;

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="mb-3">Sell to Farmer</h5>
        <div className="row g-3">
          <div className="col-lg-7">
            <form onSubmit={submit} className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Plot ID</label>
                <div className="input-group border border-2 rounded">
                  <input
                    className="form-control border-0"
                    value={plotInput}
                    onChange={(e) => setPlotInput(e.target.value)}
                    placeholder="Scan or enter plot id"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={() => setShowPlotScanner(true)}
                  >
                    <AiOutlineQrcode />
                  </button>
                </div>
                {plotError && <div className="text-danger small">{plotError}</div>}
                <div className="form-text">Scan farmer's plot QR or type the Plot ID.</div>
              </div>

              <div className="col-md-6">
                <label className="form-label">Batch</label>
                <div className="d-flex gap-2 align-items-center">
                  <div className="flex-grow-1">
                    <Select
                      classNamePrefix="seed-batch-select"
                      options={batchOptions}
                    value={selectedBatchOption}
                    onChange={(option) => {
                      setSelectedBatch(option);
                    }}
                      placeholder="Select batch"
                      isClearable
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowBatchScanner(true)}
                    title="Scan batch QR"
                  >
                    <AiOutlineQrcode />
                  </button>
                </div>
              </div>

              <div className="col-md-4">
                <label className="form-label">Quantity</label>
                <div className="input-group border border-2 rounded">
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setQuantity(q=>Math.max(1,q-1))}>-</button>
                  <input type="number" min={1} className="form-control text-center border-0" value={quantity} onChange={e=>setQuantity(Number(e.target.value)||1)} />
                  <button type="button" className="btn btn-outline-secondary" onClick={()=>setQuantity(q=>q+1)}>+</button>
                </div>
                <div className="form-text">Units to sell from the selected batch.</div>
              </div>

              <div className="col-md-8 d-flex align-items-end">
                <div>
                  <button className="btn btn-success mb-2" type="submit" disabled={!plotInfo || !batchSelected}>
                    <FiShoppingCart className="me-1"/> Record Sale
                  </button>
                  <div className="small text-muted">
                    Recorded sale updates batch inventory automatically.
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div className="col-lg-5">
            <PlotSummaryCard info={plotInfo} loading={plotLoading} error={plotError} />
          </div>
        </div>

        {(showPlotScanner || showBatchScanner) && (
          <QRScannerModal
            title={showPlotScanner ? 'Scan Plot QR' : 'Scan Batch QR'}
            onClose={() => {
              setShowPlotScanner(false);
              setShowBatchScanner(false);
            }}
            onDetected={(result) => {
              if (showPlotScanner) {
                handlePlotScan(result);
              } else {
                handleBatchScan(result);
              }
            }}
          />
        )}
      </div>
    </div>
  );
}
/* ===================== end SellView ===================== */

function SalesAnalytics({ sales }) {
  const hist = salesHistogram(sales);
  const histLabels = Object.keys(hist);
  const histValues = Object.values(hist);
  const timeData = totalSalesOverTime(sales);

  const topCounts = {};
  sales.forEach(s=> topCounts[s.batchId] = (topCounts[s.batchId]||0)+s.qty);
  const topLabels = Object.keys(topCounts);
  const topValues = Object.values(topCounts);

  const salesLine = { labels: timeData.dates, datasets: [{ label: 'Units sold', data: timeData.values, fill:false, borderColor:'#007bff' }] };
  const histBar = { labels: histLabels, datasets: [{ label:'Sales frequency', data: histValues, backgroundColor:['#4dc9f6','#f67019','#f53794','#537bc4'] }] };
  const topDough = { labels: topLabels, datasets:[{ data: topValues, backgroundColor: ['#ff6384','#36a2eb','#ffcd56','#4bc0c0'] }] };

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="mb-3">Sales Analytics</h5>
        <div className="row g-3">
          <div className="col-md-8">
            <div className="card p-3">
              <h6 className="small text-muted">Total sales over time</h6>
              <Line data={salesLine} />
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 mb-3">
              <h6 className="small text-muted">Top items</h6>
              <Doughnut data={topDough} />
            </div>
            <div className="card p-3">
              <h6 className="small text-muted">Sales histogram</h6>
              <Bar data={histBar} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------- Main App -----------------------
export default function SeedSellerDashboard() {
  const [view, setView] = useState('batches');
  const [batches, setBatches] = useLocalStorage('demo_batches', DEMO_BATCHES);
  const [breeds, setBreeds] = useLocalStorage('demo_breeds', []);
  const [sales, setSales] = useLocalStorage('demo_sales', DEMO_SALES);
  const [activity, setActivity] = useLocalStorage('demo_activity', ['Demo activity loaded']);
  const [user, setUser] = useLocalStorage('demo_user', { name: 'DemoSeller' });
  const [loadingSeedData, setLoadingSeedData] = useState(false);
  const [seedError, setSeedError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch {
        // ignore
      }
    }
    syncSeedData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function syncSeedData() {
    setLoadingSeedData(true);
    setSeedError('');
    try {
      const [breedsRes, batchesRes] = await Promise.all([
        seedAPI.listBreeds(),
        seedAPI.listBatches(),
      ]);
      setBreeds(breedsRes.data);
      setBatches(batchesRes.data);
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.detail || 'Unable to sync seed data. Showing cached/demo data.';
      setSeedError(message);
      if (!Array.isArray(breeds) || !breeds.length) {
        setBreeds([]);
      }
      if (!Array.isArray(batches) || !batches.length) {
        setBatches(DEMO_BATCHES);
      }
    } finally {
      setLoadingSeedData(false);
    }
  }

  async function handleCreateBreed(payload) {
    try {
      const response = await seedAPI.createBreed(payload);
      setBreeds((prev) => [response.data, ...prev]);
      setActivity((a) => [`Created breed ${response.data.breed}`, ...a]);
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.detail || 'Failed to create breed';
      setSeedError(message);
      return { success: false, error: message };
    }
  }

  async function handleCreateBatch(payload) {
    try {
      const response = await seedAPI.createBatch(payload);
      setBatches((prev) => [response.data, ...prev]);
      setActivity((a) => [`Created batch ${response.data.id}`, ...a]);
      setView('batches');
      return { success: true };
    } catch (err) {
      const message = err?.response?.data?.detail || 'Failed to create batch';
      setSeedError(message);
      return { success: false, error: message };
    }
  }

  function recordSale(s) {
    setSales(prev => { const next = [s, ...prev]; setActivity(a=>[`Recorded sale ${s.id} (${s.qty})`, ...a]);
      // update batch counts
      setBatches(bs => bs.map(b => b.id === s.batchId ? { ...b, sold: (b.sold || 0) + s.qty, remaining: Math.max(0, (b.remaining || (b.total - (b.sold||0))) - s.qty) } : b));
      return next;
    });
  }

  // helper used by SellView to update batch counts synchronously
  function updateBatchCounts(batchId, qty) {
    setBatches(bs => bs.map(b => b.id === batchId ? { ...b, sold: (b.sold || 0) + qty, remaining: Math.max(0, (b.remaining || (b.total - (b.sold||0))) - qty) } : b));
  }

  function copyQR(batch) { navigator.clipboard?.writeText(genQR(batch)); setActivity(a=>[`Copied QR ${batch.id}`, ...a]); alert('QR copied (demo)'); }

  return (
    <div className="container my-4">
      <AIAdvisoryBanner />
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0 text-gradient" style={{background:'linear-gradient(90deg,#6a11cb,#2575fc)', WebkitBackgroundClip:'text', color:'transparent'}}>Seed Seller Dashboard</h3>
          <div className="small text-muted">Colorful, interactive demo UI</div>
        </div>
        {/* <div className="d-flex gap-2">
          <div className="badge bg-light text-dark d-flex align-items-center gap-2"><FiUser/> {user?.name}</div>
        </div> */}
      </div>
      {seedError && <div className="alert alert-warning py-2">{seedError}</div>}

      <TopActions active={view} onChange={setView} />

      {view === 'new' && (
        <NewBatchView
          breeds={breeds}
          onCreateBreed={handleCreateBreed}
          onCreateBatch={handleCreateBatch}
          loading={loadingSeedData}
        />
      )}

      {view === 'batches' && (
        <div className="row g-3">
          {batches.map(b => (
            <div className="col-md-6" key={b.id}><BatchOverviewCard batch={b} onCopy={copyQR} /></div>
          ))}
        </div>
      )}

      {view === 'sell' && <SellView batches={batches} onRecord={recordSale} onUpdateBatch={updateBatchCounts} />}

      {view === 'sales' && <SalesAnalytics sales={sales} />}

      <div className="row mt-4">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6 className="mb-2">Activity</h6>
              <ul className="list-group list-group-flush small">
                {activity.map((a,i)=>(<li className="list-group-item" key={i}>{a}</li>))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-body text-center">
              <h6 className="mb-2">Totals</h6>
              <div className="d-flex justify-content-around align-items-center">
                <div>
                  <div className="fs-4 fw-bold">{sales.reduce((s,x)=>s+x.qty,0)}</div>
                  <div className="small text-muted">Units sold</div>
                </div>
                <div>
                  <div className="fs-4 fw-bold">{batches.length}</div>
                  <div className="small text-muted">Batches</div>
                </div>
                <div>
                  <div className="fs-4 fw-bold">{sales.length}</div>
                  <div className="small text-muted">Sales</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="text-center text-muted small mt-4">Demo • Replace mock data & connect real APIs • Camera requires HTTPS or localhost</footer>
    </div>
  );
}
