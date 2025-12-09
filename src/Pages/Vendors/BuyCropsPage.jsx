// Components/BuyCrops-component/BuyCropsPage.jsx

import React, { useEffect, useMemo, useState } from "react";

const API_BASE = "http://127.0.0.1:8000/api/crop-listing";

const BuyCropsPage = () => {
  const [currentUser, setCurrentUser] = useState(null);

  const [viewMode, setViewMode] = useState("OPEN"); // OPEN => /buy_crop, ALL => /listings
  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(false);

  const [filters, setFilters] = useState({
    cropName: "",
    location: "",
    quality: "",
    minQuantity: "",
    maxPrice: "",
  });

  const [selectedListing, setSelectedListing] = useState(null);
  const [loadingListingDetail, setLoadingListingDetail] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [offerForm, setOfferForm] = useState({
    price: "",
    quantity: "",
    message: "",
  });
  const [sendingOffer, setSendingOffer] = useState(false);
  const [offerSuccess, setOfferSuccess] = useState("");

  const [myOffers, setMyOffers] = useState([]);
  const [loadingMyOffers, setLoadingMyOffers] = useState(false);
  const [selectedOfferDetail, setSelectedOfferDetail] = useState(null);
  const [loadingOfferDetail, setLoadingOfferDetail] = useState(false);
  const [deletingOfferId, setDeletingOfferId] = useState(null);

  const [myDeals, setMyDeals] = useState([]);
  const [loadingMyDeals, setLoadingMyDeals] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loadingDealDetail, setLoadingDealDetail] = useState(false);

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

  const stakeholderId = currentUser?.id || null;
  const stakeholderName = currentUser?.name || "Buyer";

  // Fetch crops according to viewMode
  const fetchCrops = async (mode) => {
    setLoadingCrops(true);
    setError("");
    try {
      let url;
      if (mode === "OPEN") {
        url = `${API_BASE}/buy_crop`;
      } else {
        url = `${API_BASE}/listings`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch crop listings");
      const data = await res.json();
      setCrops(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load crop listings. Please try again.");
    } finally {
      setLoadingCrops(false);
    }
  };

  // Initial + view mode change
  useEffect(() => {
    fetchCrops(viewMode);
  }, [viewMode]);

  // Fetch offers & deals by stakeholder
  useEffect(() => {
    if (!stakeholderId) return;

    const fetchMyOffers = async () => {
      try {
        setLoadingMyOffers(true);
        const res = await fetch(
          `${API_BASE}/stakeholders/${stakeholderId}/offers`
        );
        if (!res.ok) throw new Error("Failed to load your offers");
        const data = await res.json();
        setMyOffers(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your offers.");
      } finally {
        setLoadingMyOffers(false);
      }
    };

    const fetchMyDeals = async () => {
      try {
        setLoadingMyDeals(true);
        const res = await fetch(
          `${API_BASE}/stakeholders/${stakeholderId}/deals`
        );
        if (!res.ok) throw new Error("Failed to load your deals");
        const data = await res.json();
        setMyDeals(data);
      } catch (err) {
        console.error(err);
        setError("Unable to load your deals.");
      } finally {
        setLoadingMyDeals(false);
      }
    };

    fetchMyOffers();
    fetchMyDeals();
  }, [stakeholderId]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const clearFilters = () => {
    setFilters({
      cropName: "",
      location: "",
      quality: "",
      minQuantity: "",
      maxPrice: "",
    });
  };

  const filteredCrops = useMemo(() => {
    return crops.filter((crop) => {
      const cropName = crop.crop_name || "";
      const location = `${crop.region || ""}, ${crop.state || ""}`;
      const quality = crop.crop_grade || "";
      const price = crop.demanded_price || 0;
      const quantity = crop.crop_quantity || 0;

      return (
        (filters.cropName
          ? cropName.toLowerCase().includes(filters.cropName.toLowerCase())
          : true) &&
        (filters.location
          ? location.toLowerCase().includes(filters.location.toLowerCase())
          : true) &&
        (filters.quality ? quality === filters.quality : true) &&
        (filters.minQuantity
          ? quantity >= Number(filters.minQuantity)
          : true) &&
        (filters.maxPrice ? price <= Number(filters.maxPrice) : true)
      );
    });
  }, [crops, filters]);

  const openListingModal = async (listing) => {
    setSelectedListing(listing);
    setShowModal(true);
    setOfferForm({ price: "", quantity: "", message: "" });
    setOfferSuccess("");

    // Refresh listing details from backend (GET /listings/{id})
    try {
      setLoadingListingDetail(true);
      const res = await fetch(`${API_BASE}/listings/${listing.id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedListing(data);
      }
    } catch (err) {
      console.error("Failed to refresh listing details", err);
    } finally {
      setLoadingListingDetail(false);
    }
  };

  const closeModal = () => {
    setSelectedListing(null);
    setShowModal(false);
    setOfferSuccess("");
  };

  const handleOfferFormChange = (e) => {
    const { name, value } = e.target;
    setOfferForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitOffer = async (e) => {
    e.preventDefault();
    if (!selectedListing) return;

    if (!stakeholderId) {
      setError("User details not found. Please login again.");
      return;
    }

    setSendingOffer(true);
    setError("");
    setOfferSuccess("");

    try {
      const payload = {
        listing_id: selectedListing.id,
        stakeholder_id: stakeholderId,
        offered_price: parseFloat(offerForm.price) || 0,
        offered_quantity: parseFloat(offerForm.quantity) || 0,
        message: offerForm.message || null,
      };

      const res = await fetch(
        `${API_BASE}/listings/${selectedListing.id}/offers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to send offer");

      setOfferSuccess("Offer sent to farmer successfully!");

      // Refresh "My Offers" section
      if (stakeholderId) {
        const offersRes = await fetch(
          `${API_BASE}/stakeholders/${stakeholderId}/offers`
        );
        if (offersRes.ok) {
          const offersData = await offersRes.json();
          setMyOffers(offersData);
        }
      }

      setOfferForm({ price: "", quantity: "", message: "" });
    } catch (err) {
      console.error(err);
      setError("Could not send your offer. Please try again.");
    } finally {
      setSendingOffer(false);
    }
  };

  // ---- MY OFFERS ----
  const viewOfferDetails = async (offer) => {
    setSelectedOfferDetail(null);
    setLoadingOfferDetail(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/offers/${offer.id}`);
      if (!res.ok) throw new Error("Failed to get offer");
      const data = await res.json();
      setSelectedOfferDetail(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load offer details.");
    } finally {
      setLoadingOfferDetail(false);
    }
  };

  const cancelOffer = async (offerId) => {
    if (!window.confirm("Are you sure you want to delete/cancel this offer?")) {
      return;
    }

    setDeletingOfferId(offerId);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/offers/${offerId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete offer");
      setMyOffers((prev) => prev.filter((o) => o.id !== offerId));
      if (selectedOfferDetail && selectedOfferDetail.id === offerId) {
        setSelectedOfferDetail(null);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to delete offer.");
    } finally {
      setDeletingOfferId(null);
    }
  };

  // ---- MY DEALS ----
  const openDealDetails = async (deal) => {
    setSelectedDeal(null);
    setLoadingDealDetail(true);
    setError("");

    try {
      const res = await fetch(`${API_BASE}/deals/${deal.id}`);
      if (!res.ok) throw new Error("Failed to load deal details");
      const data = await res.json();
      setSelectedDeal(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load deal details.");
    } finally {
      setLoadingDealDetail(false);
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
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-3">
        <div>
          <h2 className="fw-bold text-success fs-2 mb-1">Buy Crops</h2>
          <p className="mb-1">
            <strong>Welcome, {stakeholderName}</strong>
          </p>
          <p className="text-muted fs-6">
            Browse oilseed listings, place offers to farmers, and track your
            offers & deals.
          </p>
        </div>

        <div className="btn-group" role="group">
          <button
            type="button"
            className={
              "btn btn-sm " +
              (viewMode === "OPEN" ? "btn-success" : "btn-outline-success")
            }
            onClick={() => setViewMode("OPEN")}
          >
            Open Listings
          </button>
          <button
            type="button"
            className={
              "btn btn-sm " +
              (viewMode === "ALL" ? "btn-success" : "btn-outline-success")
            }
            onClick={() => setViewMode("ALL")}
          >
            All Listings
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2">
          <small>{error}</small>
        </div>
      )}

      {/* FILTER PANEL */}
      <div className="card shadow-sm border-0 mb-4 bg-success-subtle">
        <div className="card-header bg-success text-white d-flex justify-content-between">
          <strong>Filters</strong>
          <button
            className="btn btn-light btn-sm rounded-pill"
            onClick={clearFilters}
          >
            Clear
          </button>
        </div>

        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label fw-semibold">Crop Name</label>
              <input
                type="text"
                name="cropName"
                className="form-control"
                placeholder="Soybean, Groundnut..."
                value={filters.cropName}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-3">
              <label className="form-label fw-semibold">Location</label>
              <input
                type="text"
                name="location"
                className="form-control"
                placeholder="District / Region..."
                value={filters.location}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Quality</label>
              <select
                name="quality"
                className="form-select"
                value={filters.quality}
                onChange={handleFilterChange}
              >
                <option value="">Any</option>
                <option value="A Grade">A Grade</option>
                <option value="B Grade">B Grade</option>
                <option value="C Grade">C Grade</option>
              </select>
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">
                Min Quantity (qtl)
              </label>
              <input
                type="number"
                name="minQuantity"
                className="form-control"
                placeholder="qtl"
                value={filters.minQuantity}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">
                Max Price (₹/qtl)
              </label>
              <input
                type="number"
                name="maxPrice"
                className="form-control"
                placeholder="₹"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Layout: Listings on left, My Offers & Deals on right */}
      <div className="row g-4">
        {/* CROPS LIST */}
        <div className="col-12 col-lg-8">
          {loadingCrops && <p className="text-muted">Loading crops...</p>}

          {!loadingCrops && filteredCrops.length === 0 && (
            <p className="text-muted">No crops matching your filters.</p>
          )}

          <div className="row g-4">
            {filteredCrops.map((crop) => (
              <div key={crop.id} className="col-md-6">
                <div className="card shadow-sm border-0 h-100 bg-light">
                  <div className="card-header bg-white border-success-subtle border-bottom d-flex justify-content-between align-items-start">
                    <div>
                      <h5 className="text-success mb-1">{crop.crop_name}</h5>
                      <small className="text-muted">
                        Farmer: {crop.farmer_name}
                      </small>
                    </div>
                    <span
                      className={
                        "badge rounded-pill px-3 py-2 " +
                        (crop.status === "OPEN"
                          ? "text-bg-success"
                          : crop.status === "PARTIALLY_SOLD"
                          ? "text-bg-warning text-dark"
                          : "text-bg-secondary")
                      }
                    >
                      {crop.status}
                    </span>
                  </div>

                  <div className="card-body">
                    <p>
                      <strong>Quantity:</strong> {crop.crop_quantity} qtl
                    </p>
                    <p>
                      <strong>Quality:</strong> {crop.crop_grade}
                    </p>
                    <p>
                      <strong>Farmer Price:</strong> ₹{crop.demanded_price} / qtl
                    </p>
                    <p>
                      <strong>Location:</strong> {crop.region}, {crop.state}
                    </p>
                  </div>

                  <div className="card-footer bg-white d-flex justify-content-between">
                    {crop.status === "OPEN" && (
                      <button
                        className="btn btn-outline-success btn-sm rounded-pill px-3"
                        onClick={() => openListingModal(crop)}
                      >
                        Send Offer
                      </button>
                    )}
                    <button
                      className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                      onClick={() => openListingModal(crop)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* My Offers & Deals */}
        <div className="col-12 col-lg-4">
          {/* My Offers */}
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-white border-bottom border-success-subtle">
              <h6 className="mb-0 fw-semibold text-success">My Offers</h6>
            </div>
            <div className="card-body">
              {loadingMyOffers && (
                <p className="text-muted">Loading your offers...</p>
              )}
              {!loadingMyOffers && myOffers.length === 0 && (
                <p className="text-muted mb-0">
                  You haven&apos;t placed any offers yet.
                </p>
              )}

              {!loadingMyOffers &&
                myOffers.map((offer) => {
                  const total = offer.offered_price * offer.offered_quantity;
                  return (
                    <div
                      key={offer.id}
                      className="p-2 mb-2 bg-light rounded border small d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">
                          Listing #{offer.listing_id}
                        </div>
                        <div className="text-muted">
                          ₹{offer.offered_price}/qtl × {offer.offered_quantity} qtl
                        </div>
                        <div className="text-muted">
                          <strong>Total:</strong> ₹{total.toFixed(2)}
                        </div>
                        <span
                          className={
                            "badge mt-1 " +
                            (offer.status === "ACCEPTED"
                              ? "text-bg-success"
                              : offer.status === "REJECTED"
                              ? "text-bg-danger"
                              : "text-bg-warning text-dark")
                          }
                        >
                          {offer.status}
                        </span>
                      </div>
                      <div className="d-flex flex-column gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => viewOfferDetails(offer)}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cancelOffer(offer.id)}
                          disabled={deletingOfferId === offer.id}
                        >
                          {deletingOfferId === offer.id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* My Deals */}
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom border-success-subtle">
              <h6 className="mb-0 fw-semibold text-success">My Deals</h6>
            </div>
            <div className="card-body">
              {loadingMyDeals && (
                <p className="text-muted">Loading your deals...</p>
              )}
              {!loadingMyDeals && myDeals.length === 0 && (
                <p className="text-muted mb-0">
                  No confirmed deals yet. Once farmers accept your offers, deals
                  will appear here.
                </p>
              )}
              {!loadingMyDeals &&
                myDeals.map((deal) => {
                  const total = deal.quantity * deal.agreed_price;
                  return (
                    <div
                      key={deal.id}
                      className="p-2 mb-2 bg-light rounded border small d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-semibold">
                          Listing #{deal.listing_id}
                        </div>
                        <div className="text-muted">
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
                        View
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Listing Details + Offer Modal (improved UI) */}
      {showModal && selectedListing && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          style={{ zIndex: 1050 }}
        >
          <div
            className="bg-white rounded shadow-lg p-4"
            style={{ width: "650px", maxWidth: "95%" }}
          >
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h4 className="text-success mb-1">
                  {selectedListing.crop_name} – Detailed View
                </h4>
                <small className="text-muted">
                  Check farmer details, location, pricing and then place your offer.
                </small>
              </div>
              <span
                className={
                  "badge rounded-pill px-3 py-2 " +
                  (selectedListing.status === "OPEN"
                    ? "text-bg-success"
                    : selectedListing.status === "PARTIALLY_SOLD"
                    ? "text-bg-warning text-dark"
                    : "text-bg-secondary")
                }
              >
                {selectedListing.status}
              </span>
            </div>

            {loadingListingDetail ? (
              <p className="text-muted">Refreshing listing...</p>
            ) : (
              <>
                {/* Crop & Price section */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="small text-muted">Crop</div>
                    <div className="fw-semibold">
                      {selectedListing.crop_name} ({selectedListing.crop_grade})
                    </div>
                    <div className="small text-muted">
                      Quantity available: {selectedListing.crop_quantity} qtl
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">
                      Farmer&apos;s Expected Price
                    </div>
                    <div className="fw-semibold">
                      ₹{selectedListing.demanded_price} / qtl
                    </div>
                    {selectedListing.msp_price && (
                      <div className="small text-muted">
                        MSP (reference): ₹{selectedListing.msp_price} / qtl
                      </div>
                    )}
                  </div>
                </div>

                {/* Farmer & Location */}
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="small text-muted">Farmer</div>
                    <div className="fw-semibold">
                      {selectedListing.farmer_name}
                    </div>
                    <div className="small text-muted">
                      Contact: {selectedListing.contact_details}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="small text-muted">Location</div>
                    <div className="fw-semibold">
                      {selectedListing.region}, {selectedListing.state}
                    </div>
                    <div className="small text-muted">
                      Plan logistics based on this region.
                    </div>
                  </div>
                </div>

                <hr className="my-3" />

                {selectedListing.status === "OPEN" ? (
                  <>
                    <h5 className="text-success mb-2">Place Your Offer</h5>
                    {offerSuccess && (
                      <div className="alert alert-success py-2 mt-2">
                        <small>{offerSuccess}</small>
                      </div>
                    )}

                    <form className="mt-2" onSubmit={submitOffer}>
                      <div className="row g-3">
                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            Your Price (₹ / qtl)
                          </label>
                          <input
                            type="number"
                            min="0"
                            className="form-control"
                            name="price"
                            value={offerForm.price}
                            onChange={handleOfferFormChange}
                            required
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label fw-semibold">
                            Quantity (qtl)
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="form-control"
                            name="quantity"
                            value={offerForm.quantity}
                            onChange={handleOfferFormChange}
                            required
                          />
                        </div>

                        <div className="col-md-4">
                          <div className="small text-muted mb-1">
                            Approx. Value
                          </div>
                          <div className="fw-semibold">
                            ₹
                            {offerForm.price && offerForm.quantity
                              ? (
                                  parseFloat(offerForm.price || 0) *
                                  parseFloat(offerForm.quantity || 0)
                                ).toFixed(2)
                              : "0.00"}
                          </div>
                          <div className="small text-muted">
                            Based on your entered price &amp; quantity.
                          </div>
                        </div>

                        <div className="col-md-12 mt-2">
                          <label className="form-label fw-semibold">
                            Message to Farmer (optional)
                          </label>
                          <textarea
                            className="form-control"
                            name="message"
                            rows={2}
                            placeholder="Delivery schedule, payment terms, etc."
                            value={offerForm.message}
                            onChange={handleOfferFormChange}
                          />
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <a
                          href={`tel:${selectedListing.contact_details}`}
                          className="btn btn-outline-success rounded-pill px-3"
                        >
                          Call Farmer
                        </a>

                        <div className="d-flex gap-2">
                          <button
                            type="button"
                            className="btn btn-secondary rounded-pill px-3"
                            onClick={closeModal}
                            disabled={sendingOffer}
                          >
                            Close
                          </button>
                          <button
                            type="submit"
                            className="btn btn-success rounded-pill px-3"
                            disabled={sendingOffer}
                          >
                            {sendingOffer ? "Sending..." : "Send Offer"}
                          </button>
                        </div>
                      </div>
                    </form>
                  </>
                ) : (
                  <p className="text-muted mt-3">
                    This listing is <strong>{selectedListing.status}</strong>, so
                    new offers are disabled.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Offer detail info (bottom card) */}
      {selectedOfferDetail && (
        <div className="mt-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom border-success-subtle d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-semibold text-success">
                Offer Summary – #{selectedOfferDetail.id}
              </h6>
              <div className="d-flex align-items-center gap-2">
                <span
                  className={
                    "badge rounded-pill px-3 py-2 " +
                    (selectedOfferDetail.status === "ACCEPTED"
                      ? "text-bg-success"
                      : selectedOfferDetail.status === "REJECTED"
                      ? "text-bg-danger"
                      : "text-bg-warning text-dark")
                  }
                >
                  {selectedOfferDetail.status}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary rounded-pill"
                  onClick={() => setSelectedOfferDetail(null)}
                >
                  Close
                </button>
              </div>
            </div>
            <div className="card-body">
              {loadingOfferDetail ? (
                <p className="text-muted">Loading offer details...</p>
              ) : (
                <>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="small text-muted">Listing ID</div>
                      <div className="fw-semibold">
                        #{selectedOfferDetail.listing_id}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="small text-muted">Offered Price</div>
                      <div className="fw-semibold">
                        ₹{selectedOfferDetail.offered_price} / qtl
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="small text-muted">Offered Quantity</div>
                      <div className="fw-semibold">
                        {selectedOfferDetail.offered_quantity} qtl
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="small text-muted">Total Value</div>
                      <div className="fw-semibold">
                        ₹
                        {(
                          selectedOfferDetail.offered_price *
                          selectedOfferDetail.offered_quantity
                        ).toFixed(2)}
                      </div>
                    </div>
                    <div className="col-md-8">
                      <div className="small text-muted">Message</div>
                      <div className="fw-normal">
                        {selectedOfferDetail.message || (
                          <span className="text-muted">
                            No message added.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr className="my-3" />

                  <div className="small text-muted mb-1">
                    Use this reference if you contact support or the farmer.
                  </div>
                  <ul className="small mb-0">
                    <li>Offer ID: #{selectedOfferDetail.id}</li>
                    <li>Listing ID: #{selectedOfferDetail.listing_id}</li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Deal detail modal (buyer side) */}
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
                  Purchase Deal – #{selectedDeal.id}
                </h5>
                <small className="text-muted">
                  Finalized purchase details for this crop.
                </small>
              </div>
              <span className="badge text-bg-success rounded-pill px-3 py-2">
                Confirmed
              </span>
            </div>

            {loadingDealDetail ? (
              <p className="text-muted">Loading...</p>
            ) : (
              <>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <div className="small text-muted">Listing ID</div>
                    <div className="fw-semibold">
                      #{selectedDeal.listing_id}
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Farmer ID</div>
                    <div className="fw-semibold">#{selectedDeal.farmer_id}</div>
                  </div>
                  <div className="col-6">
                    <div className="small text-muted">Quantity Purchased</div>
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
                  <div className="col-12">
                    <div className="small text-muted">Total Deal Value</div>
                    <div className="fw-semibold">
                      ₹
                      {(
                        selectedDeal.quantity * selectedDeal.agreed_price
                      ).toFixed(2)}
                    </div>
                  </div>
                </div>

                <hr className="my-3" />

                <div className="small text-muted mb-1">
                  Keep this for your purchase records:
                </div>
                <ul className="small mb-0">
                  <li>Deal ID: #{selectedDeal.id}</li>
                  <li>Listing ID: #{selectedDeal.listing_id}</li>
                  <li>Farmer ID: #{selectedDeal.farmer_id}</li>
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

export default BuyCropsPage;
