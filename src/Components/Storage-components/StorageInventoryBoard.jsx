import React from "react";
import { FaArrowRight, FaWarehouse } from "react-icons/fa";
import { useStorage } from "./StorageContext";

const statusSteps = ["Scheduled", "In transit", "Stored", "Ready for dispatch"];

export default function StorageInventoryBoard() {
  const { lots, updateLotStatus } = useStorage();

  const getNextStatus = (status) => {
    const idx = statusSteps.indexOf(status);
    if (idx === -1 || idx === statusSteps.length - 1) return null;
    return statusSteps[idx + 1];
  };

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Inventory flow</h5>
            <small className="text-muted">Move lots through the lifecycle</small>
          </div>
          <span className="badge bg-light text-dark">{lots.length} lots</span>
        </div>

        <div className="d-flex flex-column gap-3">
          {lots.map((lot) => {
            const nextStatus = getNextStatus(lot.status);
            return (
              <div
                key={lot.id}
                className="border rounded-4 p-3"
                style={{ borderColor: "#e5eef4", background: "#fff" }}
              >
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <div className="fw-semibold">
                      {lot.crop} • {lot.quantity_t} t
                    </div>
                    <small className="text-muted">
                      Owner: {lot.owner} • Grade {lot.qualityGrade}
                    </small>
                  </div>
                  <span className="badge bg-success-subtle text-success">{lot.status}</span>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted small mt-2">
                  <FaWarehouse /> {lot.facilityName}
                  <FaArrowRight size={12} />
                  Dispatch ETA {lot.dispatchEta}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2">
                  <small className="text-muted">
                    Intake {lot.intakeDate} • ETA {lot.dispatchEta}
                  </small>
                  {nextStatus && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => updateLotStatus(lot.id, nextStatus)}
                    >
                      Move to {nextStatus}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {lots.length === 0 && (
            <div className="text-center text-muted py-4">No active lots right now.</div>
          )}
        </div>
      </div>
    </div>
  );
}
