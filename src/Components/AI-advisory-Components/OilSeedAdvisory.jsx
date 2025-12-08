import React, { useEffect, useState } from "react";
import {
  FaTractor,
  FaSeedling,
  FaMapMarkedAlt,
  FaWater,
  FaInfoCircle,
  FaRupeeSign,
  FaBug,
  FaCertificate,
  FaLeaf,
  FaArrowRight,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";

const OilSeedAdvisory = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPlot, setSelectedPlot] = useState(null);

  // 1 = choose plot, 2 = fill form, 3 = pick oilseed,
  // 4 = review details, 5 = final status
  const [step, setStep] = useState(1);

  // Form state
  const [soilType, setSoilType] = useState("");
  const [npk, setNpk] = useState({ n: "", p: "", k: "" });
  const [irrigationLevel, setIrrigationLevel] = useState("");
  const [plotDetails, setPlotDetails] = useState("");
  const [soilPh, setSoilPh] = useState(""); // optional pH

  // Climate state (from /api/weather/climate)
  const [climate, setClimate] = useState(null);
  const [climateLoading, setClimateLoading] = useState(false);
  const [climateError, setClimateError] = useState("");

  // Recommended oilseeds from backend
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [cropsError, setCropsError] = useState("");

  // Selected oilseed name (only ONE)
  const [selectedCropNames, setSelectedCropNames] = useState([]);

  // Selected oilseed object (for details + saving)
  const [primaryCrop, setPrimaryCrop] = useState(null);

  // Final JSON for saved crop (for internal reference)
  const [finalCropPlanJson, setFinalCropPlanJson] = useState(null);

  // Saving / final status
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ------------------- fetch plots -------------------
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        setError("User not found in localStorage.");
        setLoading(false);
        return;
      }

      const userObj = JSON.parse(storedUser);
      const userId = userObj?.id;

      if (!userId) {
        setError("User id missing in localStorage 'user' object.");
        setLoading(false);
        return;
      }

      const fetchPlots = async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/api/plots/with-cycles/${userId}`
          );
          if (!res.ok) {
            throw new Error(`Failed to fetch plots. Status: ${res.status}`);
          }
          const data = await res.json();
          setPlots(data || []);
        } catch (err) {
          console.error(err);
          setError(err.message || "Error fetching plots.");
        } finally {
          setLoading(false);
        }
      };

      fetchPlots();
    } catch (err) {
      console.error(err);
      setError("Invalid user data in localStorage.");
      setLoading(false);
    }
  }, []);

  // fetch climate for given plot (state + region)
  const fetchClimateForPlot = async (plot) => {
  if (!plot) return;

  const state =
    plot.state ||
    plot.status?.location?.state ||
    "Maharashtra";

  const region =
    plot.region ||
    plot.status?.location?.city ||
    plot.status?.location?.village ||
    "Pune";

  setClimate(null);
  setClimateError("");
  setClimateLoading(true);

  const payload = {
    state,
    region,
    use_live_api: false,
  };

  try {
    const res = await fetch("http://127.0.0.1:8000/api/weather/climate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch climate. Status: ${res.status}`);
    }

    const data = await res.json();
    setClimate(data);
  } catch (err) {
    console.error(err);
    setClimateError(err.message || "Error fetching climate data.");
  } finally {
    setClimateLoading(false);
  }
};


 const handleSelectPlot = (plot) => {
  // derive state & region from nested location
  const stateFromPlot =
    plot.state ||
    plot.status?.location?.state ||
    "Maharashtra";

  const regionFromPlot =
    plot.region ||
    plot.status?.location?.city ||
    plot.status?.location?.village ||
    "Pune";

  const normalizedPlot = {
    ...plot,
    state: stateFromPlot,
    region: regionFromPlot,
  };

  setSelectedPlot(normalizedPlot);

  setSoilType("");
  setNpk({ n: "", p: "", k: "" });
  setIrrigationLevel("");
  setPlotDetails("");
  setSoilPh("");

  setRecommendedCrops([]);
  setSelectedCropNames([]);
  setPrimaryCrop(null);

  setFinalCropPlanJson(null);
  setSaveLoading(false);
  setSaveError("");
  setSaveSuccess(false);

  // reset climate state & fetch for this plot (now has .state & .region)
  setClimate(null);
  setClimateError("");
  fetchClimateForPlot(normalizedPlot);

  setStep(2);
};


  // ------------------- Step 2: call recommend-oilseeds -------------------
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlot) return;

    setCropsError("");
    setCropsLoading(true);

    const npkString = `N:${npk.n},P:${npk.p},K:${npk.k}`;
    const today = new Date().toISOString().slice(0, 10);

    const state = selectedPlot.state || climate?.state || "Maharashtra";
    const region = selectedPlot.region || climate?.region || "Pune";
    const climateCore = climate?.climate || {};

    const climatePayload = {
      avg_temperature_c: climateCore.avg_temperature_c || "",
      temp_range_c: climateCore.temp_range_c || "",
      avg_humidity_pct: climateCore.avg_humidity_pct || "",
      rainfall_last_30days_mm: climateCore.rainfall_last_30days_mm || "",
      seasonal_rainfall_mm: climateCore.seasonal_rainfall_mm || "",
      sowing_window: climateCore.sowing_window || "",
      irrigation_need: climateCore.irrigation_need || "",
    };

    const payload = {
      state,
      region,
      climate: climatePayload,
      plot_area: selectedPlot.user_provided_area ?? 0,
      npk: npkString,
      ph: soilPh ? Number(soilPh) : null,
      soil_type: soilType,
      irrigation_level: irrigationLevel || "",
      plot_details: plotDetails || "Not provided",
      requested_date: today,
    };

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/advisory/recommend-oilseeds",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to get recommended oilseeds. Status: ${res.status}`
        );
      }

      const data = await res.json();
      const crops = Array.isArray(data.recommendations)
        ? data.recommendations
        : [];

      setRecommendedCrops(crops);
      setSelectedCropNames([]);
      setStep(3);
    } catch (err) {
      console.error(err);
      setCropsError(err.message || "Error fetching recommended oilseeds.");
    } finally {
      setCropsLoading(false);
    }
  };

  // ------------------- Step 3: chosen oilseed -> go to details page -------------------
  const handleGoToDetails = () => {
    if (selectedCropNames.length === 0) {
      alert("Please select one oilseed crop.");
      return;
    }
    if (selectedCropNames.length > 1) {
      alert("Please select only one oilseed for detailed advisory.");
      return;
    }

    const primaryName = selectedCropNames[0];
    const primary = recommendedCrops.find((c) => c.crop_name === primaryName);

    if (!primary) {
      alert("Selected crop not found. Please re-select.");
      return;
    }

    setPrimaryCrop(primary);
    setStep(4);
  };

  // ------------------- Step 4: save selected oilseed to backend -------------------
  const handleConfirmPlan = async () => {
  if (!selectedPlot || !primaryCrop) {
    alert("Missing data. Please go back and re-select.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10);
  const area = selectedPlot.user_provided_area ?? 0;

  // minimal payload fields that the backend definitely knows
  const primaryCropForBackend = {
    plot_id: selectedPlot.id,
    crop_name: primaryCrop.crop_name,
    area_acres: area,
    sowing_date: today,
    status: "growing",
 
  };

  // match the original /crop-plan/save contract
  const payloadToSave = {
    primary_crop: primaryCropForBackend,
    secondary_crop: null, // or omit if serializer has required=False
  };

  setFinalCropPlanJson(payloadToSave); // keep for UI reference
  setSaveError("");
  setSaveLoading(true);
  setSaveSuccess(false);

  try {
    const res = await fetch("http://127.0.0.1:8000/api/plots/crop-plan/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadToSave),
    });

    if (!res.ok) {
      let details = "";
      try {
        const errJson = await res.json();
        details = JSON.stringify(errJson);
      } catch {
        const txt = await res.text().catch(() => "");
        details = txt;
      }
      throw new Error(`Save failed. Status ${res.status}. ${details}`);
    }

    setSaveSuccess(true);
    setStep(5);
  } catch (err) {
    console.error("Save crop plan error:", err);
    setSaveError(err.message || "Failed to save crop plan.");
    setStep(5);
  } finally {
    setSaveLoading(false);
  }
};


  const handleStartOver = () => {
    setSelectedPlot(null);
    setRecommendedCrops([]);
    setSelectedCropNames([]);
    setPrimaryCrop(null);

    setSoilType("");
    setNpk({ n: "", p: "", k: "" });
    setIrrigationLevel("");
    setPlotDetails("");
    setSoilPh("");

    setSaveLoading(false);
    setSaveError("");
    setSaveSuccess(false);
    setClimate(null);
    setClimateError("");
    setClimateLoading(false);
    setFinalCropPlanJson(null);

    setStep(1);
  };

  // ------------------- rendering -------------------
  if (loading) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(180deg, #ebf8ff 0%, #fef9c3 50%, #dcfce7 100%)",
        }}
      >
        <div className="text-center">
          <div className="spinner-border text-success mb-3" role="status" />
          <div className="fw-semibold text-success">Loading your plots…</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ minHeight: "100vh", backgroundColor: "#fff7ed" }}
      >
        <div className="alert alert-danger shadow-sm mb-0" role="alert">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #ebf8ff 0%, #fef9c3 50%, #dcfce7 100%)",
        paddingTop: "20px",
        paddingBottom: "40px",
      }}
    >
      <div className="container" style={{ maxWidth: 960 }}>
        {/* Header + Stepper */}
        <div className="text-center mb-4">
          <h2 className="fw-bold text-success mb-1">
            <FaSeedling className="me-2" />
            Smart Oilseed Advisory
          </h2>
          <p className="text-muted mb-3">
            Flow: select plot → fill details → pick oilseed → review → finalize.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <StepPill
              step={1}
              label="Select Plot"
              active={step === 1}
              icon={<FaMapMarkedAlt />}
            />
            <StepPill
              step={2}
              label="Fill Details"
              active={step === 2}
              icon={<FaInfoCircle />}
            />
            <StepPill
              step={3}
              label="Choose Oilseed"
              active={step === 3}
              icon={<FaLeaf />}
            />
            <StepPill
              step={4}
              label="Review & Save"
              active={step === 4}
              icon={<FaWater />}
            />
            <StepPill
              step={5}
              label="Finalize"
              active={step === 5}
              icon={<FaTractor />}
            />
          </div>
        </div>

        {/* Screens */}
        {step === 1 && (
          <StepSelectPlot plots={plots} onSelectPlot={handleSelectPlot} />
        )}

        {step === 2 && selectedPlot && (
          <StepFillForm
            selectedPlot={selectedPlot}
            soilType={soilType}
            setSoilType={setSoilType}
            npk={npk}
            setNpk={setNpk}
            irrigationLevel={irrigationLevel}
            setIrrigationLevel={setIrrigationLevel}
            plotDetails={plotDetails}
            setPlotDetails={setPlotDetails}
            soilPh={soilPh}
            setSoilPh={setSoilPh}
            climate={climate}
            climateLoading={climateLoading}
            climateError={climateError}
            onSubmit={handleFormSubmit}
            onBack={() => setStep(1)}
            cropsLoading={cropsLoading}
          />
        )}

        {step === 3 && (
          <StepRecommendedCrops
            recommendedCrops={recommendedCrops}
            cropsError={cropsError}
            cropsLoading={cropsLoading}
            selectedCropNames={selectedCropNames}
            setSelectedCropNames={setSelectedCropNames}
            onNext={handleGoToDetails}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && primaryCrop && selectedPlot && (
          <StepOilseedDetails
            oilseed={primaryCrop}
            selectedPlot={selectedPlot}
            onConfirmPlan={handleConfirmPlan}
            onBack={() => setStep(3)}
            saveLoading={saveLoading}
          />
        )}

        {step === 5 && (
          <StepFinalStatus
            finalJson={finalCropPlanJson}
            saveLoading={saveLoading}
            saveError={saveError}
            saveSuccess={saveSuccess}
            selectedPlot={selectedPlot}
            onStartOver={handleStartOver}
          />
        )}
      </div>
    </div>
  );
};

/* ---------- STEP 1: SELECT PLOT ---------- */
const StepSelectPlot = ({ plots, onSelectPlot }) => (
  <div className="card shadow-sm border-0">
    <div className="card-header bg-success text-white d-flex align-items-center">
      <FaMapMarkedAlt className="me-2" />
      <div>
        <div className="fw-semibold">Step 1: Select a plot for oilseed advisory</div>
        <small className="d-block">
          Tap on your plot card to move to the next step.
        </small>
      </div>
    </div>
    <div className="card-body p-3">
      {plots.length === 0 && (
        <div className="text-center text-muted">No plots found for this user.</div>
      )}

      <div
        className="d-flex flex-column gap-2"
        style={{ maxHeight: "65vh", overflowY: "auto" }}
      >
        {plots.map((plot) => {
          const hasCycles =
            Array.isArray(plot.crop_cycles) && plot.crop_cycles.length > 0;

          return (
            <button
              key={plot.id}
              type="button"
              onClick={() => onSelectPlot(plot)}
              className="card text-start border-2 border-light"
              style={{
                cursor: "pointer",
                backgroundColor: "rgba(255,255,255,0.95)",
                transition: "all 0.15s ease-in-out",
              }}
            >
              <div className="card-body py-2">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-semibold text-dark">
                      {plot.plot_name}{" "}
                      <span className="text-muted small">(ID: {plot.id})</span>
                    </div>
                    <div className="small text-muted">
                      Area:{" "}
                      <span className="fw-semibold text-success">
                        {plot.user_provided_area ?? "—"}
                      </span>{" "}
                      &nbsp;•&nbsp; Status:{" "}
                      <span className="fw-semibold">
                        {plot.status?.stage || "Registered"}
                      </span>
                    </div>
                  </div>
                  {hasCycles && (
                    <span className="badge text-bg-success">
                      {plot.crop_cycles.length} cycle(s)
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
    <div className="card-footer bg-light small text-muted text-center">
      <FaInfoCircle className="me-1" />
      Once you select a plot, this screen will go away and the details form will
      appear.
    </div>
  </div>
);

/* ---------- STEP 2: FORM (recommend-oilseeds) + CLIMATE ---------- */
const StepFillForm = ({
  selectedPlot,
  soilType,
  setSoilType,
  npk,
  setNpk,
  irrigationLevel,
  setIrrigationLevel,
  plotDetails,
  setPlotDetails,
  soilPh,
  setSoilPh,
  climate,
  climateLoading,
  climateError,
  onSubmit,
  onBack,
  cropsLoading,
}) => {
  const [showClimateDetails, setShowClimateDetails] = useState(false);
  //eslint-disable-next-line
  const climateCore = climate?.climate || {};
  const stateName =
  climate?.state ||
  selectedPlot?.state ||
  selectedPlot?.status?.location?.state ||
  "—";

const regionName =
  climate?.region ||
  selectedPlot?.region ||
  selectedPlot?.status?.location?.city ||
  selectedPlot?.status?.location?.village ||
  "—";

  // Auto-fill N, P, K and pH once when climate arrives and fields are empty
  useEffect(() => {
    if (!climateCore) return;

    // estimated_npk_range like "80-120-60"
    if (
      climateCore.estimated_npk_range &&
      !npk.n &&
      !npk.p &&
      !npk.k
    ) {
      const parts = String(climateCore.estimated_npk_range).split("-");
      if (parts.length === 3) {
        setNpk({
          n: parts[0],
          p: parts[1],
          k: parts[2],
        });
      }
    }

    // estimated_ph_range like "6.0-7.5" -> take first value as default
    if (climateCore.estimated_ph_range && !soilPh) {
      const phParts = String(climateCore.estimated_ph_range).split("-");
      if (phParts.length >= 1) {
        setSoilPh(phParts[0]);
      }
    }
  }, [
    climateCore,
    setNpk,
    setSoilPh,
    npk.n,
    npk.p,
    npk.k,
    soilPh,
  ]);

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-primary bg-gradient text-white d-flex align-items-center">
        <FaWater className="me-2" />
        <div>
          <div className="fw-semibold">Step 2: Fill plot, soil & climate details</div>
          <small>We’ll use this to get the best oilseed recommendations.</small>
        </div>
      </div>
      <div className="card-body small">
        {/* Climate summary */}
        <div className="mb-3 p-2 rounded" style={{ backgroundColor: "#eff6ff" }}>
          <div className="fw-semibold text-primary mb-1 d-flex align-items-center justify-content-between">
            <span>
              <FaInfoCircle className="me-1" />
              Climate Overview ({regionName}, {stateName})
            </span>

            {!climateLoading && !climateError && climate && (
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => setShowClimateDetails((prev) => !prev)}
              >
                {showClimateDetails ? (
                  <>
                    Hide details <FaChevronUp className="ms-1" />
                  </>
                ) : (
                  <>
                    More details <FaChevronDown className="ms-1" />
                  </>
                )}
              </button>
            )}
          </div>

          {climateLoading && (
            <div className="small text-muted d-flex align-items-center">
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Fetching climate details for your plot…
            </div>
          )}

          {!climateLoading && climateError && (
            <div className="alert alert-warning py-1 px-2 mb-1 small">
              {climateError}
            </div>
          )}

          {!climateLoading && !climateError && climate && (
            <>
              {/* minimal key info */}
              <div className="row g-2 small">
                <DetailCol
                  label="Avg Temp (°C)"
                  value={climateCore.avg_temperature_c || "—"}
                />
                <DetailCol
                  label="Temp Range (°C)"
                  value={climateCore.temp_range_c || "—"}
                />
                <DetailCol
                  label="Rainfall last 30 days (mm)"
                  value={climateCore.rainfall_last_30days_mm || "—"}
                />
                <DetailCol
                  label="Seasonal Rain (mm)"
                  value={climateCore.seasonal_rainfall_mm || "—"}
                />
                <DetailCol
                  label="Sowing Window"
                  value={climateCore.sowing_window || "—"}
                />
                <DetailCol
                  label="Irrigation Need"
                  value={climateCore.irrigation_need || "—"}
                />
              </div>

              {/* extra details when toggled */}
              {showClimateDetails && (
                <div className="mt-2 border-top pt-2 small text-muted">
                  <div className="row g-2">
                    <DetailCol
                      label="Avg Humidity (%)"
                      value={climateCore.avg_humidity_pct || "—"}
                    />
                    <DetailCol
                      label="Rainfall distribution"
                      value={climateCore.rainfall_distribution || "—"}
                    />
                    <DetailCol
                      label="Soil moisture index"
                      value={climateCore.soil_moisture_index || "—"}
                    />
                    <DetailCol
                      label="Growing degree days"
                      value={climateCore.growing_degree_days || "—"}
                    />
                    <DetailCol
                      label="Frost risk"
                      value={climateCore.frost_risk || "—"}
                    />
                    <DetailCol
                      label="Wind"
                      value={climateCore.wind_summary || "—"}
                    />
                  </div>
                  {climateCore.climate_notes && (
                    <div className="mt-2">
                      <span className="fw-semibold">Notes: </span>
                      {climateCore.climate_notes}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Selected plot summary */}
        <div className="mb-3 p-2 rounded" style={{ backgroundColor: "#ecfdf3" }}>
          <div className="fw-semibold text-success mb-1">
            <FaMapMarkedAlt className="me-1" />
            Selected Plot Summary
          </div>
          <div className="row g-2">
            <DetailCol label="Plot Name" value={selectedPlot.plot_name} />
            <DetailCol label="Plot ID" value={selectedPlot.id} />
            <DetailCol label="Area (acres)" value={selectedPlot.user_provided_area} />
            <DetailCol
              label="Status"
              value={selectedPlot.status?.stage || "Registered"}
            />
          </div>
        </div>

        {/* Form */}
        <form onSubmit={onSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label fw-semibold">
                Soil Type <span className="text-danger">*</span>
              </label>
              <select
                className="form-select"
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                required
              >
                <option value="">Select soil type</option>
                <option value="Black cotton soil">Black cotton soil</option>
                <option value="Red soil">Red soil</option>
                <option value="Alluvial soil">Alluvial soil</option>
                <option value="Laterite soil">Laterite soil</option>
                <option value="Sandy soil">Sandy soil</option>
                <option value="Clay soil">Clay soil</option>
                <option value="Loamy soil">Loamy soil</option>
              </select>
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">
                N (Nitrogen) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 80"
                value={npk.n}
                onChange={(e) => setNpk({ ...npk, n: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                P (Phosphorus) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 40"
                value={npk.p}
                onChange={(e) => setNpk({ ...npk, p: e.target.value })}
                required
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                K (Potassium) <span className="text-danger">*</span>
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="e.g. 40"
                value={npk.k}
                onChange={(e) => setNpk({ ...npk, k: e.target.value })}
                required
              />
            </div>

            {/* Soil pH optional */}
            <div className="col-md-3">
              <label className="form-label fw-semibold">
                Soil pH <span className="text-muted">(optional)</span>
                {climateCore.estimated_ph_range && (
                  <span className="text-muted ms-1 small">
                    (est: {climateCore.estimated_ph_range}, may vary)
                  </span>
                )}
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                className="form-control"
                placeholder="e.g. 6.5"
                value={soilPh}
                onChange={(e) => setSoilPh(e.target.value)}
              />
            </div>

            {/* note under NPK from climate */}
            {climateCore.estimated_npk_range && (
              <div className="col-12">
                <small className="text-muted">
                  Estimated NPK from climate:{" "}
                  <strong>{climateCore.estimated_npk_range}</strong> — auto-filled,
                  may vary based on actual soil test. You can adjust if needed.
                </small>
              </div>
            )}

            <div className="col-md-6">
              <label className="form-label fw-semibold">Irrigation Level</label>
              <select
                className="form-select"
                value={irrigationLevel}
                onChange={(e) => setIrrigationLevel(e.target.value)}
              >
                <option value="">Select level</option>
                <option value="rainfed">Rainfed</option>
                <option value="low">Low irrigation</option>
                <option value="medium">Medium irrigation</option>
                <option value="high">High irrigation</option>
              </select>
            </div>

            <div className="col-12">
              <label className="form-label fw-semibold">
                Plot Details (slope, drainage, etc.)
              </label>
              <textarea
                className="form-control"
                rows={2}
                placeholder="e.g. Gentle slope, good drainage"
                value={plotDetails}
                onChange={(e) => setPlotDetails(e.target.value)}
              />
            </div>

            <div className="col-12 d-flex justify-content-between mt-2">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onBack}
                disabled={cropsLoading}
              >
                Back
              </button>
              <button
                type="submit"
                className="btn btn-success fw-semibold d-flex align-items-center justify-content-center"
                disabled={cropsLoading}
              >
                {cropsLoading && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                  />
                )}
                <FaTractor className="me-2" />
                Get oilseed recommendations
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ---------- STEP 3: RECOMMENDED OILSEEDS (cards) ---------- */
const StepRecommendedCrops = ({
  recommendedCrops,
  cropsError,
  cropsLoading,
  selectedCropNames,
  setSelectedCropNames,
  onNext,
  onBack,
}) => {
  const [expandedCropName, setExpandedCropName] = useState(null);

  const handleCardClick = (cropName) => {
    setSelectedCropNames((prev) => {
      // Only one selection allowed
      if (prev.includes(cropName)) {
        return [];
      }
      return [cropName];
    });
  };

  const selectedName = selectedCropNames[0] || null;

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-success bg-gradient text-white d-flex align-items-center">
        <FaLeaf className="me-2" />
        <div>
          <div className="fw-semibold">Step 3: Recommended oilseeds</div>
          <small>Select one oilseed to see full advisory.</small>
        </div>
      </div>
      <div className="card-body small">
        {cropsLoading && (
          <div className="text-center my-3">
            <div className="spinner-border text-success mb-2" role="status" />
            <div className="text-muted">Fetching recommended oilseeds…</div>
          </div>
        )}

        {cropsError && (
          <div className="alert alert-danger py-2 small">{cropsError}</div>
        )}

        {!cropsLoading &&
          !cropsError &&
          recommendedCrops.length === 0 && (
            <div className="text-center text-muted">
              No oilseeds received from advisory API.
            </div>
          )}

        {recommendedCrops.length > 0 && (
          <>
            <div className="mb-3">
              <div className="fw-semibold mb-1">Your selection</div>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success-subtle text-success border border-success">
                  Selected oilseed:{" "}
                  <strong>{selectedName || "Not selected"}</strong>
                </span>
              </div>
            </div>

            <div className="row g-3 mb-3">
              {recommendedCrops.map((crop) => {
                const isSelected = crop.crop_name === selectedName;

                let borderClass = "border-0";
                let bgColor = "#f0fdf4";
                if (isSelected) {
                  borderClass = "border-2 border-success";
                  bgColor = "#dcfce7";
                }

                const expanded = expandedCropName === crop.crop_name;

                return (
                  <div className="col-md-4" key={crop.crop_name}>
                    <div
                      className={`card h-100 shadow-sm ${borderClass}`}
                      style={{
                        backgroundColor: bgColor,
                        cursor: "pointer",
                        transition: "transform 0.15s, box-shadow 0.15s",
                      }}
                      onClick={() => handleCardClick(crop.crop_name)}
                    >
                      <div className="card-body pb-2">
                        <div className="d-flex justify-content-between align-items-start mb-1">
                          <div>
                            <div className="fw-bold text-success d-flex align-items-center gap-1">
                              <FaSeedling />
                              <span>{crop.crop_name}</span>
                            </div>
                            <div className="d-flex flex-wrap gap-1 mt-1">
                              <span className="badge rounded-pill bg-success-subtle text-success border border-success-subtle">
                                {crop.crop_type}
                              </span>
                            </div>
                          </div>
                          <div className="text-end">
                            {isSelected && (
                              <span className="badge bg-success">Selected</span>
                            )}
                          </div>
                        </div>

                        {/* Price + yield */}
                        <div className="small text-muted mb-1">
                          <div className="d-flex justify-content-between">
                            <span>
                              <FaRupeeSign className="me-1" />
                              <span>{crop.price_mandi_estimate}</span>
                            </span>
                          </div>
                          <div className="mt-1">
                            <span className="fw-semibold">Yield:</span>{" "}
                            {crop.projected_yield_per_acre} /acre
                            {typeof crop.projected_yield_for_plot !== "undefined" &&
                              ` • ~${crop.projected_yield_for_plot} tons on your plot`}
                          </div>
                        </div>

                        {/* Demand */}
                        <div className="small text-muted mb-1">
                          <span className="fw-semibold">Demand: </span>
                          <span>{crop.demand}</span>
                        </div>

                        {/* Schemes preview */}
                        <div className="d-flex gap-2 flex-wrap">
                          {(crop.government_schemes || [])
                            .slice(0, 2)
                            .map((s) => (
                              <span
                                key={s.name}
                                className="badge bg-light border text-dark small"
                              >
                                {s.name}
                              </span>
                            ))}
                          {(crop.government_schemes || []).length > 2 && (
                            <span className="badge bg-light border text-dark small">
                              +{crop.government_schemes.length - 2} more
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success mt-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedCropName((prev) =>
                              prev === crop.crop_name ? null : crop.crop_name
                            );
                          }}
                        >
                          {expanded ? (
                            <>
                              Quick hide <FaChevronUp className="ms-2" />
                            </>
                          ) : (
                            <>
                              Quick details <FaChevronDown className="ms-2" />
                            </>
                          )}
                        </button>

                        {expanded && (
                          <div className="mt-2 small border-top pt-2">
                            <div className="mb-1">
                              <span className="fw-semibold">Breed: </span>
                              {crop.recommended_breed}
                            </div>
                            <div className="mb-1">
                              <span className="fw-semibold">Weather fit: </span>
                              {crop.suitable_weather}
                            </div>
                            <div className="mb-1 d-flex align-items-start">
                              <FaBug className="me-1 mt-1" />
                              <span>
                                <span className="fw-semibold">Pests: </span>
                                {crop.pest_info}
                              </span>
                            </div>
                            {crop.benefits_summary && (
                              <div className="mt-1">
                                <span className="fw-semibold">
                                  Benefits:{" "}
                                </span>
                                {crop.benefits_summary}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-between mt-2">
              <button className="btn btn-outline-secondary" onClick={onBack}>
                Back
              </button>
              <button className="btn btn-success fw-semibold" onClick={onNext}>
                View full advisory
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------- STEP 4: OILSEED DETAILS + CONFIRM ---------- */
const StepOilseedDetails = ({
  oilseed,
  selectedPlot,
  onConfirmPlan,
  onBack,
  saveLoading,
}) => {
  const area = selectedPlot.user_provided_area ?? 0;

  const schemes = oilseed.government_schemes || [];
  const fertilizers = oilseed.fertilizers || [];
  const fertSchedule = oilseed.fertilizer_schedule || [];
  const irrigationSteps = oilseed.irrigation_steps || [];
  const growSteps = oilseed.how_to_grow_steps || [];

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-warning bg-gradient d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-semibold text-dark">
            Step 4 — Review oilseed details & save
          </div>
          <small className="text-muted">
            Plot: <b>{selectedPlot.plot_name}</b> • Area:{" "}
            <b>{area} acres</b>
          </small>
        </div>
        <span className="badge rounded-pill bg-success-subtle text-success border border-success">
          <FaSeedling className="me-1" />
          {oilseed.crop_name}
        </span>
      </div>

      <div className="card-body small">
        {/* Top summary card */}
        <div
          className="p-3 rounded mb-3"
          style={{ backgroundColor: "#fffbeb", border: "1px solid #fde68a" }}
        >
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <div className="fw-bold d-flex align-items-center gap-2">
                <FaSeedling />
                <span>{oilseed.crop_name}</span>
                <span className="badge bg-warning text-dark">
                  {oilseed.crop_type}
                </span>
              </div>
              <div className="mt-1">
                <span className="fw-semibold">Recommended breed: </span>
                {oilseed.recommended_breed}
              </div>
              {oilseed.benefits_summary && (
                <div className="mt-1 text-muted">
                  <span className="fw-semibold">Why this crop: </span>
                  {oilseed.benefits_summary}
                </div>
              )}
            </div>
            <div className="text-end">
              <div className="small text-muted">Market price (mandi)</div>
              <div className="fw-semibold d-flex align-items-center justify-content-end">
                <FaRupeeSign className="me-1 text-success" />
                <span>{oilseed.price_mandi_estimate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Yield & demand row */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div
              className="h-100 p-3 rounded"
              style={{ backgroundColor: "#ecfdf3", border: "1px solid #bbf7d0" }}
            >
              <div className="fw-semibold text-success mb-1">
                Yield & income potential
              </div>
              <div className="mb-1">
                <span className="fw-semibold">Per acre: </span>
                {oilseed.projected_yield_per_acre || "—"}
              </div>
              <div className="mb-1">
                <span className="fw-semibold">For your plot: </span>
                {typeof oilseed.projected_yield_for_plot !== "undefined"
                  ? `${oilseed.projected_yield_for_plot} tons (approx.)`
                  : "—"}
              </div>
              <div className="text-muted small mt-1">
                Actual yield depends on sowing time, management, and weather.
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div
              className="h-100 p-3 rounded"
              style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe" }}
            >
              <div className="fw-semibold text-primary mb-1">
                Climate fit & demand
              </div>
              <div className="mb-1">
                <span className="fw-semibold">Weather fit: </span>
                {oilseed.suitable_weather || "—"}
              </div>
              <div className="mb-1">
                <span className="fw-semibold">Demand: </span>
                {oilseed.demand || "—"}
              </div>
              <div className="d-flex align-items-start mt-1">
                <FaBug className="me-1 mt-1" />
                <span>
                  <span className="fw-semibold">Pest note: </span>
                  {oilseed.pest_info || "—"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Fertilizer & irrigation */}
        <div className="row g-3 mb-3">
          <div className="col-md-6">
            <div
              className="h-100 p-3 rounded"
              style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
            >
              <div className="fw-semibold mb-1 d-flex align-items-center gap-1">
                <FaLeaf /> Fertilizers & schedule
              </div>
              {fertilizers.length > 0 && (
                <div className="mb-1">
                  <span className="fw-semibold">Fertilizers: </span>
                  {fertilizers.join(", ")}
                </div>
              )}
              {fertilizers.length === 0 && (
                <div className="text-muted small">No fertilizers listed.</div>
              )}
              {fertSchedule.length > 0 && (
                <ul className="small mt-2 mb-0 ps-3">
                  {fertSchedule.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div
              className="h-100 p-3 rounded"
              style={{ backgroundColor: "#ecfdf3", border: "1px solid #bbf7d0" }}
            >
              <div className="fw-semibold mb-1 d-flex align-items-center gap-1">
                <FaWater /> Irrigation plan
              </div>
              {irrigationSteps.length > 0 ? (
                <ul className="small mb-0 ps-3">
                  {irrigationSteps.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted small">
                  No specific irrigation steps listed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* How to grow */}
        <div
          className="p-3 rounded mb-3"
          style={{ backgroundColor: "#fef3c7", border: "1px solid #fde68a" }}
        >
          <div className="fw-semibold mb-1 d-flex align-items-center gap-1">
            <FaTractor /> How to grow (step-by-step)
          </div>
          {growSteps.length > 0 ? (
            <ol className="small mb-0 ps-3">
              {growSteps.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ol>
          ) : (
            <div className="text-muted small">
              Detailed grow steps are not available.
            </div>
          )}
        </div>

        {/* Government schemes */}
        <div
          className="p-3 rounded mb-3"
          style={{ backgroundColor: "#eef2ff", border: "1px solid #c7d2fe" }}
        >
          <div className="fw-semibold mb-2 d-flex align-items-center gap-1">
            <FaCertificate /> Government schemes for you
          </div>
          {schemes.length === 0 ? (
            <div className="text-muted small">No schemes listed.</div>
          ) : (
            <div className="row g-2">
              {schemes.map((s) => (
                <div className="col-md-6" key={s.name}>
                  <div className="border rounded p-2 h-100 bg-white">
                    <div className="fw-semibold">{s.name}</div>
                    {s.description && (
                      <div className="small text-muted">{s.description}</div>
                    )}
                    {s.benefits && (
                      <div className="small mt-1">
                        <span className="fw-semibold">Benefits: </span>
                        {s.benefits}
                      </div>
                    )}
                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noreferrer"
                        className="small text-primary d-inline-block mt-1"
                      >
                        View details →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-between mt-3">
          <button className="btn btn-outline-secondary" onClick={onBack}>
            Back
          </button>
          <button
            className="btn btn-success fw-semibold d-flex align-items-center"
            onClick={onConfirmPlan}
            disabled={saveLoading}
          >
            {saveLoading && (
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
            )}
            Confirm & save to plot <FaArrowRight className="ms-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ---------- STEP 5: FINAL STATUS (saving result + redirect) ---------- */
const StepFinalStatus = ({
  finalJson,
  saveLoading,
  saveError,
  saveSuccess,
  selectedPlot,
  onStartOver,
}) => {
  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-success bg-gradient text-white d-flex align-items-center">
        <FaTractor className="me-2" />
        <div>
          <div className="fw-semibold">Final: save crop plan</div>
          <small>Save status and next steps.</small>
        </div>
      </div>

      <div className="card-body">
        {saveLoading && (
          <div className="text-center py-4">
            <div className="spinner-border text-success mb-3" role="status" />
            <div className="fw-semibold">Saving crop plan…</div>
            <div className="text-muted small mt-2">Please wait</div>
          </div>
        )}

        {!saveLoading && saveError && (
          <div className="alert alert-danger">
            <div className="fw-semibold">Failed to save plan</div>
            <div className="small">{saveError}</div>
            <div className="mt-3 d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={onStartOver}
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {!saveLoading && saveSuccess && (
          <div className="text-center py-4">
            <div className="mb-3">
              <div className="h4 text-success fw-bold">
                Oilseed successfully added to the plot
              </div>
            </div>

            <p className="text-muted small mb-3">
              You can now manage this crop from your plot dashboard.
            </p>

            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-primary fw-semibold"
                onClick={() => {
                  const pid = selectedPlot?.id ?? "";
                  window.location.href = `/manage-fields/${pid}`;
                }}
              >
                Go to Manage Fields
              </button>

              <button
                className="btn btn-outline-success"
                onClick={onStartOver}
              >
                Do another plot
              </button>
            </div>

            {finalJson && (
              <div className="mt-3 text-start small text-muted">
                <div className="fw-semibold mb-1">
                  Saved data (for reference):
                </div>
                <pre
                  className="small bg-light p-2 rounded"
                  style={{ maxHeight: 200, overflow: "auto" }}
                >
{JSON.stringify(finalJson, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {!saveLoading && !saveSuccess && !saveError && (
          <div className="text-center py-3 text-muted small">
            Click Confirm on the previous screen to save the plan.
          </div>
        )}
      </div>
    </div>
  );
};

/* ---------- Shared helpers ---------- */
const StepPill = ({ step, label, active, icon }) => (
  <div
    className={`badge rounded-pill px-3 py-2 d-flex align-items-center gap-2 ${
      active ? "text-bg-success" : "text-bg-light border border-success"
    }`}
    style={{ fontSize: "0.8rem" }}
  >
    <span className="fw-bold">{step}</span> {icon} <span>{label}</span>
  </div>
);

const DetailCol = ({ label, value }) => (
  <div className="col-md-6">
    <div className="text-uppercase text-muted fw-semibold small">{label}</div>
    <div className="fw-semibold">{value ?? "—"}</div>
  </div>
);

export default OilSeedAdvisory;
