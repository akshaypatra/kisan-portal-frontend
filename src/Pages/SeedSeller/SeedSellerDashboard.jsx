/* Full-file: SeedSellerDashboard.jsx (updated SellView using react-qr-scanner) */
import React, { useEffect,  useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FiLayers, FiPlusCircle, FiShoppingCart, FiBarChart2, FiCamera, FiClipboard, FiUser } from 'react-icons/fi';
import { AiOutlineQrcode } from 'react-icons/ai';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';

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
      <button className={`btn ${active==='sales' ? 'btn-danger' : 'btn-outline-danger'}`} onClick={()=>onChange('sales')}><FiBarChart2 className="me-1"/> Total Sales</button>
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

function NewBatchView({ onSave }) {
  const [seed, setSeed] = useState('');
  const [breed, setBreed] = useState('');
  const [total, setTotal] = useState(100);
  const [testInfo, setTestInfo] = useState('');
  const [pestInfo, setPestInfo] = useState('');
  const [howToGrow, setHowToGrow] = useState('');

  function submit(e){ e && e.preventDefault(); if(!seed||!breed) return alert('seed & breed required'); const b={ id:'B-'+Math.floor(Math.random()*9000+1000), seed, breed, total: Number(total), sold:0, remaining: Number(total), testInfo, pestInfo, howToGrow }; onSave(b); setSeed(''); setBreed(''); setTotal(100); setTestInfo(''); setPestInfo(''); setHowToGrow(''); }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="mb-3">Add New Batch</h5>
        <form onSubmit={submit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Seed</label>
            <input className="form-control form-control-lg border border-2" value={seed} onChange={e=>setSeed(e.target.value)} placeholder="Hybrid Maize" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Breed</label>
            <input className="form-control form-control-lg border border-2" value={breed} onChange={e=>setBreed(e.target.value)} placeholder="H-200" />
          </div>
          <div className="col-md-4">
            <label className="form-label">Total units</label>
            <input type="number" min={1} className="form-control border border-2" value={total} onChange={e=>setTotal(e.target.value)} />
            <div className="form-text">Total units produced for this batch.</div>
          </div>
          <div className="col-12">
            <label className="form-label">Test info</label>
            <input className="form-control border border-2" value={testInfo} onChange={e=>setTestInfo(e.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">Pest notes</label>
            <input className="form-control border border-2" value={pestInfo} onChange={e=>setPestInfo(e.target.value)} />
          </div>
          <div className="col-12">
            <label className="form-label">How to grow</label>
            <textarea className="form-control border border-2" rows={3} value={howToGrow} onChange={e=>setHowToGrow(e.target.value)} />
          </div>
          <div className="col-12 text-end">
            <button className="btn btn-success">Create batch</button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===================== Updated SellView — uses react-qr-scanner ===================== */
function SellView({ batches, onRecord, onUpdateBatch }) {
  const [plotId, setPlotId] = useState('');
  const [batchId, setBatchId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [farmData, setFarmData] = useState(null);

  const [showBatchScanner, setShowBatchScanner] = useState(false);
  const [showFarmerScanner, setShowFarmerScanner] = useState(false);

  useEffect(()=> {
    return () => {
      // cleanup not required for react-qr-scanner
    };
  }, []);

  // helper to robustly extract text from scanner result
  function extractTextFromScan(data) {
    if (!data) return null;
    // react-qr-scanner often returns a string; some wrappers return { text: '...' }
    if (typeof data === 'string') return data;
    if (data?.text) return data.text;
    // some browsers return a result object with .data or .result
    if (data?.data) return data.data;
    if (data?.result) return data.result;
    return String(data);
  }

  function handleBatchScan(result) {
    const text = extractTextFromScan(result);
    if (!text) return;
    // try parse JSON -> {id: "..."} else treat as id
    try {
      const parsed = JSON.parse(text);
      if (parsed.id) setBatchId(parsed.id);
      else setBatchId(text);
    } catch {
      setBatchId(text);
    }
    setShowBatchScanner(false);
    alert('Batch scanned: ' + (JSON.parse(text)?.id || text));
  }

  function handleBatchError(err) {
    console.warn('Batch scan error', err);
    // keep scanner open so user can retry; optionally close on error
  }

  function handleFarmerScan(result) {
    const text = extractTextFromScan(result);
    if (!text) return;
    try {
      const parsed = JSON.parse(text);
      setFarmData(parsed);
    } catch {
      setFarmData({ raw: text });
    }
    setShowFarmerScanner(false);
    alert('Farmer scanned');
  }

  function handleFarmerError(err) {
    console.warn('Farmer scan error', err);
  }

  function submit(e){ 
    e && e.preventDefault();
    if(!batchId||!plotId) return alert('Please provide both batch and plot ID.');
    if(quantity <= 0) return alert('Quantity must be at least 1.');
    // create sale record
    const sale = { id:'S-'+Math.floor(Math.random()*90000+1000), batchId, qty: Number(quantity), date: new Date().toISOString(), plot: plotId };
    onRecord(sale);

    // update local batch counts if caller provided onUpdateBatch
    if (typeof onUpdateBatch === 'function') {
      onUpdateBatch(batchId, Number(quantity));
    }

    // reset fields
    setPlotId(''); setBatchId(''); setQuantity(1); setFarmData(null);
  }

  return (
    <div className="card shadow-sm">
      <div className="card-body">
        <h5 className="mb-3">Sell to Farmer</h5>

        <form onSubmit={submit} className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Plot ID</label>
            <div className="input-group border border-2 rounded">
              <input className="form-control border-0" value={plotId} onChange={e=>setPlotId(e.target.value)} placeholder="Scan or enter plot id" />
              <button type="button" className="btn btn-outline-primary" onClick={()=>{ const v = prompt('Mock scan plot id'); if(v) setPlotId(v); }}>Scan</button>
            </div>
            <div className="form-text">Scan farmer's plot QR or type plot id.</div>
          </div>

          <div className="col-md-6">
            <label className="form-label">Batch (scan pack QR)</label>
            <div className="d-flex gap-2 align-items-center">
              <select className="form-select border border-2" value={batchId} onChange={e=>setBatchId(e.target.value)}>
                <option value="">Choose batch</option>
                {batches.map(b=> <option key={b.id} value={b.id}>{b.id} — {b.seed}</option>)}
              </select>
              <button type="button" className="btn btn-outline-secondary" onClick={()=>setShowBatchScanner(true)} title="Open camera to scan pack QR"><AiOutlineQrcode/></button>
            </div>
            <div className="form-text">You can choose batch or scan the QR printed on pack.</div>

            {showBatchScanner && (
              <div className="mt-2 p-2 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <div className="small fw-semibold">Batch QR Scanner</div>
                  <button type="button" className="btn btn-sm btn-danger" onClick={()=>setShowBatchScanner(false)}>Close</button>
                </div>
                <div style={{width:'100%'}}>
                  <QrReader
                    delay={300}
                    onError={handleBatchError}
                    onScan={handleBatchScan}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="col-md-4">
            <label className="form-label">Quantity</label>
            <div className="input-group border border-2 rounded">
              <button type="button" className="btn btn-outline-secondary" onClick={()=>setQuantity(q=>Math.max(1,q-1))}>-</button>
              <input type="number" min={1} className="form-control text-center border-0" value={quantity} onChange={e=>setQuantity(Number(e.target.value)||1)} />
              <button type="button" className="btn btn-outline-secondary" onClick={()=>setQuantity(q=>q+1)}>+</button>
            </div>
            <div className="form-text">Units to sell from selected batch.</div>
          </div>

          <div className="col-md-8 d-flex align-items-start gap-3">
            <div className="d-flex flex-column">
              <button className="btn btn-success mb-2" type="submit"><FiShoppingCart className="me-1"/> Record Sale</button>
              <div className="small text-muted">Recorded sale will update the batch remaining count.</div>
            </div>

            <div className="ms-3">
              <div className="small text-muted mb-1">Scan farmer profile</div>
              <div className="d-flex gap-2 align-items-center">
                <button type="button" className="btn btn-outline-info btn-sm" onClick={()=>setShowFarmerScanner(true)} title="Scan farmer profile QR"><FiCamera/></button>
                <div style={{minWidth:120}}>
                  {farmData ? (
                    <div>
                      <div><strong>{farmData.name || farmData.id || 'Farmer'}</strong></div>
                      <div className="text-muted small">{farmData.village || farmData.raw || ''}</div>
                    </div>
                  ) : <div className="text-muted small">No farmer scanned</div>}
                </div>
              </div>

              {showFarmerScanner && (
                <div className="mt-2 p-2 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <div className="small fw-semibold">Farmer QR Scanner</div>
                    <button type="button" className="btn btn-sm btn-danger" onClick={()=>setShowFarmerScanner(false)}>Close</button>
                  </div>
                  <div>
                    <QrReader
                      delay={300}
                      onError={handleFarmerError}
                      onScan={handleFarmerScan}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

        </form>
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
  const [sales, setSales] = useLocalStorage('demo_sales', DEMO_SALES);
  const [activity, setActivity] = useLocalStorage('demo_activity', ['Demo activity loaded']);
  const [user, setUser] = useLocalStorage('demo_user', { name: 'DemoSeller' });

  function addBatch(b) { setBatches(prev => { const next = [b, ...prev]; setActivity(a=>[`Added batch ${b.id}`, ...a]); return next; }); setView('batches'); }

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h3 className="mb-0 text-gradient" style={{background:'linear-gradient(90deg,#6a11cb,#2575fc)', WebkitBackgroundClip:'text', color:'transparent'}}>Seed Seller Dashboard</h3>
          <div className="small text-muted">Colorful, interactive demo UI</div>
        </div>
        <div className="d-flex gap-2">
          <div className="badge bg-light text-dark d-flex align-items-center gap-2"><FiUser/> {user?.name}</div>
        </div>
      </div>

      <TopActions active={view} onChange={setView} />

      {view === 'new' && <NewBatchView onSave={addBatch} />}

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
