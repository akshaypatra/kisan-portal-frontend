// Components/SellCrops-component/SellCropsPage.jsx

import React, { useState } from 'react';

const SellCropsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    cropName: '',
    quantity: '',
    quality: '',
    pickupTime: '',
    location: '',
    photo: null,
  });

  // Demo data – now in state so we can update offers
  const [myListings] = useState([
    {
      id: 1,
      cropName: 'Wheat',
      quantity: '500 kg',
      quality: 'A Grade',
      pickupTime: 'Tomorrow, 10:00 AM',
      location: 'Village A, Taluka B',
    },
    {
      id: 2,
      cropName: 'Tomato',
      quantity: '200 kg',
      quality: 'B Grade',
      pickupTime: 'Today, 5:00 PM',
      location: 'Village C, Taluka D',
    },
  ]);

  const [offers, setOffers] = useState([
    {
      id: 1,
      buyerName: 'Sharma Traders',
      cropName: 'Wheat',
      price: '₹22 / kg',
      quantity: '300 kg',
      status: 'Pending',
    },
    {
      id: 2,
      buyerName: 'Green Retail',
      cropName: 'Tomato',
      price: '₹18 / kg',
      quantity: '150 kg',
      status: 'Accepted',
    },
  ]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photo') {
      setFormData((prev) => ({ ...prev, photo: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('New listing submitted:', formData);
    // TODO: send data to backend

    setFormData({
      cropName: '',
      quantity: '',
      quality: '',
      pickupTime: '',
      location: '',
      photo: null,
    });
    setShowForm(false);
  };

  // ✅ Accept / Reject handler
  const handleOfferAction = (id, action) => {
    setOffers((prevOffers) =>
      prevOffers.map((offer) =>
        offer.id === id ? { ...offer, status: action } : offer
      )
    );
  };

  return (
    <div className="container py-4" style={{ fontSize: '1.05rem' }}>
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h2 className="fw-bold text-success mb-2 fs-3">Sell Crops</h2>
          <p className="text-muted mb-3 fs-6">
            Create new listings, manage your crops and track offers from traders and retailers.
          </p>
          <div className="d-flex flex-wrap gap-2">
            <span className="badge rounded-pill text-bg-success p-2 px-3">
              {myListings.length} Active Listings
            </span>
            <span className="badge rounded-pill text-bg-primary p-2 px-3">
              {offers.length} Offers
            </span>
            <span className="badge rounded-pill text-bg-warning p-2 px-3">
              Secure &amp; Transparent Deals
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-success rounded-pill px-4 py-2 fs-6"
          onClick={() => setShowForm((prev) => !prev)}
        >
          {showForm ? 'Close Listing Form' : 'New Listing'}
        </button>
      </div>

      {/* Three columns */}
      <div className="row g-4">
        {/* New Listing + Form */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100 bg-success-subtle">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <span className="fw-semibold fs-6">New Crop Listing</span>
              <button
                type="button"
                className="btn btn-sm btn-light rounded-pill"
                onClick={() => setShowForm((prev) => !prev)}
              >
                {showForm ? 'Hide' : 'New'}
              </button>
            </div>
            <div className="card-body">
              {!showForm && (
                <p className="text-muted mb-0">
                  Click <strong>New Listing</strong> to add crop details like quantity, quality,
                  pickup time and location.
                </p>
              )}

              {showForm && (
                <form className="mt-3" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Crop Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="cropName"
                      value={formData.cropName}
                      onChange={handleChange}
                      placeholder="e.g., Wheat, Rice, Tomato"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Quantity</label>
                    <input
                      type="text"
                      className="form-control"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      placeholder="e.g., 500 kg"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Quality</label>
                    <input
                      type="text"
                      className="form-control"
                      name="quality"
                      value={formData.quality}
                      onChange={handleChange}
                      placeholder="e.g., A Grade, B Grade"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Preferred Pickup Time</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pickupTime"
                      value={formData.pickupTime}
                      onChange={handleChange}
                      placeholder="e.g., Tomorrow, 10:00 AM"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Village, Taluka, District"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Crop Photo</label>
                    <input
                      type="file"
                      className="form-control"
                      name="photo"
                      accept="image/*"
                      onChange={handleChange}
                    />
                    <div className="form-text">
                      A clear photo helps buyers trust your listing.
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-warning text-dark fw-semibold rounded-pill px-3"
                    >
                      Publish Listing
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* My Crop Listings */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100 bg-light">
            <div className="card-header bg-white border-0 border-bottom border-success-subtle">
              <h6 className="mb-0 fw-semibold fs-5 text-success">My Crop Listings</h6>
            </div>
            <div className="card-body">
              {myListings.length === 0 && (
                <p className="text-muted mb-0">
                  No active listings yet. Create your first listing from the left card.
                </p>
              )}

              {myListings.map((listing) => (
                <div
                  key={listing.id}
                  className="p-3 mb-3 bg-white rounded-3 shadow-sm border-start border-4 border-success"
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <div className="fw-semibold fs-6">{listing.cropName}</div>
                      <div className="small text-muted">{listing.location}</div>
                    </div>
                    <span className="badge rounded-pill text-bg-success">
                      {listing.quantity}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between small text-muted mt-1">
                    <span>Quality: {listing.quality}</span>
                    <span>Pickup: {listing.pickupTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Offers from Buyers */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm h-100 bg-light">
            <div className="card-header bg-white border-0 border-bottom border-success-subtle">
              <h6 className="mb-0 fw-semibold fs-5 text-success">Offers from Buyers</h6>
            </div>
            <div className="card-body">
              {offers.length === 0 && (
                <p className="text-muted mb-0">
                  No offers yet. Once buyers send offers, they will appear here.
                </p>
              )}

              {offers.map((offer) => (
                <div
                  key={offer.id}
                  className="p-3 mb-3 bg-white rounded-3 shadow-sm border-start border-4 border-success-subtle"
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <div>
                      <div className="fw-semibold fs-6">{offer.buyerName}</div>
                      <div className="small text-muted">
                        Crop: {offer.cropName}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="fw-bold">{offer.price}</div>
                      <div className="small text-muted">{offer.quantity}</div>
                    </div>
                  </div>

                  {/* Status badge */}
                  <span
                    className={
                      'badge mt-2 ' +
                      (offer.status === 'Accepted'
                        ? 'text-bg-success'
                        : offer.status === 'Rejected'
                        ? 'text-bg-danger'
                        : 'text-bg-warning text-dark')
                    }
                  >
                    {offer.status}
                  </span>

                  {/* ✅ Accept / Reject buttons */}
                  <div className="mt-3 d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-success"
                      onClick={() => handleOfferAction(offer.id, 'Accepted')}
                    >
                      Accept
                    </button>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleOfferAction(offer.id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellCropsPage;
