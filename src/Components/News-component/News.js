import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";

// DailyAgriNewsPage.jsx
// Full responsive news page themed for agriculture using Bootstrap.
// - Search box (debounced)
// - Auto-moving horizontal slider with pause-on-hover
// - Responsive grid fallback for small screens
// - Accepts apiKey prop (or uses fallback for quick demo)

export default function DailyAgriNewsPage({ apiKey, defaultPageSize = 12 }) {
  const fallbackKey = "28242902bcd948daaaf35bb0d47c8300"; // demo key (keep secret in prod)
  const key = apiKey || fallbackKey;

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("agriculture OR farming OR crops AND india");
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const containerRef = useRef(null);
  const autoScrollRef = useRef(null);
  const hoverRef = useRef(false);
  const debounceRef = useRef(null);

  // fetch articles
  useEffect(() => {
    if (!key) {
      setError("No API key provided. Pass apiKey prop or set an environment variable.");
      return;
    }

    const q = query || "agriculture OR farming OR crops AND india";
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=en&pageSize=${pageSize}&apiKey=${key}`;

    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`NewsAPI error: ${res.status} ${txt}`);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoading(false);
      });

    return () => (cancelled = true);
  }, [key, query, pageSize]);

  // Debounce search input -> update query
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (searchTerm && searchTerm.trim().length > 0) {
        setQuery(`${searchTerm.trim()} AND (agriculture OR farming OR crops OR agri)`);
      } else {
        setQuery("agriculture OR farming OR crops AND india");
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Auto-scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container || articles.length === 0) return;

    const doScroll = () => {
      if (hoverRef.current) return;
      const card = container.querySelector('.agri-news-card');
      if (!card) return;
      const step = card.getBoundingClientRect().width + 16;
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft + step >= maxScroll - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    };

    autoScrollRef.current = setInterval(doScroll, 3000);
    return () => clearInterval(autoScrollRef.current);
  }, [articles]);

  const manualScroll = (dir = 1) => {
    const container = containerRef.current;
    if (!container) return;
    const card = container.querySelector('.agri-news-card');
    if (!card) return;
    const step = (card.getBoundingClientRect().width + 16) * dir;
    container.scrollBy({ left: step, behavior: 'smooth' });
  };

  const openArticle = (url) => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="daily-agri-page min-vh-100 d-flex flex-column" style={{ background: 'linear-gradient(90deg,#2e7d32,#66bb6a)' }}>
      {/* Header */}
      <header className="py-3" >
        <div className="container d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <div style={{ width:48, height:48, borderRadius:8, background:'#fff', display:'grid', placeItems:'center' }}>
              {/* simple leaf svg */}
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 21c6-8 18-12 18-12s-2 10-6 15c-4 5-12-3-12-3z" fill="#2e7d32" />
              </svg>
            </div>
            <div>
              <h4 className="mb-0 text-white fw-bold">AgriPulse</h4>
              <small className="text-white-50">Daily Agriculture News </small>
            </div>
          </div>

          <form className="ms-auto d-flex align-items-center" onSubmit={(e) => e.preventDefault()}>
            <div className="input-group" style={{ minWidth: 260 }}>
              <input
                type="search"
                className="form-control"
                placeholder="Search crops, policies, markets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search agriculture news"
              />
              <button className="btn btn-light" title="Search" onClick={() => setQuery(searchTerm || query)}>
                <FaSearch />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Main content */}
      <main className="container my-4 flex-grow-1">
        <div className="row g-3">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="d-flex align-items-start gap-3">
                  <div className="flex-grow-1">
                    <h5 className="mb-1">Top agriculture stories</h5>
                    <p className="text-muted small mb-0">Hover to pause, click a card to open original article.</p>
                  </div>
                  <div className="d-none d-md-flex gap-2">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => manualScroll(-1)} aria-label="Scroll left"><FaChevronLeft /></button>
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => manualScroll(1)} aria-label="Scroll right"><FaChevronRight /></button>
                  </div>
                </div>

                {/* Slider / Row */}
                <div
                  ref={containerRef}
                  className="agri-news-row overflow-auto d-flex gap-3 py-3 px-1 mt-3"
                  onMouseEnter={() => (hoverRef.current = true)}
                  onMouseLeave={() => (hoverRef.current = false)}
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {loading && (
                    <div className="d-flex w-100 justify-content-center py-5">
                      <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
                    </div>
                  )}

                  {error && (
                    <div className="alert alert-danger w-100 py-2">{error}</div>
                  )}

                  {!loading && !error && articles.length === 0 && (
                    <div className="alert alert-info w-100 py-2">No news found for this search.</div>
                  )}

                  {!loading && !error && articles.map((a, idx) => (
                    <article
                      key={a.url || idx}
                      className="card agri-news-card shadow-sm"
                      style={{ minWidth: 300, maxWidth: 360, cursor: 'pointer' }}
                      onClick={() => openArticle(a.url)}
                    >
                      {a.urlToImage ? (
                        <img src={a.urlToImage} className="card-img-top" alt={a.title} style={{ height: 160, objectFit: 'cover' }} />
                      ) : (
                        <div style={{ height: 160, background: '#ecf8ee' }} className="d-flex align-items-center justify-content-center">
                          <small className="text-muted">No image</small>
                        </div>
                      )}
                      <div className="card-body p-2">
                        <h6 className="card-title mb-1" style={{ lineHeight: 1.15 }}>{a.title}</h6>
                        <p className="card-text small text-muted mb-1" style={{ minHeight: 42 }}>{a.description || ''}</p>
                        <div className="d-flex justify-content-between align-items-center">
                          <small className="text-muted">{new Date(a.publishedAt).toLocaleString()}</small>
                          <small className="badge bg-light text-truncate" style={{ maxWidth: 120 }}>{a.source?.name}</small>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Mobile fallback: grid */}
                <div className="d-block d-md-none mt-3">
                  <h6 className="mb-2">More stories</h6>
                  <div className="row g-2">
                    {articles.slice(0, 6).map((a, i) => (
                      <div key={a.url || i} className="col-12">
                        <div className="card" onClick={() => openArticle(a.url)} style={{ cursor: 'pointer' }}>
                          <div className="row g-0 align-items-center">
                            <div className="col-4">
                              {a.urlToImage ? (
                                <img src={a.urlToImage} className="img-fluid rounded-start" alt="" style={{ height: '72px', objectFit: 'cover', width: '100%' }} />
                              ) : (
                                <div style={{ height: 72, background: '#ecf8ee' }} />
                              )}
                            </div>
                            <div className="col-8">
                              <div className="card-body py-2 px-2">
                                <p className="mb-1 small fw-semibold" style={{ lineHeight: 1 }}>{a.title}</p>
                                <small className="text-muted">{a.source?.name} · {new Date(a.publishedAt).toLocaleDateString()}</small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Additional info cards */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm p-3 h-100">
              <h6>Agri Filters</h6>
              <p className="small text-muted">Narrow results (client-side filters)</p>
              <div className="mb-2">
                <label className="form-label small">Page size</label>
                <select className="form-select form-select-sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                  <option value={6}>6</option>
                  <option value={9}>9</option>
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                </select>
              </div>

              <div className="mt-3">
                <h6 className="mb-1">About</h6>
                <p className="small text-muted">AgriPulse aggregates India-focused agriculture news — markets, policies, crops and technology. This demo uses NewsAPI and is client-side only. For production move the key to a server.</p>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm p-3 h-100">
              <h6>Latest headlines</h6>
              <div className="list-group list-group-flush mt-2">
                {articles.slice(0, 8).map((a, i) => (
                  <button key={a.url || i} className="list-group-item list-group-item-action d-flex justify-content-between align-items-start" onClick={() => openArticle(a.url)}>
                    <div className="me-3">
                      <div className="fw-semibold small" style={{ maxWidth: 540 }}>{a.title}</div>
                      <small className="text-muted">{a.source?.name}</small>
                    </div>
                    <small className="text-muted">{new Date(a.publishedAt).toLocaleTimeString()}</small>
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Scoped styles */}
      <style>{`
        .agri-news-row::-webkit-scrollbar{ height:8px }
        .agri-news-row::-webkit-scrollbar-thumb{ background: rgba(0,0,0,0.12); border-radius:4px }
        .agri-news-card{ transition: transform .18s ease, box-shadow .18s ease }
        .agri-news-card:hover{ transform: translateY(-6px); box-shadow: 0 12px 26px rgba(46,125,50,0.08) }
        @media (max-width: 767px){ .agri-news-row{ padding-left:8px; padding-right:8px } }
      `}</style>
    </div>
  );
}
