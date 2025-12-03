import React from "react";
import { FaBoxOpen, FaClipboardList, FaExclamationTriangle, FaWarehouse } from "react-icons/fa";
import { useStorage } from "./StorageContext";

const cardsConfig = [
  {
    label: "Network capacity",
    valueKey: "totalCapacity",
    suffix: " t",
    icon: <FaWarehouse size={24} />,
    color: "#1b5e20",
    description: "Across all registered facilities",
  },
  {
    label: "Lots stored",
    valueKey: "storedLots",
    suffix: "",
    icon: <FaBoxOpen size={24} />,
    color: "#1565c0",
    description: "Active inventory lots",
  },
  {
    label: "Queued requests",
    valueKey: "queuedRequests",
    icon: <FaClipboardList size={24} />,
    color: "#ef6c00",
    description: "Awaiting approval",
  },
  {
    label: "Open alerts",
    valueKey: "openAlerts",
    icon: <FaExclamationTriangle size={24} />,
    color: "#c62828",
    description: "Needing immediate action",
  },
];

export default function StorageSummaryCards() {
  const { summary } = useStorage();

  return (
    <div className="row g-3 mb-4">
      {cardsConfig.map((card) => (
        <div key={card.label} className="col-12 col-md-6 col-xl-3">
          <div
            className="h-100 p-3 rounded-4 text-white shadow-sm"
            style={{
              background: card.color,
              minHeight: 140,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div>
                <div className="text-uppercase small" style={{ opacity: 0.8 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: 32, fontWeight: 700 }}>
                  {summary[card.valueKey] ?? 0}
                  {card.suffix}
                </div>
              </div>
              {card.icon}
            </div>
            <div className="small" style={{ opacity: 0.85 }}>{card.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
