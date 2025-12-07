import React from "react";
import BookTransportCard from "../../Components/Transport/BookTransportCard";
import FarmerRequestsPanel from "../../Components/Transport/FarmerRequestsPanel";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function BookTransportPage() {
  const user = getStoredUser();
  const farmerId = user?.id;

  return (
    <div className="container py-4">
      <div className="mb-3">
        <h3 className="fw-bold">Book Transport</h3>
        <p className="text-muted mb-0">
          Choose your harvested crop, pickup schedule, and broadcast to transporters. Nearby vehicles are shown for separate bookings.
        </p>
      </div>
      <div className="row g-3">
        <div className="col-lg-7">
          <BookTransportCard farmerId={farmerId} />
        </div>
        <div className="col-lg-5">
          <FarmerRequestsPanel />
        </div>
      </div>
    </div>
  );
}
