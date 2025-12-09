import React, { useMemo, useState } from "react";
import {
  FaShieldAlt,
  FaUmbrella,
  FaRupeeSign,
  FaLeaf,
  FaInfoCircle,
  FaSearch,
  FaTractor,
  FaHandsHelping,
} from "react-icons/fa";

export default function OilseedCreditInsurancePage() {
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState(null);

  // color palette per type (for cards / chips)
  const typeColors = {
    Insurance: {
      border: "#1E88E5",
      badgeBg: "rgba(30,136,229,0.1)",
      badgeText: "#0D47A1",
    },
    Credit: {
      border: "#43A047",
      badgeBg: "rgba(67,160,71,0.12)",
      badgeText: "#1B5E20",
    },
    "Price Support": {
      border: "#FB8C00",
      badgeBg: "rgba(251,140,0,0.12)",
      badgeText: "#E65100",
    },
    "Production Support": {
      border: "#8E24AA",
      badgeBg: "rgba(142,36,170,0.12)",
      badgeText: "#4A148C",
    },
  };

  // ----------------- SCHEMES DATA -----------------
  const schemes = useMemo(
    () => [
      {
        id: "pmfby",
        name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        type: "Insurance",
        icon: "shield",
        focus: "Crop loss insurance for oilseeds and other crops",
        short:
          "Subsidised crop insurance that covers yield loss for notified oilseeds and other crops from pre-sowing to post-harvest stages.",
        oilseedSpecific:
          "All notified foodgrain and oilseed crops are covered; premium for farmers is capped at 2% of Sum Insured for kharif and 1.5% for rabi food & oilseed crops, the rest is paid by Centre + State.",
        eligibility:
          "All farmers (loanee and non-loanee) growing notified oilseed crops in notified areas, who enrol within the cut-off dates announced by their State.",
        benefits: [
          "Covers risks from sowing to harvest (drought, flood, pests, diseases, etc.)",
          "Low farmer premium; majority of premium subsidised by Government",
          "Claim settlement based on yield loss at insurance unit level",
        ],
        keyParams: [
          "Premium: up to 2% of Sum Insured for kharif oilseeds and 1.5% for rabi oilseeds; remaining premium shared by Centre/State.",
          "Implemented via empanelled general insurance companies through State tenders.",
        ],
        documents: [
          "Aadhaar",
          "Land records / cultivation proof (or tenancy/sharecropping proof as per State rules)",
          "Bank account / KCC details",
          "Crop & area details",
        ],
        apply:
          "Enrollment is usually done through banks, Common Service Centres (CSCs), insurance company outlets or the PMFBY portal.",
        portal: "https://pmfby.gov.in",
        notes:
          "Exact notified crops, insurance unit areas and cut-off dates differ State-wise; farmers should check local agriculture / bank notices.",
      },
      {
        id: "rwbcis",
        name: "Restructured Weather Based Crop Insurance Scheme (RWBCIS)",
        type: "Insurance",
        icon: "umbrella",
        focus: "Weather-index insurance for oilseeds",
        short:
          "Weather-based insurance that compensates farmers when rainfall, temperature or other weather parameters deviate from normal, affecting oilseed crops.",
        oilseedSpecific:
          "Covers food crops and oilseeds as well as commercial/horticultural crops; payouts are linked to adverse weather indices rather than measured yield.",
        eligibility:
          "Farmers growing notified oilseed crops in areas where RWBCIS is implemented and who enrol within the notified season deadlines.",
        benefits: [
          "Protects against weather anomalies (drought, excess rain, heat/cold waves, etc.)",
          "Objective, weather-index based payouts; no need for physical crop-cutting in most cases",
          "Premium for oilseeds broadly aligned with PMFBY caps (low farmer share, high subsidy)",
        ],
        keyParams: [
          "Weather parameters such as rainfall, temperature, humidity and wind speed are used as proxies for crop loss.",
          "Term sheets are designed crop-wise and district/block-wise based on historical weather data.",
        ],
        documents: [
          "Aadhaar",
          "Land / tenancy records as per State norms",
          "Bank account / KCC",
          "Crop & area details",
        ],
        apply:
          "Enrollment is done through banks, CSCs and authorised insurance intermediaries; details and notified districts are published by each State.",
        portal: "https://pmfby.gov.in",
        notes:
          "Farmers should check whether their district and specific oilseed crop are notified under RWBCIS or PMFBY in a given season.",
      },
      {
        id: "kcc",
        name: "Kisan Credit Card (KCC) with Interest Subvention",
        type: "Credit",
        icon: "rupee",
        focus: "Low-interest working capital for oilseed cultivation",
        short:
          "Revolving credit facility that finances input costs (seed, fertiliser, plant protection, labour, etc.) for oilseed and other crops at subsidised interest.",
        oilseedSpecific:
          "Oilseed farmers can use KCC limits for expenses on groundnut, mustard, soybean, sunflower, sesame, etc., including seeds, fertilisers, irrigation and short-term working capital.",
        eligibility:
          "All eligible farmers (individuals, joint borrowers, tenant farmers and sharecroppers as per bank norms) engaged in agriculture and allied activities.",
        benefits: [
          "Short-term crop loans up to ₹3 lakh eligible for interest subvention and prompt-repayment incentive.",
          "Interest subvention of 2% from Government of India + additional 3% incentive for timely repayment.",
          "Credit can also cover post-harvest expenses, produce marketing loan and household consumption to some extent.",
        ],
        keyParams: [
          "Flexible cash credit limit usually valid for 5 years, subject to periodic review.",
          "Separate sub-limits for crop loans and term loans (e.g., farm equipment) as per RBI/NABARD guidelines.",
        ],
        documents: [
          "Aadhaar & PAN (as per bank KYC norms)",
          "Land records / lease papers / cultivation proof",
          "Existing bank account details or new account opening forms",
          "Photographs and basic application form of the bank",
        ],
        apply:
          "Farmers can apply at nearby commercial banks, RRBs, cooperative banks or through the online KCC application facilities offered by many banks and government portals.",
        portal: "https://www.myscheme.gov.in/schemes/kcc",
        notes:
          "Interest rates, collateral requirements and documentation can vary somewhat between banks; small and marginal farmers often get simplified norms.",
      },
      {
        id: "pm-aasha",
        name: "Pradhan Mantri Annadata Aay Sanrakshan Abhiyan (PM-AASHA)",
        type: "Price Support",
        icon: "rupee",
        focus: "Minimum Support Price (MSP) & price deficiency support for oilseeds",
        short:
          "Umbrella scheme that provides price assurance for pulses, oilseeds and copra through MSP procurement or deficiency payments when market prices crash.",
        oilseedSpecific:
          "Notified oilseed crops are covered through Price Support Scheme (PSS) and/or Price Deficiency Payment Scheme (PDPS), implemented by States with central support.",
        eligibility:
          "Registered farmers growing notified oilseed crops in participating States; conditions vary by component (PSS/PDPS/PPSS).",
        benefits: [
          "Physical procurement of oilseeds at MSP by agencies like NAFED under PSS.",
          "Under PDPS, farmers receive direct payment of the difference between MSP and average market price for a limited quantity.",
          "Helps prevent distress sale and encourages diversification towards oilseeds.",
        ],
        keyParams: [
          "Central nodal agencies get government guarantee for bank credit used in MSP procurement operations.",
          "Procurement of notified pulses, oilseeds & copra under PSS allowed up to a fixed share of production, enabling higher MSP-based purchases.",
        ],
        documents: [
          "Farmer registration on State procurement portal (where applicable)",
          "Land records / crop sowing details",
          "Bank account details for DBT",
        ],
        apply:
          "Farmers usually register with their State agriculture / procurement portal or local centres before sowing/harvest to be eligible for MSP procurement or deficiency payments.",
        portal: "https://agricoop.nic.in",
        notes:
          "Exact modalities (whether State uses PSS, PDPS or PPSS) are decided State-wise; farmers should follow State agriculture department notifications each season.",
      },
      {
        id: "nfsmo",
        name: "National Food Security Mission – Oilseeds (NFSM-Oilseeds)",
        type: "Production Support",
        icon: "leaf",
        focus: "Productivity improvement & input support for oilseeds",
        short:
          "Centrally sponsored mission to raise production and productivity of oilseeds through improved seeds, demonstrations, mechanisation and training.",
        oilseedSpecific:
          "Covers major oilseed crops like groundnut, mustard, soybean, sunflower, sesame, safflower, niger, linseed etc. across most States.",
        eligibility:
          "Individual farmers, FPOs and other eligible beneficiaries identified by State agriculture departments under district action plans.",
        benefits: [
          "Seed minikits and subsidies for high-yielding / hybrid oilseed varieties.",
          "Cluster frontline demonstrations on farmers’ fields for improved practices.",
          "Assistance for farm machinery, water management and plant protection.",
        ],
        keyParams: [
          "Implemented in major oilseed-growing States with central assistance shared between Centre and States.",
          "Support can also include seed infrastructure and beekeeping promotion in oilseed areas.",
        ],
        documents: [
          "Farmer identity & land details",
          "Application forms as per State NFSM guidelines",
        ],
        apply:
          "Farmers typically enrol through block/district agriculture offices, ATMA/KVKs or State portals when calls for applications are issued.",
        portal: "https://www.nfsm.gov.in",
        notes:
          "Specific interventions and subsidy amounts change year-to-year based on approved State action plans.",
      },
      {
        id: "nmeo",
        name: "National Mission on Edible Oils",
        type: "Production Support",
        icon: "tractor",
        focus: "Long-term push for edible oil self-reliance",
        short:
          "Mission to reduce import dependence by expanding area, productivity and processing for oil palm and traditional oilseeds.",
        oilseedSpecific:
          "Provides support for planting material, inputs, inter-cropping, FPOs and processing infrastructure for various edible oil crops including oilseeds and oil palm.",
        eligibility:
          "Oilseed and oil palm farmers, FPOs, cooperatives and other entities as per detailed guidelines issued by Centre and States.",
        benefits: [
          "Assistance for quality planting material and improved technologies.",
          "Support for cluster-based development, extension and value-chain infrastructure.",
          "Price assurance / viability gap support for oil palm fresh fruit bunches in some models.",
        ],
        keyParams: [
          "Implemented with a multi-year budget outlay to boost domestic edible oil production.",
          "Operational guidelines notified separately for each component.",
        ],
        documents: [
          "Farmer / FPO registration",
          "Land details and crop plan",
        ],
        apply:
          "Farmers route applications through State horticulture/agriculture departments, depending on crop and component.",
        portal: "https://agricoop.nic.in",
        notes:
          "Implementation model and available components differ widely between States; farmers should check local circulars.",
      },
    ],
    []
  );

  // ----------------- FILTERING -----------------
  const filteredSchemes = schemes.filter((s) => {
    const ql = q.trim().toLowerCase();
    const matchesFilter =
      filter === "all" || s.type.toLowerCase() === filter.toLowerCase();
    if (!matchesFilter) return false;
    if (!ql) return true;
    return (
      s.name.toLowerCase().includes(ql) ||
      s.focus.toLowerCase().includes(ql) ||
      s.short.toLowerCase().includes(ql) ||
      (s.oilseedSpecific || "").toLowerCase().includes(ql)
    );
  });

  // --------- ICON HELPER ----------
  function SchemeIcon({ icon }) {
    const style = {
      fontSize: 28,
      marginRight: 10,
    };
    switch (icon) {
      case "shield":
        return <FaShieldAlt style={style} />;
      case "umbrella":
        return <FaUmbrella style={style} />;
      case "rupee":
        return <FaRupeeSign style={style} />;
      case "tractor":
        return <FaTractor style={style} />;
      case "leaf":
      default:
        return <FaLeaf style={style} />;
    }
  }

  return (
    <div className="container py-4">
      <style>{`
        .os-hero {
          border-radius: 24px;
          padding: 24px 20px;
          background: linear-gradient(135deg,#d0f8ff,#e1ffe5,#fff4d9);
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 14px 40px rgba(0,0,0,0.12);
          margin-bottom: 26px;
          overflow: hidden;
          position: relative;
        }
        .os-hero-badge {
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 700;
          background: rgba(0,0,0,0.06);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .os-hero-right {
          font-size: 46px;
          opacity: 0.18;
        }
        .os-filter-pill {
          border-radius: 999px;
          padding: 7px 16px;
          font-size: 13px;
          border: 1px solid transparent;
          background: #f3f7f5;
          cursor: pointer;
          margin-right: 8px;
          margin-bottom: 8px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 600;
        }
        .os-filter-pill svg{
          font-size: 14px;
        }
        .os-filter-pill.active {
          background: linear-gradient(120deg,#22b573,#1f8fcb);
          color: #fff;
          border-color: transparent;
        }
        .os-search-wrapper{
          position: relative;
        }
        .os-search-icon{
          position: absolute;
          left: 10px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.6;
        }
        .os-search-input{
          padding-left: 32px;
          border-radius: 999px;
        }
        .os-card {
          border-radius: 18px;
          border: 1px solid rgba(0,0,0,0.04);
          background: linear-gradient(145deg,#ffffff,#f6fbf8);
          box-shadow: 0 12px 28px rgba(0,0,0,0.10);
          height: 100%;
          transition: transform 0.15s ease, box-shadow 0.15s ease, translate 0.15s ease;
        }
        .os-card:hover{
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(0,0,0,0.15);
        }
        .os-card-type-badge{
          font-size: 11px;
          padding: 4px 10px;
          border-radius: 999px;
          font-weight: 700;
        }
        .os-chip-list li:before{
          content: "• ";
          color: #1f8f4a;
        }
        .os-footer-note{
          background: linear-gradient(120deg,#fffbe6,#e8f4ff);
          border-radius: 16px;
          border: 1px solid rgba(0,0,0,0.04);
        }
        @media (max-width: 576px) {
          .os-hero {
            padding: 18px 14px;
          }
          .os-hero-right{
            display:none;
          }
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="os-hero">
        <div className="row align-items-center">
          <div className="col-md-8">
            <div className="mb-2 os-hero-badge">
              <FaHandsHelping />
              <span>Support for India&apos;s Oilseed Farmers</span>
            </div>
            <h2 className="mb-1 fw-bold">
              Credit & Insurance Hub for Oilseed Growers
            </h2>
            <p className="mb-2 text-muted">
              Discover Government of India schemes that protect your{" "}
              <strong>mustard, soybean, groundnut, sunflower, sesame</strong> and
              other oilseed crops – from sowing to harvest and even market prices.
            </p>
            <div className="d-flex flex-wrap gap-2 mt-2">
              <span className="badge rounded-pill bg-success-subtle text-success">
                <FaShieldAlt className="me-1" />
                Crop Insurance
              </span>
              <span className="badge rounded-pill bg-info-subtle text-info">
                <FaRupeeSign className="me-1" />
                Low-interest Credit
              </span>
              <span className="badge rounded-pill bg-warning-subtle text-warning">
                MSP & Price Support
              </span>
              <span className="badge rounded-pill bg-primary-subtle text-primary">
                Productivity & Inputs
              </span>
            </div>
          </div>
          <div className="col-md-4 text-md-end mt-3 mt-md-0">
            <div className="os-hero-right">
              <FaLeaf className="me-2" />
              <FaTractor className="me-2" />
              <FaShieldAlt className="me-2" />
            </div>
          </div>
        </div>
      </section>

      {/* FILTERS + SEARCH */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
        <div>
          <div className="mb-1 fw-semibold">Filter by support type</div>
          <div className="d-flex flex-wrap">
            <button
              type="button"
              className={`os-filter-pill ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              <FaLeaf /> All
            </button>
            <button
              type="button"
              className={`os-filter-pill ${
                filter === "insurance" ? "active" : ""
              }`}
              onClick={() => setFilter("insurance")}
            >
              <FaShieldAlt /> Insurance
            </button>
            <button
              type="button"
              className={`os-filter-pill ${
                filter === "credit" ? "active" : ""
              }`}
              onClick={() => setFilter("credit")}
            >
              <FaRupeeSign /> Credit
            </button>
            <button
              type="button"
              className={`os-filter-pill ${
                filter === "price support" ? "active" : ""
              }`}
              onClick={() => setFilter("price support")}
            >
              <FaRupeeSign /> Price & MSP
            </button>
            <button
              type="button"
              className={`os-filter-pill ${
                filter === "production support" ? "active" : ""
              }`}
              onClick={() => setFilter("production support")}
            >
              <FaTractor /> Production
            </button>
          </div>
        </div>

        <div style={{ minWidth: 260, width: "100%", maxWidth: 360 }}>
          <label className="form-label mb-1 fw-semibold">Search schemes</label>
          <div className="os-search-wrapper">
            <FaSearch className="os-search-icon" />
            <input
              type="text"
              className="form-control os-search-input"
              placeholder="Search by name, type or keyword…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="row g-3">
        {filteredSchemes.map((s) => {
          const colors = typeColors[s.type] || typeColors["Production Support"];
          return (
            <div key={s.id} className="col-12 col-md-6 col-xl-4">
              <div
                className="card os-card"
                style={{
                  borderTop: `4px solid ${colors.border}`,
                }}
              >
                <div className="card-body d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                      <SchemeIcon icon={s.icon} />
                      <div>
                        <div className="fw-bold" style={{ fontSize: "1.05rem" }}>
                          {s.name}
                        </div>
                        <div
                          style={{
                            fontSize: "0.88rem",
                            color: "#496a4f",
                          }}
                        >
                          {s.focus}
                        </div>
                      </div>
                    </div>
                    <span
                      className="os-card-type-badge"
                      style={{
                        background: colors.badgeBg,
                        color: colors.badgeText,
                      }}
                    >
                      {s.type}
                    </span>
                  </div>

                  <p className="mb-2">{s.short}</p>
                  <p className="mb-2 small text-muted">
                    <strong>Oilseed focus: </strong>
                    {s.oilseedSpecific}
                  </p>

                  <ul className="small mb-3 os-chip-list">
                    {s.benefits.slice(0, 2).map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>

                  <div className="mt-auto d-flex justify-content-between align-items-center">
                    <button
                      className="btn btn-sm btn-success"
                      style={{
                        background:
                          "linear-gradient(120deg,#1fbf73,#1f9bcb)",
                        border: "none",
                      }}
                      onClick={() => setSelected(s)}
                    >
                      View details
                    </button>
                    <a
                      className="btn btn-sm btn-link text-decoration-none"
                      href={s.portal}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Official site ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredSchemes.length === 0 && (
          <div className="col-12">
            <div className="text-center text-muted py-4">
              No schemes match your filters/search.
            </div>
          </div>
        )}
      </div>

      {/* DISCLAIMER / FOOTER CARD */}
      <div className="os-footer-note mt-4 p-3 d-flex align-items-start">
        <FaInfoCircle className="me-2 mt-1" />
        <div className="small">
          <strong>Important:</strong> This page summarises major central schemes
          that typically cover oilseed crops. Actual eligibility, notified crops,
          premium/interest rates and procurement rules are decided by the
          Government of India and State Governments. Farmers should always confirm
          details from local agriculture offices, banks, insurance companies or
          official portals before taking decisions.
        </div>
      </div>

      {/* DETAILS MODAL */}
      {selected && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          role="dialog"
          style={{ background: "rgba(0,0,0,0.35)" }}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selected.name} – Full Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelected(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-2 fw-semibold">{selected.focus}</p>
                <p className="mb-3">{selected.short}</p>

                <h6>Oilseed-specific coverage</h6>
                <p className="small">{selected.oilseedSpecific}</p>

                <h6 className="mt-3">Who is eligible?</h6>
                <p className="small">{selected.eligibility}</p>

                <h6 className="mt-3">Key benefits</h6>
                <ul className="small">
                  {selected.benefits.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>

                <h6 className="mt-3">Important parameters</h6>
                <ul className="small">
                  {selected.keyParams.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>

                <h6 className="mt-3">Typical documents</h6>
                <ul className="small">
                  {selected.documents.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>

                <h6 className="mt-3">How to apply</h6>
                <p className="small mb-2">{selected.apply}</p>

                <p className="small mb-2">
                  <strong>Official website / portal: </strong>
                  <a href={selected.portal} target="_blank" rel="noreferrer">
                    {selected.portal}
                  </a>
                </p>

                <p className="small text-muted mb-0">
                  <strong>Note:</strong> {selected.notes}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setSelected(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
