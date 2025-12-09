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

const PlanCropsAdvisory = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPlot, setSelectedPlot] = useState(null);

  // 1 = choose plot, 2 = fill form, 3 = pick crops,
  // 4 = view plans, 5 = final status
  const [step, setStep] = useState(1);

  // Form state
  const [soilType, setSoilType] = useState("");
  const [npk, setNpk] = useState({ n: "", p: "", k: "" });
  const [irrigationLevel, setIrrigationLevel] = useState("");
  const [plotDetails, setPlotDetails] = useState("");

  // Advisory payload we send to backend (for crops)
  const [advisoryPayload, setAdvisoryPayload] = useState(null);

  // Recommended crops from backend
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [cropsError, setCropsError] = useState("");

  // Selected crops (by name) in order: [primary, secondary]
  const [selectedCropNames, setSelectedCropNames] = useState([]);

  // Resolved crop objects (for plans + final JSON)
  const [primaryCrop, setPrimaryCrop] = useState(null);
  const [secondaryCrop, setSecondaryCrop] = useState(null);

  // Recommended plans
  const [recommendedPlans, setRecommendedPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState("");
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);

  // Final JSON for primary + secondary crop plan (kept for internal use)
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

  const handleSelectPlot = (plot) => {
    setSelectedPlot(plot);
    setSoilType("");
    setNpk({ n: "", p: "", k: "" });
    setIrrigationLevel("");
    setPlotDetails("");
    setAdvisoryPayload(null);
    setRecommendedCrops([]);
    setSelectedCropNames([]);
    setPrimaryCrop(null);
    setSecondaryCrop(null);
    setRecommendedPlans([]);
    setSelectedPlanIndex(null);
    setFinalCropPlanJson(null);
    setSaveLoading(false);
    setSaveError("");
    setSaveSuccess(false);
    setStep(2);
  };

  // ------------------- Step 2: call recommended-crops -------------------
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlot) return;

    setCropsError("");
    setCropsLoading(true);

    const npkString = `N:${npk.n},P:${npk.p},K:${npk.k}`;
    const today = new Date().toISOString().slice(0, 10);

    const payload = {
      soil_type: soilType,
      npk: npkString,
      state: selectedPlot.state || "Maharashtra",
      region: selectedPlot.region || "Pune",
      plot_details: plotDetails || "Not provided",
      plot_area: selectedPlot.user_provided_area ?? 0,
      todays_date: today,
    };

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/advisory/recommended-crops",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        throw new Error(
          `Failed to get recommended crops. Status: ${res.status}`
        );
      }

      const data = await res.json();
      const crops = Array.isArray(data.crops) ? data.crops : [];

      setAdvisoryPayload(payload);
      setRecommendedCrops(crops);
      setSelectedCropNames([]);
      setStep(3);
    } catch (err) {
      console.error(err);
      setCropsError(err.message || "Error fetching recommended crops.");
    } finally {
      setCropsLoading(false);
    }
  };

  // ------------------- Step 3: chosen crops -> call recommended plan API -------------------
  const handleNextToPlans = async () => {
    if (selectedCropNames.length === 0) {
      alert("Please select at least one crop (primary).");
      return;
    }
    const primaryName = selectedCropNames[0];
    const secondaryName = selectedCropNames[1] || null;

    const primary = recommendedCrops.find((c) => c.crop_name === primaryName);
    const secondary = secondaryName
      ? recommendedCrops.find((c) => c.crop_name === secondaryName)
      : null;

    if (!primary) {
      alert("Primary crop not found. Please re-select.");
      return;
    }

    setPrimaryCrop(primary);
    setSecondaryCrop(secondary);

    setPlansError("");
    setPlansLoading(true);
    setRecommendedPlans([]);
    setSelectedPlanIndex(null);

    const payloadForPlan = {
      selected_primary_crop: primary,
      selected_secondary_crop: secondary,
      plot_area: selectedPlot?.user_provided_area ?? 0,
    };

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/advisory/recommeneded-plan",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadForPlan),
        }
      );
      if (!res.ok) {
        throw new Error(
          `Failed to get recommended plans. Status: ${res.status}`
        );
      }
      const data = await res.json();
      const plans = Array.isArray(data.recommended_plans)
        ? data.recommended_plans
        : [];
      setRecommendedPlans(plans);
      setStep(4);
    } catch (err) {
      console.error(err);
      setPlansError(err.message || "Error fetching recommended plans.");
    } finally {
      setPlansLoading(false);
    }
  };

  // ------------------- Step 4: plan -> save to backend -------------------
  const handleConfirmPlan = async () => {
    if (selectedPlanIndex === null) {
      alert("Please choose one plan.");
      return;
    }
    if (!selectedPlot || !primaryCrop) {
      alert("Missing data. Please go back and re-select.");
      return;
    }

    const plan = recommendedPlans[selectedPlanIndex];
    const today = new Date().toISOString().slice(0, 10);

    const primaryJson = {
      plot_id: selectedPlot.id,
      crop_name: plan.primary_crop_name,
      area_acres: plan.primary_area,
      sowing_date: today,
      status: "growing",
    };

    const secondaryJson = {
      plot_id: selectedPlot.id,
      crop_name: plan.secondary_crop_name,
      area_acres: plan.secondary_area,
      sowing_date: today,
      status: "growing",
    };

    const combined = {
      primary_crop: primaryJson,
      secondary_crop: secondaryJson,
    };

    // store final JSON locally for reference
    setFinalCropPlanJson(combined);

    // send to backend
    setSaveError("");
    setSaveLoading(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/plots/crop-plan/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(combined),
        }
      );

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Save failed. Status ${res.status}. ${txt}`);
      }

      // success
      setSaveSuccess(true);
      setStep(5);
    } catch (err) {
      console.error(err);
      setSaveError(err.message || "Failed to save crop plan.");
      // still move to step 5 so user can see error and retry/start over
      setStep(5);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedPlot(null);
    setAdvisoryPayload(null);
    setRecommendedCrops([]);
    setSelectedCropNames([]);
    setPrimaryCrop(null);
    setSecondaryCrop(null);
    setRecommendedPlans([]);
    setSelectedPlanIndex(null);
    setFinalCropPlanJson(null);
    setSoilType("");
    setNpk({ n: "", p: "", k: "" });
    setIrrigationLevel("");
    setPlotDetails("");
    setSaveLoading(false);
    setSaveError("");
    setSaveSuccess(false);
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
            Smart Crop Advisory
          </h2>
          <p className="text-muted mb-3">
            Flow: select plot → fill details → pick crops → plans → finalize.
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
              label="Choose Crops"
              active={step === 3}
              icon={<FaLeaf />}
            />
            <StepPill
              step={4}
              label="Choose Plan"
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
            onSubmit={handleFormSubmit}
            onBack={() => setStep(1)}
            cropsLoading={cropsLoading}
          />
        )}

        {step === 3 && advisoryPayload && (
          <StepRecommendedCrops
            recommendedCrops={recommendedCrops}
            cropsError={cropsError}
            cropsLoading={cropsLoading}
            selectedCropNames={selectedCropNames}
            setSelectedCropNames={setSelectedCropNames}
            onNext={handleNextToPlans}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepRecommendedPlans
            primaryCrop={primaryCrop}
            secondaryCrop={secondaryCrop}
            recommendedPlans={recommendedPlans}
            plansError={plansError}
            plansLoading={plansLoading}
            selectedPlanIndex={selectedPlanIndex}
            setSelectedPlanIndex={setSelectedPlanIndex}
            onConfirmPlan={handleConfirmPlan}
            onBack={() => setStep(3)}
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
        <div className="fw-semibold">
          Step 1: Select a plot for crop advisory
        </div>
        <small className="d-block">
          Tap on your plot card to move to the next step.
        </small>
      </div>
    </div>
    <div className="card-body p-3">
      {plots.length === 0 && (
        <div className="text-center text-muted">
          No plots found for this user.
        </div>
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

/* ---------- STEP 2: FORM (recommended-crops) ---------- */
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
  onSubmit,
  onBack,
  cropsLoading,
}) => (
  <div className="card shadow-sm border-0">
    <div className="card-header bg-primary bg-gradient text-white d-flex align-items-center">
      <FaWater className="me-2" />
      <div>
        <div className="fw-semibold">Step 2: Fill plot & soil details</div>
        <small>We’ll send this to get recommended crops.</small>
      </div>
    </div>
    <div className="card-body small">
      <div className="mb-3 p-2 rounded" style={{ backgroundColor: "#ecfdf3" }}>
        <div className="fw-semibold text-success mb-1">
          <FaMapMarkedAlt className="me-1" />
          Selected Plot Summary
        </div>
        <div className="row g-2">
          <DetailCol label="Plot Name" value={selectedPlot.plot_name} />
          <DetailCol label="Plot ID" value={selectedPlot.id} />
          <DetailCol label="Area" value={selectedPlot.user_provided_area} />
          <DetailCol
            label="Status"
            value={selectedPlot.status?.stage || "Registered"}
          />
        </div>
      </div>

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

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              N (Nitrogen) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 80"
              value={npk.n}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d]/g, ""); // digits only
                if (val > 1200) val = 1200; // max limit
                setNpk({ ...npk, n: val });
              }}
              min="0"
              max="1200"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              P (Phosphorus) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 40"
              value={npk.p}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d]/g, "");
                if (val > 150) val = 150;
                setNpk({ ...npk, p: val });
              }}
              min="0"
              max="150"
              required
            />
          </div>

          <div className="col-md-4">
            <label className="form-label fw-semibold">
              K (Potassium) <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              className="form-control"
              placeholder="e.g. 40"
              value={npk.k}
              onChange={(e) => {
                let val = e.target.value.replace(/[^\d]/g, "");
                if (val > 800) val = 800;
                setNpk({ ...npk, k: val });
              }}
              min="0"
              max="800"
              required
            />
          </div>

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
              placeholder="e.g. Slight slope, good drainage"
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
              Get recommended crops
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
);

/* ---------- STEP 3: RECOMMENDED CROPS (cards) ---------- */
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
      if (prev.includes(cropName)) {
        return prev.filter((n) => n !== cropName);
      }
      if (prev.length === 0) return [cropName];
      if (prev.length === 1) return [...prev, cropName];
      return [prev[0], cropName];
    });
  };

  const primaryName = selectedCropNames[0] || null;
  const secondaryName = selectedCropNames[1] || null;

  const primaryCrop = primaryName
    ? recommendedCrops.find((c) => c.crop_name === primaryName)
    : null;

  const isPrimaryNonOilseed =
    primaryCrop &&
    primaryCrop.crop_type &&
    primaryCrop.crop_type.toLowerCase() !== "oilseed";

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-success bg-gradient text-white d-flex align-items-center">
        <FaLeaf className="me-2" />
        <div>
          <div className="fw-semibold">Step 3: Recommended crops</div>
          <small>
            First selected = primary, second = secondary. Tap cards to choose.
          </small>
        </div>
      </div>
      <div className="card-body small">
        {cropsLoading && (
          <div className="text-center my-3">
            <div className="spinner-border text-success mb-2" role="status" />
            <div className="text-muted">Fetching recommended crops…</div>
          </div>
        )}

        {cropsError && (
          <div className="alert alert-danger py-2 small">{cropsError}</div>
        )}

        {isPrimaryNonOilseed && (
          <div className="alert alert-warning d-flex align-items-center py-2 small mb-3">
            <FaInfoCircle className="me-2" />
            <span>
              Primary crop <strong>{primaryCrop?.crop_name}</strong> is not an
              oilseed. For intercropping, select an{" "}
              <strong>oilseed crop</strong> as secondary.
            </span>
          </div>
        )}

        {!cropsLoading && !cropsError && recommendedCrops.length === 0 && (
          <div className="text-center text-muted">
            No crops received from advisory API.
          </div>
        )}

        {recommendedCrops.length > 0 && (
          <>
            <div className="mb-3">
              <div className="fw-semibold mb-1">Your selection</div>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success-subtle text-success border border-success">
                  Primary: <strong>{primaryName || "Not selected"}</strong>
                </span>
                <span className="badge bg-info-subtle text-info border border-info">
                  Secondary: <strong>{secondaryName || "Not selected"}</strong>
                </span>
              </div>
            </div>

            <div className="row g-3 mb-3">
              {recommendedCrops.map((crop) => {
                const isPrimary = crop.crop_name === primaryName;
                const isSecondary = crop.crop_name === secondaryName;
                const isSelected = isPrimary || isSecondary;
                const isOilseed =
                  crop.crop_type && crop.crop_type.toLowerCase() === "oilseed";

                let borderClass = "border-0";
                let bgColor = "#f0fdf4";
                if (isPrimary) {
                  borderClass = "border-2 border-success";
                  bgColor = "#dcfce7";
                } else if (isSecondary) {
                  borderClass = "border-2 border-info";
                  bgColor = "#e0f2fe";
                } else if (isOilseed) {
                  borderClass = "border-2 border-warning-subtle";
                  bgColor = "#fffbeb";
                }

                const expanded = expandedCropName === crop.crop_name;

                return (
                  <div className="col-md-6" key={crop.crop_name}>
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
                              <span className="badge rounded-pill bg-light text-secondary border border-secondary-subtle">
                                {crop.season_recommended}
                              </span>
                            </div>
                          </div>
                          <div className="text-end">
                            {isPrimary && (
                              <span className="badge bg-success">Primary</span>
                            )}
                            {isSecondary && !isPrimary && (
                              <span className="badge bg-info text-dark">
                                Secondary
                              </span>
                            )}
                            {!isSelected && isOilseed && (
                              <span className="badge bg-warning text-dark">
                                Oilseed
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="small text-muted mb-1 d-flex justify-content-between align-items-center">
                          <div>
                            <FaRupeeSign className="me-1" />
                            <span>{crop.price_forecasted}</span>
                          </div>
                          <div>
                            <span className="small text-muted me-2">
                              Demand:
                            </span>
                            <span
                              className={`badge ${
                                String(crop.demand || "").toLowerCase() ===
                                "high"
                                  ? "bg-danger text-white"
                                  : String(crop.demand || "").toLowerCase() ===
                                    "medium"
                                  ? "bg-warning text-dark"
                                  : "bg-success text-white"
                              } rounded-pill`}
                            >
                              {crop.demand || "—"}
                            </span>
                          </div>
                        </div>

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
                              Hide details <FaChevronUp className="ms-2" />
                            </>
                          ) : (
                            <>
                              Details <FaChevronDown className="ms-2" />
                            </>
                          )}
                        </button>

                        {expanded && (
                          <div className="mt-2 small border-top pt-2">
                            <div className="mb-1">
                              <span className="fw-semibold">Breed: </span>
                              {crop.breed}
                            </div>
                            <div className="mb-1">
                              <span className="fw-semibold">Weather: </span>
                              {crop.suitable_weather}
                            </div>
                            <div className="mb-1 d-flex align-items-start">
                              <FaBug className="me-1 mt-1" />
                              <span>
                                <span className="fw-semibold">Pests: </span>
                                {crop.pest_info}
                              </span>
                            </div>
                            {Array.isArray(crop.government_schemes) &&
                              crop.government_schemes.length > 0 && (
                                <div className="mt-1">
                                  <div className="fw-semibold mb-1 d-flex align-items-center">
                                    <FaCertificate className="me-1" />
                                    Government schemes:
                                  </div>
                                  <ul className="ps-3 mb-0">
                                    {crop.government_schemes.map((s) => (
                                      <li key={s.name}>
                                        <span className="fw-semibold">
                                          {s.name}
                                        </span>
                                        {s.description
                                          ? ` — ${s.description}`
                                          : ""}
                                      </li>
                                    ))}
                                  </ul>
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
                Continue to plans
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ---------- STEP 4: RECOMMENDED PLANS (compact, farmer-friendly cards) ---------- */
const StepRecommendedPlans = ({
  primaryCrop,
  secondaryCrop,
  recommendedPlans,
  plansError,
  plansLoading,
  selectedPlanIndex,
  setSelectedPlanIndex,
  onConfirmPlan,
  onBack,
}) => {
  const [expandedPlanIndex, setExpandedPlanIndex] = useState(null);

  const primaryName = primaryCrop?.crop_name || "Primary";
  const secondaryName = secondaryCrop?.crop_name || "Secondary";

  // pastel color palette
  const palette = [
    { bg: "#FFF8E6", border: "#FFE0A3" }, // Cream
    { bg: "#EFFFF4", border: "#C8F7D4" }, // Mint
    { bg: "#F3F8FF", border: "#D7E6FF" }, // Sky
    { bg: "#FFF1F5", border: "#FFD6E4" }, // Pink
    { bg: "#F5FFF4", border: "#CBF5C8" }, // Green
    { bg: "#FFF9E8", border: "#FFE9B2" }, // Wheat
  ];

  const demandBadge = (d) => {
    const dd = String(d || "").toLowerCase();
    if (dd.includes("high"))
      return { txt: "High", cls: "bg-danger text-white" };
    if (dd.includes("medium"))
      return { txt: "Medium", cls: "bg-warning text-dark" };
    if (dd.includes("low")) return { txt: "Low", cls: "bg-success text-white" };
    return { txt: d || "—", cls: "bg-secondary text-white" };
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-warning bg-gradient d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-semibold text-dark">
            Step 4 — Choose best crop plan
          </div>
          <small className="text-muted">
            Based on <b>{primaryName}</b> + <b>{secondaryName}</b>
          </small>
        </div>
        <div className="badge rounded-pill bg-success-subtle text-success border border-success">
          Total area:{" "}
          <strong>
            {primaryCrop ? `${primaryCrop.plot_area ?? "—"} acres` : "—"}
          </strong>
        </div>
      </div>

      <div className="card-body">
        {plansLoading && (
          <div className="text-center my-3">
            <div className="spinner-border text-success mb-2" role="status" />
            <div className="text-muted">Calculating best plans…</div>
          </div>
        )}

        {plansError && (
          <div className="alert alert-danger small">{plansError}</div>
        )}

        {!plansLoading && !plansError && recommendedPlans.length === 0 && (
          <div className="text-center text-muted">No plans received.</div>
        )}

        {recommendedPlans.length > 0 && (
          <>
            <div className="mb-3">
              <div className="fw-semibold mb-1">Available plans</div>
              <div className="small text-muted">
                Tap a plan to select. Click <strong>Details</strong> to open
                more information.
              </div>
            </div>

            <div className="row g-3">
              {recommendedPlans.map((plan, idx) => {
                const isSelected = idx === selectedPlanIndex;
                const expanded = idx === expandedPlanIndex;
                const pal = palette[idx % palette.length];
                const label = String.fromCharCode(65 + idx); // A, B, C...
                const demand = demandBadge(plan.demand_summary || "");
                const schemes = plan.unified_government_schemes || [];

                return (
                  <div className="col-md-6" key={`${plan.ratio_label}-${idx}`}>
                    <div
                      className={`card h-100 shadow-sm ${
                        isSelected ? "border-3 border-success" : "border"
                      }`}
                      style={{
                        cursor: "pointer",
                        background: pal.bg,
                        borderColor: isSelected ? "#28a745" : pal.border,
                        transition: "all 0.15s ease",
                      }}
                      onClick={() => setSelectedPlanIndex(idx)}
                    >
                      <div className="card-body">
                        {/* header row */}
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <div className="d-flex align-items-center gap-2">
                              <span
                                className="badge rounded-pill text-white"
                                style={{
                                  backgroundColor: "#0B8457",
                                  padding: "6px 12px",
                                  fontSize: "0.9rem",
                                }}
                              >
                                Plan {label}
                              </span>
                              <div className="fw-bold">
                                {plan.primary_crop_name}{" "}
                                {plan.primary_percentage}% •{" "}
                                {plan.secondary_crop_name}{" "}
                                {plan.secondary_percentage}%
                              </div>
                            </div>
                            <div className="small text-muted mt-1">
                              {plan.benefit_summary}
                            </div>
                          </div>

                          <div className="text-end">
                            <div className="small text-muted">Expected</div>
                            <div className="fw-semibold d-flex align-items-center">
                              <FaRupeeSign className="me-1 text-success" />
                              <span style={{ fontSize: "1.05rem" }}>
                                {Number(
                                  plan.projected_income_value || 0
                                ).toLocaleString("en-IN")}
                              </span>
                            </div>

                            <div className="mt-2">
                              <span
                                className={`badge ${demand.cls} rounded-pill`}
                              >
                                Demand :{demand.txt}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Government schemes box (subtle green) */}
                        <div
                          className="p-3 mb-2"
                          style={{
                            backgroundColor: "#ecfdf3",
                            border: "1px solid #d1fae5",
                            borderRadius: 10,
                          }}
                        >
                          <div className="fw-semibold text-success mb-1">
                            Government schemes
                          </div>
                          {schemes.length === 0 ? (
                            <div className="small text-muted">
                              No schemes available.
                            </div>
                          ) : (
                            <ul className="ps-3 mb-0 small">
                              {schemes.slice(0, 6).map((s) => (
                                <li key={s.name}>
                                  <span className="fw-semibold">{s.name}</span>
                                  {s.description ? ` — ${s.description}` : ""}
                                </li>
                              ))}
                              {schemes.length > 6 && (
                                <li className="text-muted">
                                  +{schemes.length - 6} more
                                </li>
                              )}
                            </ul>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-2 d-flex justify-content-between align-items-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedPlanIndex((prev) =>
                                prev === idx ? null : idx
                              );
                            }}
                          >
                            {expanded ? (
                              <>
                                Hide details <FaChevronUp className="ms-2" />
                              </>
                            ) : (
                              <>
                                Details <FaChevronDown className="ms-2" />
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            className={`btn btn-sm ${
                              isSelected ? "btn-success" : "btn-outline-success"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlanIndex(idx);
                            }}
                          >
                            {isSelected ? "Selected" : "Choose this plan"}
                          </button>
                        </div>

                        {/* Expanded details */}
                        {expanded && (
                          <div className="mt-3 border-top pt-2 small text-muted">
                            <div className="mb-2">
                              <div className="fw-semibold">Income details</div>
                              <div>{plan.projected_income_text}</div>
                            </div>

                            <div className="mb-2">
                              <div className="fw-semibold">Demand summary</div>
                              <div>{plan.demand_summary}</div>
                            </div>

                            <div className="mb-2">
                              <div className="fw-semibold">
                                Government schemes (full list)
                              </div>
                              <ul className="ps-3 mb-0">
                                {schemes.map((s) => (
                                  <li key={s.name}>
                                    <span className="fw-semibold">
                                      {s.name}
                                    </span>
                                    {s.description ? ` — ${s.description}` : ""}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="d-flex justify-content-between mt-3">
              <button className="btn btn-outline-secondary" onClick={onBack}>
                Back
              </button>
              <button
                className="btn btn-success"
                onClick={onConfirmPlan}
                disabled={selectedPlanIndex === null}
              >
                Confirm and Save Plan <FaArrowRight className="ms-2" />
              </button>
            </div>
          </>
        )}
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
                Crops successfully added to the Plot
              </div>
            </div>

            <p className="text-muted small mb-3">
              You can manage the plot fields now.
            </p>

            <div className="d-flex justify-content-center gap-2">
              <button
                className="btn btn-primary fw-semibold"
                onClick={() => {
                  // redirect to manage fields for this plot
                  const pid = selectedPlot?.id ?? "";
                  window.location.href = `/manage-fields/${pid}`;
                }}
              >
                Go to Manage Fields
              </button>

              <button className="btn btn-outline-success" onClick={onStartOver}>
                Do another plot
              </button>
            </div>
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

export default PlanCropsAdvisory;
