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
} from "react-icons/fa";

const PlanCropsAdvisory = () => {
  const [plots, setPlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedPlot, setSelectedPlot] = useState(null);

  // 1 = choose plot, 2 = fill form, 3 = pick crops, 4 = final JSON
  const [step, setStep] = useState(1);

  // Form state
  const [soilType, setSoilType] = useState("");
  const [npk, setNpk] = useState({ n: "", p: "", k: "" });
  const [irrigationLevel, setIrrigationLevel] = useState("");
  const [plotDetails, setPlotDetails] = useState("");

  // Advisory payload we send to backend
  const [advisoryPayload, setAdvisoryPayload] = useState(null);

  // Recommended crops from backend
  const [recommendedCrops, setRecommendedCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [cropsError, setCropsError] = useState("");

  // Selected crops (by name) in order: [primary, secondary]
  const [selectedCropNames, setSelectedCropNames] = useState([]);

  // Final combined JSON
  const [finalResult, setFinalResult] = useState(null);

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
    setFinalResult(null);
    setStep(2); // move to form
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlot) return;

    setCropsError("");
    setCropsLoading(true);

    const npkString = `N:${npk.n},P:${npk.p},K:${npk.k}`;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

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
          headers: {
            "Content-Type": "application/json",
          },
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
      setStep(3); // go to crop selection
    } catch (err) {
      console.error(err);
      setCropsError(err.message || "Error fetching recommended crops.");
    } finally {
      setCropsLoading(false);
    }
  };

  const handleConfirmCrops = () => {
    if (selectedCropNames.length === 0) {
      alert("Please select at least one crop (primary).");
      return;
    }

    const primaryName = selectedCropNames[0];
    const secondaryName = selectedCropNames[1] || null;

    const primaryCrop = recommendedCrops.find(
      (c) => c.crop_name === primaryName
    );
    const secondaryCrop = secondaryName
      ? recommendedCrops.find((c) => c.crop_name === secondaryName)
      : null;

    const result = {
      advisory_payload: advisoryPayload,
      all_recommended_crops: recommendedCrops,
      selected_primary_crop: primaryCrop || null,
      selected_secondary_crop: secondaryCrop || null,
    };

    setFinalResult(result);
    setStep(4);
  };

  const handleStartOver = () => {
    setSelectedPlot(null);
    setAdvisoryPayload(null);
    setRecommendedCrops([]);
    setSelectedCropNames([]);
    setFinalResult(null);
    setSoilType("");
    setNpk({ n: "", p: "", k: "" });
    setIrrigationLevel("");
    setPlotDetails("");
    setStep(1);
  };

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
            Flow: select plot → fill details → pick crops → final JSON.
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
              label="Final JSON"
              active={step === 4}
              icon={<FaTractor />}
            />
          </div>
        </div>

        {/* Wizard screens */}
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
            onConfirm={handleConfirmCrops}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && finalResult && (
          <StepFinalJSON finalResult={finalResult} onStartOver={handleStartOver} />
        )}
      </div>
    </div>
  );
};

/* --- STEP 1: SELECT PLOT SCREEN --- */
const StepSelectPlot = ({ plots, onSelectPlot }) => (
  <div className="card shadow-sm border-0">
    <div className="card-header bg-success text-white d-flex align-items-center">
      <FaMapMarkedAlt className="me-2" />
      <div>
        <div className="fw-semibold">Step 1: Select a plot for crop advisory</div>
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

/* --- STEP 2: FORM SCREEN (build payload & call API) --- */
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
          {/* Soil Type */}
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

          {/* NPK */}
          <div className="col-md-4">
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
          <div className="col-md-4">
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
          <div className="col-md-4">
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

          {/* Irrigation */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">
              Irrigation Level
            </label>
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

          {/* Plot details */}
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

/* --- STEP 3: RECOMMENDED CROPS (cards, click = primary/secondary) --- */
const StepRecommendedCrops = ({
  recommendedCrops,
  cropsError,
  cropsLoading,
  selectedCropNames,
  setSelectedCropNames,
  onConfirm,
  onBack,
}) => {
  const [expandedCropName, setExpandedCropName] = useState(null);

  const handleCardClick = (cropName) => {
    setSelectedCropNames((prev) => {
      // If already selected: remove it
      if (prev.includes(cropName)) {
        return prev.filter((name) => name !== cropName);
      }
      // Not selected yet:
      if (prev.length === 0) {
        return [cropName];
      }
      if (prev.length === 1) {
        return [...prev, cropName]; // primary + secondary
      }
      // If already two selected, replace secondary
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
            Tap cards to choose crops. First selected = primary, second = secondary.
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

        {/* Intercropping hint if primary is NOT oilseed */}
        {isPrimaryNonOilseed && (
          <div className="alert alert-warning d-flex align-items-center py-2 small mb-3">
            <FaInfoCircle className="me-2" />
            <span>
              Your primary crop{" "}
              <strong>{primaryCrop?.crop_name}</strong> is not an oilseed.
              For intercropping, please select an{" "}
              <strong>oilseed crop</strong> as the secondary crop.
            </span>
          </div>
        )}

        {!cropsLoading &&
          !cropsError &&
          recommendedCrops.length === 0 && (
            <div className="text-center text-muted">
              No crops received from advisory API.
            </div>
          )}

        {recommendedCrops.length > 0 && (
          <>
            {/* Selected summary */}
            <div className="mb-3">
              <div className="fw-semibold mb-1">Your selection</div>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-success-subtle text-success border border-success">
                  Primary:{" "}
                  <strong>{primaryName || "Not selected"}</strong>
                </span>
                <span className="badge bg-info-subtle text-info border border-info">
                  Secondary:{" "}
                  <strong>{secondaryName || "Not selected"}</strong>
                </span>
              </div>
              <div className="form-text">
                Tap once for primary, tap another crop for secondary. Tap again
                to deselect.
              </div>
            </div>

            {/* Crop cards */}
            <div className="row g-3 mb-3">
              {recommendedCrops.map((crop) => {
                const isPrimary = crop.crop_name === primaryName;
                const isSecondary = crop.crop_name === secondaryName;
                const isSelected = isPrimary || isSecondary;
                const isOilseed =
                  crop.crop_type &&
                  crop.crop_type.toLowerCase() === "oilseed";

                let borderClass = "border-0";
                let bgColor = "#f0fdf4"; // light green
                if (isPrimary) {
                  borderClass = "border-2 border-success";
                  bgColor = "#dcfce7";
                } else if (isSecondary) {
                  borderClass = "border-2 border-info";
                  bgColor = "#e0f2fe";
                } else if (isOilseed) {
                  borderClass = "border-2 border-warning-subtle";
                  bgColor = "#fffbeb"; // soft yellow hint for oilseed
                }

                const expanded = expandedCropName === crop.crop_name;

                return (
                  <div className="col-md-6" key={crop.crop_name}>
                    <div
                      className={`card h-100 shadow-sm ${borderClass}`}
                      style={{
                        backgroundColor: bgColor,
                        cursor: "pointer",
                        transition: "transform 0.15s ease, box-shadow 0.15s",
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
                              <span className="badge bg-success">
                                Primary
                              </span>
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

                        {/* Compact info */}
                        <div className="small text-muted mb-1">
                          <FaRupeeSign className="me-1" />
                          <span>{crop.price_forecasted}</span>
                        </div>
                        <div className="small mb-1">
                          <span className="fw-semibold">Demand: </span>
                          {crop.demand}
                        </div>

                        {/* Expand/collapse trigger */}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success mt-1"
                          onClick={(e) => {
                            e.stopPropagation(); // don't toggle selection
                            setExpandedCropName((prev) =>
                              prev === crop.crop_name ? null : crop.crop_name
                            );
                          }}
                        >
                          {expanded ? "Hide details" : "View details"}
                        </button>

                        {/* Expanded details */}
                        {expanded && (
                          <div className="mt-2 small border-top pt-2">
                            <div className="mb-1">
                              <span className="fw-semibold">Breed: </span>
                              {crop.breed}
                            </div>
                            <div className="mb-1">
                              <span className="fw-semibold">
                                Suitable weather:{" "}
                              </span>
                              {crop.suitable_weather}
                            </div>
                            <div className="mb-1 d-flex align-items-start">
                              <FaBug className="me-1 mt-1" />
                              <span>
                                <span className="fw-semibold">
                                  Pest info:{" "}
                                </span>
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
                                        {s.description && (
                                          <span> – {s.description}</span>
                                        )}
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
              <button className="btn btn-success fw-semibold" onClick={onConfirm}>
                Confirm crops & view final JSON
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* --- STEP 4: FINAL JSON --- */
const StepFinalJSON = ({ finalResult, onStartOver }) => (
  <div className="card shadow-sm border-0">
    <div className="card-header bg-success bg-gradient text-white d-flex align-items-center">
      <FaTractor className="me-2" />
      <div>
        <div className="fw-semibold">Step 4: Final advisory JSON</div>
        <small>
          This includes payload, all crops, and your primary/secondary choices.
        </small>
      </div>
    </div>
    <div className="card-body">
      <pre
        className="small bg-dark text-success p-3 rounded"
        style={{
          maxHeight: "340px",
          overflowY: "auto",
          fontSize: "0.78rem",
        }}
      >
        {JSON.stringify(finalResult, null, 2)}
      </pre>
    </div>
    <div className="card-footer d-flex justify-content-between align-items-center bg-light">
      <span className="small text-muted">
        You can now store this result or send it to another API.
      </span>
      <button
        type="button"
        className="btn btn-outline-success btn-sm"
        onClick={onStartOver}
      >
        Start again
      </button>
    </div>
  </div>
);

/* --- Shared helpers --- */
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
    <div className="text-uppercase text-muted fw-semibold small">
      {label}
    </div>
    <div className="fw-semibold">{value ?? "—"}</div>
  </div>
);

export default PlanCropsAdvisory;
