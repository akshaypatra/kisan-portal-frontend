// Components/SellCrops-component/SellCropsPage.jsx

import React, { useEffect, useMemo, useState } from "react";
import { FaRupeeSign, FaChartLine, FaInfoCircle } from "react-icons/fa";

const API_BASE = "http://127.0.0.1:8000/api/crop-listing";
const ADVISORY_URL = "http://127.0.0.1:8000/api/advisory/oilseed/advisory";

// Oilseed options for dropdown
const OILSEED_CROPS = [
  "Groundnut",
  "Soybean",
  "Rapeseed-Mustard",
  "Sunflower",
  "Sesame (Til)",
  "Safflower",
  "Niger Seed",
  "Castor",
  "Linseed",
  "Oil Palm",
];

const SellCropsPage = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: "",
    quantityKg: "",   // quantity in KG (baseline 100kg = 1 quintal)
    pickupDate: "",
    pickupTime: "",
    location: "",
    demandedPrice: "",
  });

  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Editing listing
  const [editingListingId, setEditingListingId] = useState(null);
  const [editForm, setEditForm] = useState({
    demandedPrice: "",
    cropQuantity: "",
    status: "",
  });
  const [updatingListing, setUpdatingListing] = useState(false);
  const [deletingListingId, setDeletingListingId] = useState(null);

  // Offers per listing
  const [offersByListing, setOffersByListing] = useState({});
  const [offersLoadingId, setOffersLoadingId] = useState(null);
  const [offerActionLoadingId, setOfferActionLoadingId] = useState(null);

  // Deals
  const [farmerDeals, setFarmerDeals] = useState([]);
  const [loadingDeals, setLoadingDeals] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedDealLoading, setSelectedDealLoading] = useState(false);

  // Advisory (price prediction)
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [advisoryData, setAdvisoryData] = useState(null);
  const [advisoryError, setAdvisoryError] = useState("");

  const [error, setError] = useState("");

  // Load user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored) {
        const parsed = JSON.parse(stored);
        setCurrentUser(parsed);
      }
    } catch (err) {
      console.error("Failed to parse user from localStorage", err);
    }
  }, []);

  const farmerId = currentUser?.id || null;
  const farmerName = currentUser?.name || "Farmer";
  const contactDetails =
    currentUser?.mobile || currentUser?.phone || currentUser?.email || "";

  // Split profile location: "Nashik, Maharashtra"
  const [regionFromUserLocation, stateFromUserLocation] = useMemo(() => {
    if (!currentUser?.location) return ["", ""];
    const parts = currentUser.location.split(",").map((p) => p.trim());
    return [parts[0] || "", parts[1] || ""];
  }, [currentUser]);

  // Pre-fill location field from profile location on first load
  useEffect(() => {
    if (currentUser && !formData.location) {
      setFormData((prev) => ({
        ...prev,
        location: currentUser.location || "",
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // Map listing_id → listing
  const listingsById = useMemo(() => {
    const map = {};
    myListings.forEach((l) => {
      map[l.id] = l;
    });
    return map;
  }, [myListings]);

  // listing for selected deal (for nicer UI)
  const listingForSelectedDeal = selectedDeal
    ? listingsById[selectedDeal.listing_id]
    : null;

  // Fetch farmer listings & deals when user is ready
  useEffect(() => {
    if (!farmerId) return;

    const fetchListings = async () => {
      try {
        setLoadingListings(true);
        const res = await fetch(`${API_BASE}/farmers/${farmerId}/listings`);
        if (!res.ok) throw new Error("Failed to load listings");
        const data = await res.json();
        setMyListings(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your crop listings right now.");
      } finally {
        setLoadingListings(false);
      }
    };

    const fetchDeals = async () => {
      try {
        setLoadingDeals(true);
        const res = await fetch(`${API_BASE}/farmers/${farmerId}/deals`);
        if (!res.ok) throw new Error("Failed to load deals");
        const data = await res.json();
        setFarmerDeals(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your deals right now.");
      } finally {
        setLoadingDeals(false);
      }
    };

    fetchListings();
    fetchDeals();
  }, [farmerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper: derive region from typed location (use text before first comma)
  const getRegionFromLocation = (location) => {
    if (!location) return regionFromUserLocation || "";
    const parts = location.split(",").map((p) => p.trim());
    return parts[0] || regionFromUserLocation || "";
  };

  // ---- Date/time helpers (no past date/time) ----
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  const minPickupTime = useMemo(() => {
    if (!formData.pickupDate) return "";
    if (formData.pickupDate !== todayStr) return "";
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  }, [formData.pickupDate, todayStr]);

  // ---- ADVISORY: Predict estimated price ----
  const handlePredictAdvisory = async () => {
    setAdvisoryError("");
    setAdvisoryData(null);

    if (!formData.cropName || !formData.quantityKg) {
      setAdvisoryError("कृपया पिकाचे नाव आणि एकूण वजन (किलो) भरा.");
      return;
    }

    const qtyKg = parseFloat(formData.quantityKg) || 0;
    if (qtyKg <= 0) {
      setAdvisoryError("प्रमाण (किलो) 0 पेक्षा जास्त असावे.");
      return;
    }

    const quantityQtl = qtyKg / 100; // convert KG → Quintal

    const payload = {
      crop: formData.cropName,
      state: stateFromUserLocation || "Maharashtra",
      region: getRegionFromLocation(formData.location) || regionFromUserLocation,
      quantity_quintal: quantityQtl,
    };

    try {
      setAdvisoryLoading(true);
      const res = await fetch(ADVISORY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch advisory");
      }

      const data = await res.json();
      setAdvisoryData(data);
    } catch (err) {
      console.error(err);
      setAdvisoryError(
        "सध्या अंदाजित दर मिळवण्यात अडचण येत आहे. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा."
      );
    } finally {
      setAdvisoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!farmerId || !contactDetails) {
      setError("User details not found. Please login again.");
      return;
    }

    // ---- Validate no past date/time ----
    if (formData.pickupDate) {
      try {
        const [y, m, d] = formData.pickupDate.split("-").map(Number);
        const selectedDate = new Date(y, m - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
          setError("Pickup date cannot be in the past.");
          return;
        }

        if (formData.pickupTime) {
          const [hh, mm] = formData.pickupTime.split(":").map(Number);
          const selectedDateTime = new Date(y, m - 1, d, hh, mm);
          const now = new Date();
          if (selectedDateTime < now) {
            setError("Pickup time cannot be in the past.");
            return;
          }
        }
      } catch (err) {
        console.error("Invalid date/time", err);
        setError("Please enter a valid pickup date and time.");
        return;
      }
    }

    const qtyKg = parseFloat(formData.quantityKg) || 0;
    if (qtyKg <= 0) {
      setError("Quantity in kg must be greater than 0.");
      return;
    }
    const quantityQtl = qtyKg / 100; // convert KG → Quintal

    setSubmitting(true);

    try {
      const payload = {
        farmer_id: farmerId,
        farmer_name: farmerName,
        contact_details: contactDetails,
        state: stateFromUserLocation || "Maharashtra",
        region: getRegionFromLocation(formData.location),
        crop_name: formData.cropName,
        crop_grade: "A Grade", // default
        crop_quantity: quantityQtl, // backend expects quintals
        demanded_price: parseFloat(formData.demandedPrice) || 0, // ₹/qtl
        msp_price: advisoryData?.msp_per_quintal || null,
      };

      const res = await fetch(`${API_BASE}/sell-crop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to create listing");
      }

      const created = await res.json();
      setMyListings((prev) => [created, ...prev]);

      setFormData({
        cropName: "",
        quantityKg: "",
        pickupDate: "",
        pickupTime: "",
        location: currentUser?.location || "",
        demandedPrice: "",
      });
      setAdvisoryData(null);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      setError("Could not publish your listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ---- EDIT LISTING ----
  const startEditListing = (listing) => {
    setEditingListingId(listing.id);
    setEditForm({
      demandedPrice: listing.demanded_price || "",
      cropQuantity: listing.crop_quantity || "",
      status: listing.status || "OPEN",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitEditListing = async (e) => {
    e.preventDefault();
    if (!editingListingId) return;
    setUpdatingListing(true);
    setError("");

    try {
      const payload = {
        demanded_price:
          editForm.demandedPrice !== ""
            ? parseFloat(editForm.demandedPrice)
            : undefined,
        crop_quantity:
          editForm.cropQuantity !== ""
            ? parseFloat(editForm.cropQuantity)
            : undefined,
        status: editForm.status || undefined,
      };

      const res = await fetch(`${API_BASE}/listings/${editingListingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to update listing");

      const updated = await res.json();
      setMyListings((prev) =>
        prev.map((l) => (l.id === updated.id ? updated : l))
      );
      setEditingListingId(null);
    } catch (err) {
      console.error(err);
      setError("Unable to update listing. Please try again.");
    } finally {
      setUpdatingListing(false);
    }
  };

  // ---- DELETE LISTING ----
  const deleteListing = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    setDeletingListingId(listingId);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/listings/${listingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete listing");
      setMyListings((prev) => prev.filter((l) => l.id !== listingId));
      setOffersByListing((prev) => {
        const copy = { ...prev };
        delete copy[listingId];
        return copy;
      });
    } catch (err) {
      console.error(err);
      setError("Unable to delete listing. Please try again.");
    } finally {
      setDeletingListingId(null);
    }
  };

  // ---- OFFERS FOR LISTING ----
  const loadOffersForListing = async (listingId) => {
    setOffersLoadingId(listingId);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/listings/${listingId}/offers`);
      if (!res.ok) throw new Error("Failed to load offers for this listing");
      const data = await res.json();
      setOffersByListing((prev) => ({
        ...prev,
        [listingId]: data,
      }));
    } catch (err) {
      console.error(err);
      setError("Unable to load offers from buyers right now.");
    } finally {
      setOffersLoadingId(null);
    }
  };

  // ---- RESPOND TO OFFER ----
  const handleOfferAction = async (listingId, offerId, actionLabel) => {
    setOfferActionLoadingId(offerId);
    setError("");

    const action = actionLabel === "ACCEPT" ? "ACCEPT" : "REJECT";

    try {
      const res = await fetch(`${API_BASE}/offers/${offerId}/respond`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Failed to update offer");

      const updatedOffer = await res.json();

      setOffersByListing((prev) => {
        const offers = prev[listingId] || [];
        return {
          ...prev,
          [listingId]: offers.map((o) =>
            o.id === updatedOffer.id ? updatedOffer : o
          ),
        };
      });

      const listingRes = await fetch(`${API_BASE}/listings/${listingId}`);
      if (listingRes.ok) {
        const updatedListing = await listingRes.json();
        setMyListings((prev) =>
          prev.map((l) => (l.id === updatedListing.id ? updatedListing : l))
        );
      }
    } catch (err) {
      console.error(err);
      setError("Could not update offer. Please try again.");
    } finally {
      setOfferActionLoadingId(null);
    }
  };

  // ---- DEALS ----
  const openDealDetails = async (deal) => {
    setSelectedDealLoading(true);
    setSelectedDeal(null);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/deals/${deal.id}`);
      if (!res.ok) throw new Error("Failed to load deal details");
      const data = await res.json();
      setSelectedDeal(data);
    } catch (err) {
      console.error(err);
      setError("Could not load deal details.");
    } finally {
      setSelectedDealLoading(false);
    }
  };

  const closeDealDetails = () => {
    setSelectedDeal(null);
  };

  if (!currentUser) {
    return (
      <div className="container py-4">
        <p className="text-muted">
          Loading your profile… Please ensure you are logged in.
        </p>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ fontSize: "1.05rem" }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-success mb-1 fs-3">Sell Crops</h2>
          <p className="mb-1">
            <strong>Welcome, {farmerName}</strong>
          </p>
          <p className="text-muted mb-2 fs-6">
            List your oilseed crops, get an AI-based price suggestion, and
            manage offers and deals in one place.
          </p>
          <p className="text-muted small mb-3">
            <strong>Your location:</strong>{" "}
            {currentUser.location || "Not set in profile"}
          </p>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge rounded-pill text-bg-success p-2 px-3">
              {myListings.length} Listings
            </span>
            <span className="badge rounded-pill text-bg-primary p-2 px-3">
              {farmerDeals.length} Deals
            </span>
            <span className="badge rounded-pill text-bg-warning p-2 px-3">
              AI Price Advisory Enabled
            </span>
          </div>
          {error && (
            <div className="alert alert-danger mt-3 py-2 mb-0">
              <small>{error}</small>
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn btn-success rounded-pill px-4 py-2 fs-6"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? "Close Listing Form" : "New Listing"}
        </button>
      </div>

      <div className="row g-4">
        {/* New Listing + Form */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100 bg-success-subtle">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold fs-6">New Oilseed Listing</span>
              <button
                type="button"
                className="btn btn-sm btn-light rounded-pill"
                onClick={() => setShowForm((prev) => !prev)}
              >
                {showForm ? "Hide" : "New"}
              </button>
            </div>
            <div className="card-body">
              {!showForm && (
                <p className="text-muted mb-0">
                  Click <strong>New Listing</strong> to add oilseed crop details
                  like quantity, expected price and pickup time.
                </p>
              )}

              {showForm && (
                <>
                  {/* Advisory Card */}
                  {advisoryData && (
                    <div className="mb-3 p-3 rounded-3 bg-white shadow-sm border border-success-subtle">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <FaChartLine className="text-success" />
                          <span className="fw-semibold">
                            Estimated Price Advisory
                          </span>
                        </div>
                        <span
                          className={
                            "badge rounded-pill px-3 py-1 " +
                            (advisoryData.is_profit
                              ? "text-bg-success"
                              : "text-bg-danger")
                          }
                        >
                          {advisoryData.is_profit ? "Profit" : "Loss"}
                        </span>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <div className="small text-muted">MSP (₹/qtl)</div>
                          <div className="fw-semibold d-flex align-items-center gap-1">
                            <FaRupeeSign />
                            {advisoryData.msp_per_quintal}
                          </div>
                          <div className="small text-muted">
                            Total MSP: ₹{advisoryData.total_msp}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="small text-muted">
                            Market Price (₹/qtl)
                          </div>
                          <div className="fw-semibold d-flex align-items-center gap-1">
                            <FaRupeeSign />
                            {advisoryData.market_price_per_quintal}
                          </div>
                          <div className="small text-muted">
                            Total Market: ₹{advisoryData.total_market_price}
                          </div>
                        </div>
                      </div>

                      <div className="row g-2 mb-2">
                        <div className="col-6">
                          <div className="small text-muted">
                            Recommended Price (₹/qtl)
                          </div>
                          <div className="fw-semibold d-flex align-items-center gap-1 text-success">
                            <FaRupeeSign />
                            {
                              advisoryData
                                .recommended_selling_price_per_quintal
                            }
                          </div>
                          <div className="small text-muted">
                            Recommended Total: ₹
                            {advisoryData.recommended_total_revenue}
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="small text-muted">
                            Profit / Loss
                          </div>
                          <div
                            className={
                              "fw-semibold " +
                              (advisoryData.is_profit
                                ? "text-success"
                                : "text-danger")
                            }
                          >
                            ₹{advisoryData.profit_or_loss_per_quintal} / qtl
                          </div>
                          <div
                            className={
                              "small " +
                              (advisoryData.is_profit
                                ? "text-success"
                                : "text-danger")
                            }
                          >
                            Total: ₹{advisoryData.total_profit_or_loss}
                          </div>
                        </div>
                      </div>

                      <div className="small text-muted mb-1">
                        For {advisoryData.quantity_quintal} qtl in{" "}
                        {advisoryData.region}, {advisoryData.state}
                      </div>

                      <div className="d-flex align-items-start gap-2 mt-1">
                        <FaInfoCircle className="text-info mt-1" />
                        <p className="mb-0 small">
                          {advisoryData.advisory_note}
                        </p>
                      </div>
                    </div>
                  )}

                  {advisoryError && (
                    <div className="alert alert-warning py-2">
                      <small>{advisoryError}</small>
                    </div>
                  )}

                  <form className="mt-2" onSubmit={handleSubmit}>
                    {/* Crop Name as oilseed dropdown */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Oilseed Crop
                      </label>
                      <select
                        className="form-select"
                        name="cropName"
                        value={formData.cropName}
                        onChange={(e) => {
                          setAdvisoryData(null);
                          handleChange(e);
                        }}
                        required
                      >
                        <option value="">Select oilseed</option>
                        {OILSEED_CROPS.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity in KG (baseline 100kg = 1 qtl) */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Quantity (in <u>kilograms</u>)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="form-control"
                        name="quantityKg"
                        value={formData.quantityKg}
                        onChange={(e) => {
                          setAdvisoryData(null);
                          handleChange(e);
                        }}
                        placeholder="e.g., 100 (for 1 quintal)"
                        required
                      />
                      <div className="form-text">
                        Baseline: <strong>100 kg = 1 quintal</strong>. We will
                        automatically convert this into quintals for
                        calculations and listing.
                      </div>
                    </div>

                    {/* Expected price + Predict button */}
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label fw-semibold mb-0">
                          Expected Price (₹ per quintal)
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success rounded-pill d-flex align-items-center gap-1"
                          onClick={handlePredictAdvisory}
                          disabled={advisoryLoading}
                        >
                          <FaChartLine />
                          {advisoryLoading
                            ? "Predicting..."
                            : "Predict estimated price"}
                        </button>
                      </div>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        name="demandedPrice"
                        value={formData.demandedPrice}
                        onChange={handleChange}
                        placeholder="e.g., 4900"
                        required
                      />
                      <div className="form-text">
                        You can use the AI suggestion above or set your own
                        expected price.
                      </div>
                    </div>

                    {/* Preferred pickup date & time */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Preferred Pickup Date
                      </label>
                      <input
                        type="date"
                        className="form-control"
                        name="pickupDate"
                        value={formData.pickupDate}
                        onChange={handleChange}
                        min={todayStr}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Preferred Pickup Time
                      </label>
                      <input
                        type="time"
                        className="form-control"
                        name="pickupTime"
                        value={formData.pickupTime}
                        onChange={handleChange}
                        min={minPickupTime || undefined}
                      />
                      <div className="form-text">
                        This helps buyers plan logistics. (Not saved in backend
                        yet, can be added later.)
                      </div>
                    </div>

                    {/* Location pre-filled from profile but editable */}
                    <div className="mb-3">
                      <label className="form-label fw-semibold">
                        Location (Village / Taluka / District)
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="location"
                        value={formData.location}
                        onChange={(e) => {
                          setAdvisoryData(null);
                          handleChange(e);
                        }}
                        placeholder="Village, Taluka, District"
                      />
                      <div className="form-text">
                        Pre-filled from your profile:{" "}
                        <strong>{currentUser.location || "not set"}</strong>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setShowForm(false);
                          setAdvisoryData(null);
                        }}
                        disabled={submitting}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-warning text-dark fw-semibold rounded-pill px-3"
                        disabled={submitting}
                      >
                        {submitting ? "Publishing..." : "Publish Listing"}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>

        {/* My Crop Listings + Offers */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100 bg-light">
            <div className="card-header bg-white border-0 border-bottom border-success-subtle d-flex justify-content-between">
              <h6 className="mb-0 fw-semibold fs-5 text-success">
                My Oilseed Listings
              </h6>
            </div>
            <div className="card-body">
              {loadingListings && (
                <p className="text-muted">Loading your listings...</p>
              )}

              {!loadingListings && myListings.length === 0 && (
                <p className="text-muted mb-0">
                  No active listings yet. Create your first listing from the
                  left card.
                </p>
              )}

              {myListings.map((listing) => {
                const offersForThis = offersByListing[listing.id] || [];
                return (
                  <div
                    key={listing.id}
                    className="p-3 mb-3 bg-white rounded-3 shadow-sm border-start border-4 border-success"
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <div className="fw-semibold fs-6">
                          {listing.crop_name}
                        </div>
                        <div className="small text-muted">
                          {listing.region}, {listing.state}
                        </div>
                      </div>
                      <div className="text-end">
                        <span className="badge rounded-pill text-bg-success">
                          {listing.crop_quantity} qtl
                        </span>
                        <div className="small text-muted">
                          ₹{listing.demanded_price} / qtl
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between small text-muted mt-1">
                      <span>Grade: {listing.crop_grade}</span>
                      <span>
                        Status:{" "}
                        <span
                          className={
                            "badge " +
                            (listing.status === "OPEN"
                              ? "text-bg-success"
                              : listing.status === "PARTIALLY_SOLD"
                              ? "text-bg-warning text-dark"
                              : "text-bg-secondary")
                          }
                        >
                          {listing.status.replace("_", " ")}
                        </span>
                      </span>
                    </div>

                    {/* Edit + Delete + Load Offers */}
                    <div className="mt-3 d-flex flex-wrap gap-2">
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => startEditListing(listing)}
                      >
                        Edit Listing
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => deleteListing(listing.id)}
                        disabled={deletingListingId === listing.id}
                      >
                        {deletingListingId === listing.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => loadOffersForListing(listing.id)}
                        disabled={offersLoadingId === listing.id}
                      >
                        {offersLoadingId === listing.id
                          ? "Loading offers..."
                          : `View Buyer Offers (${offersForThis.length})`}
                      </button>
                    </div>

                    {/* Inline edit form */}
                    {editingListingId === listing.id && (
                      <form
                        className="mt-3 border-top pt-3"
                        onSubmit={submitEditListing}
                      >
                        <div className="row g-2">
                          <div className="col-4">
                            <label className="form-label small mb-1">
                              New Price (₹/qtl)
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              name="demandedPrice"
                              value={editForm.demandedPrice}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div className="col-4">
                            <label className="form-label small mb-1">
                              Quantity (qtl)
                            </label>
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              name="cropQuantity"
                              value={editForm.cropQuantity}
                              onChange={handleEditChange}
                            />
                          </div>
                          <div className="col-4">
                            <label className="form-label small mb-1">
                              Status
                            </label>
                            <select
                              name="status"
                              className="form-select form-select-sm"
                              value={editForm.status}
                              onChange={handleEditChange}
                            >
                              <option value="OPEN">Open</option>
                              <option value="PARTIALLY_SOLD">
                                Partially Sold
                              </option>
                              <option value="CLOSED">Closed</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          </div>
                        </div>
                        <div className="mt-2 d-flex justify-content-end gap-2">
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => setEditingListingId(null)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-sm btn-success"
                            disabled={updatingListing}
                          >
                            {updatingListing ? "Saving..." : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Offers for this listing */}
                    {offersByListing[listing.id] && (
                      <div className="mt-3 border-top pt-2">
                        <div className="small fw-semibold mb-1">
                          Buyer Offers ({offersForThis.length})
                        </div>
                        {offersForThis.length === 0 && (
                          <div className="small text-muted">
                            No offers yet for this listing.
                          </div>
                        )}
                        {offersForThis.map((offer) => {
                          const total =
                            offer.offered_price * offer.offered_quantity;
                          return (
                            <div
                              key={offer.id}
                              className="p-2 mb-2 rounded border bg-light small"
                            >
                              <div className="d-flex justify-content-between">
                                <div>
                                  <div className="fw-semibold">
                                    Buyer #{offer.stakeholder_id}
                                  </div>
                                  <div className="text-muted">
                                    <strong>Offer:</strong> ₹
                                    {offer.offered_price} / qtl for{" "}
                                    {offer.offered_quantity} qtl
                                  </div>
                                  <div className="text-muted">
                                    <strong>Total value:</strong> ₹
                                    {total.toFixed(2)}
                                  </div>
                                  {offer.message && (
                                    <div className="fst-italic mt-1">
                                      “{offer.message}”
                                    </div>
                                  )}
                                </div>
                                <div className="text-end">
                                  <span
                                    className={
                                      "badge mb-2 " +
                                      (offer.status === "ACCEPTED"
                                        ? "text-bg-success"
                                        : offer.status === "REJECTED"
                                        ? "text-bg-danger"
                                        : "text-bg-warning text-dark")
                                    }
                                  >
                                    {offer.status}
                                  </span>
                                  {offer.status === "PENDING" && (
                                    <div className="d-flex flex-column gap-1">
                                      <button
                                        className="btn btn-sm btn-outline-success"
                                        onClick={() =>
                                          handleOfferAction(
                                            listing.id,
                                            offer.id,
                                            "ACCEPT"
                                          )
                                        }
                                        disabled={
                                          offerActionLoadingId === offer.id
                                        }
                                      >
                                        Accept Offer
                                      </button>
                                      <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() =>
                                          handleOfferAction(
                                            listing.id,
                                            offer.id,
                                            "REJECT"
                                          )
                                        }
                                        disabled={
                                          offerActionLoadingId === offer.id
                                        }
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Deals section */}
        <div className="col-12 col-lg-3">
          <div className="card border-0 shadow-sm h-100 bg-light">
            <div className="card-header bg-white border-0 border-bottom border-success-subtle">
              <h6 className="mb-0 fw-semibold fs-5 text-success">Closed Deals</h6>
            </div>
            <div className="card-body">
              {loadingDeals && (
                <p className="text-muted">Loading your deals...</p>
              )}

              {!loadingDeals && farmerDeals.length === 0 && (
                <p className="text-muted mb-0">
                  No deals yet. Once you accept offers, confirmed deals will
                  appear here.
                </p>
              )}

              {!loadingDeals &&
                farmerDeals.map((deal) => {
                  const listing = listingsById[deal.listing_id];
                  const total = deal.quantity * deal.agreed_price;
                  return (
                    <div
                      key={deal.id}
                      className="p-2 mb-2 bg-white rounded border small d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">
                          {listing
                            ? listing.crop_name
                            : "Listing #" + deal.listing_id}
                        </div>
                        <div className="text-muted">
                          {listing && (
                            <>
                              {listing.region}, {listing.state} •{" "}
                            </>
                          )}
                          {deal.quantity} qtl @ ₹{deal.agreed_price}/qtl
                        </div>
                        <div className="text-muted">
                          <strong>Total:</strong> ₹{total.toFixed(2)}
                        </div>
                      </div>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => openDealDetails(deal)}
                      >
                        View Deal Summary
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Deal details modal – nicer, more meaningful */}
      {selectedDeal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          style={{ zIndex: 1050 }}
        >
          <div
            className="bg-white rounded shadow-lg p-4"
            style={{ width: "520px", maxWidth: "95%" }}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h5 className="text-success mb-1">
                  Deal Summary – #{selectedDeal.id}
                </h5>
                <small className="text-muted">
                  Confirmed sale details for your crop
                </small>
              </div>
              <span className="badge text-bg-success rounded-pill px-3 py-2">
                Closed Deal
              </span>
            </div>

            {selectedDealLoading ? (
              <p className="text-muted">Loading...</p>
            ) : (
              <>
                <div className="mb-3 p-2 rounded bg-success-subtle">
                  <div className="fw-semibold">
                    {listingForSelectedDeal
                      ? listingForSelectedDeal.crop_name
                      : `Listing #${selectedDeal.listing_id}`}
                  </div>
                  {listingForSelectedDeal && (
                    <div className="small text-muted">
                      {listingForSelectedDeal.region},{" "}
                      {listingForSelectedDeal.state}
                    </div>
                  )}
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <div className="small text-muted">Quantity Sold</div>
                    <div className="fw-semibold">
                      {selectedDeal.quantity} qtl
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Agreed Price</div>
                    <div className="fw-semibold">
                      ₹{selectedDeal.agreed_price} / qtl
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Total Deal Value</div>
                    <div className="fw-semibold">
                      ₹
                      {(
                        selectedDeal.quantity * selectedDeal.agreed_price
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Buyer</div>
                    <div className="fw-semibold">
                      Buyer ID #{selectedDeal.buyer_id}
                    </div>
                    <div className="small text-muted">
                      Contact will be managed through platform / phone.
                    </div>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="small text-muted mb-1">
                  Deal Reference IDs (for support):
                </div>
                <ul className="small mb-0">
                  <li>Deal ID: #{selectedDeal.id}</li>
                  <li>Listing ID: #{selectedDeal.listing_id}</li>
                  <li>Buyer ID: #{selectedDeal.buyer_id}</li>
                </ul>
              </>
            )}

            <div className="d-flex justify-content-end mt-3">
              <button
                className="btn btn-secondary rounded-pill px-3"
                onClick={closeDealDetails}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellCropsPage;
