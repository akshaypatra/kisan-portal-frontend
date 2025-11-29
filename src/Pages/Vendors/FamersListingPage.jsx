// Components/BuyCrops-component/BuyCropsPage.jsx

import React, { useMemo, useState } from "react";

const BuyCropsPage = () => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [crops] = useState([
    {
      id: 1,
      cropName: "Wheat",
      quantity: 500,
      quantityUnit: "kg",
      quality: "A Grade",
      pricePerUnit: 22,
      location: "Village A, Taluka B, District X",
      farmerName: "Ramesh Patil",
      phone: "9876543210",
      pickupTime: "Tomorrow, 10:00 AM",
      description: "High quality wheat suitable for milling.",
    },
    {
      id: 2,
      cropName: "Tomato",
      quantity: 200,
      quantityUnit: "kg",
      quality: "B Grade",
      pricePerUnit: 18,
      location: "Village C, Taluka D, District Y",
      farmerName: "Suresh Yadav",
      phone: "9123456780",
      pickupTime: "Today, 5:00 PM",
      description: "Fresh tomatoes ideal for mandis and retailers.",
    },
  ]);

  const [filters, setFilters] = useState({
    cropName: "",
    location: "",
    quality: "",
    minQuantity: "",
    maxPrice: "",
  });

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
      return (
        (filters.cropName
          ? crop.cropName.toLowerCase().includes(filters.cropName.toLowerCase())
          : true) &&
        (filters.location
          ? crop.location.toLowerCase().includes(filters.location.toLowerCase())
          : true) &&
        (filters.quality ? crop.quality === filters.quality : true) &&
        (filters.minQuantity ? crop.quantity >= filters.minQuantity : true) &&
        (filters.maxPrice ? crop.pricePerUnit <= filters.maxPrice : true)
      );
    });
  }, [crops, filters]);

  const openModal = (crop) => {
    setSelectedCrop(crop);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedCrop(null);
    setShowModal(false);
  };

  return (
    <div className="container py-4" style={{ fontSize: "1.05rem" }}>
      {/* HEADER */}
      <h2 className="fw-bold text-success fs-2">Buy Crops</h2>
      <p className="text-muted fs-6">
        Browse all listed crops and filter by name, quality, location and more.
      </p>

      {/* FILTER PANEL */}
      <div className="card shadow-sm border-0 mb-4 bg-success-subtle">
        <div className="card-header bg-success text-white d-flex justify-content-between">
          <strong>Filters</strong>
          <button className="btn btn-light btn-sm rounded-pill" onClick={clearFilters}>
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
                placeholder="Wheat, Tomato.."
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
                placeholder="District..."
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
              <label className="form-label fw-semibold">Min Quantity</label>
              <input
                type="number"
                name="minQuantity"
                className="form-control"
                placeholder="kg"
                value={filters.minQuantity}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-2">
              <label className="form-label fw-semibold">Max Price</label>
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

      {/* CROPS LIST */}
      <div className="row g-4">
        {filteredCrops.map((crop) => (
          <div key={crop.id} className="col-md-6 col-lg-4">
            <div className="card shadow-sm border-0 h-100 bg-light">
              
              <div className="card-header bg-white border-success-subtle border-bottom">
                <h5 className="text-success mb-1">{crop.cropName}</h5>
                <small className="text-muted">Farmer: {crop.farmerName}</small>
              </div>

              <div className="card-body">
                <p><strong>Quantity:</strong> {crop.quantity} {crop.quantityUnit}</p>
                <p><strong>Quality:</strong> {crop.quality}</p>
                <p><strong>Price:</strong> ₹{crop.pricePerUnit}/{crop.quantityUnit}</p>
                <p><strong>Location:</strong> {crop.location}</p>
                <p><strong>Pickup:</strong> {crop.pickupTime}</p>
              </div>

              <div className="card-footer bg-white d-flex justify-content-between">
                <button
                  className="btn btn-outline-success btn-sm rounded-pill px-3"
                  onClick={() => alert(`Interest sent to ${crop.farmerName}`)}
                >
                  Send Interest
                </button>

                <button
                  className="btn btn-outline-secondary btn-sm rounded-pill px-3"
                  onClick={() => openModal(crop)}
                >
                  View Details
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* CUSTOM MODAL (REACT CONTROLLED) */}
      {showModal && selectedCrop && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center"
          style={{ zIndex: 1050 }}
        >
          <div className="bg-white rounded shadow-lg p-4" style={{ width: "650px" }}>
            <h4 className="text-success mb-3">{selectedCrop.cropName} Details</h4>

            <p><strong>Farmer:</strong> {selectedCrop.farmerName}</p>
            <p><strong>Phone:</strong> {selectedCrop.phone}</p>
            <p><strong>Description:</strong> {selectedCrop.description}</p>
            <p><strong>Quantity:</strong> {selectedCrop.quantity} {selectedCrop.quantityUnit}</p>
            <p><strong>Quality:</strong> {selectedCrop.quality}</p>
            <p><strong>Location:</strong> {selectedCrop.location}</p>
            <p><strong>Pickup Time:</strong> {selectedCrop.pickupTime}</p>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <a
                href={`tel:${selectedCrop.phone}`}
                className="btn btn-success rounded-pill px-3"
              >
                Contact Farmer
              </a>

              <button
                className="btn btn-secondary rounded-pill px-3"
                onClick={closeModal}
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
