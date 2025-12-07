import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import manufacturingService from "../services/manufacturingService";
import ProcurementBoard from "../Components/Manufacturing/ProcurementBoard";
import IncomingGoodsBoard from "../Components/Manufacturing/IncomingGoodsBoard";
import FactoryInventory from "../Components/Manufacturing/FactoryInventory";
import ProductionEntryForm from "../Components/Manufacturing/ProductionEntryForm";
import RegisterFacility from "../Components/Manufacturing/RegisterFacility";
import FactoryMap from "../Components/Manufacturing/FactoryMap";
import OverviewDashboard from "../Components/Manufacturing/OverviewDashboard";

export default function ManufacturingDashboard() {
  const navigate = useNavigate();
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productionStats, setProductionStats] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const [procurementData, setProcurementData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [incomingData, setIncomingData] = useState([]);
  const [activeTab, setActiveTab] = useState("procurement");

  useEffect(() => {
    loadFacilities();
  }, []);

  useEffect(() => {
    if (selectedFacility) {
      loadProductionStats();
    }
  }, [selectedFacility, selectedPeriod]);

  const loadFacilities = async () => {
    setLoading(true);
    try {
      const { data } = await manufacturingService.getFacilities();
      setFacilities(data);
      if (data.length > 0) {
        setSelectedFacility(data[0].id);
      }
    } catch (err) {
      console.error("Error loading facilities:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadProductionStats = async () => {
    if (!selectedFacility) return;

    try {
      const { data } = await manufacturingService.getProductionStats(selectedFacility, selectedPeriod);
      setProductionStats(data);
    } catch (err) {
      console.error("Error loading production stats:", err);
    }
  };

  const handleProductionSuccess = () => {
    loadProductionStats();
    // Trigger refresh of inventory component by remounting it
    setSelectedFacility((prev) => {
      const temp = prev;
      setSelectedFacility(null);
      setTimeout(() => setSelectedFacility(temp), 10);
      return temp;
    });
  };

  const currentFacility = facilities.find((f) => f.id === selectedFacility);

  // Calculate totals for overview dashboard
  const inventoryTotal = inventoryData.reduce((sum, item) => sum + (item.quantity_t || 0), 0);
  const procurementTotal = procurementData.reduce((sum, crop) => sum + (crop.in_storage_total_t || 0), 0);
  const incomingTotal = incomingData.length;

  if (loading) {
    return (
      <div className="container mt-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading manufacturing dashboard...</p>
        </div>
      </div>
    );
  }

  if (facilities.length === 0) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <RegisterFacility onSuccess={loadFacilities} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-1">
            <i className="bi bi-factory me-2 text-primary"></i>
            Manufacturing Dashboard
          </h2>
          <p className="text-muted mb-0">
            AI-powered value chain coordination for oilseed processing
          </p>
        </div>
        <div className="col-auto">
          <select
            className="form-select"
            value={selectedFacility || ""}
            onChange={(e) => setSelectedFacility(Number(e.target.value))}
          >
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} - {f.city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Overview Dashboard */}
      {currentFacility && (
        <OverviewDashboard
          facility={currentFacility}
          productionStats={productionStats}
          inventoryTotal={inventoryTotal}
          procurementTotal={procurementTotal}
          incomingTotal={incomingTotal}
        />
      )}

      {/* Period Selector */}
      {productionStats && (
        <div className="d-flex justify-content-end mb-3">
          <div className="btn-group" role="group">
            <button
              className={`btn btn-sm ${selectedPeriod === "daily" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setSelectedPeriod("daily")}
            >
              Today
            </button>
            <button
              className={`btn btn-sm ${selectedPeriod === "weekly" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setSelectedPeriod("weekly")}
            >
              Week
            </button>
            <button
              className={`btn btn-sm ${selectedPeriod === "monthly" ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => setSelectedPeriod("monthly")}
            >
              Month
            </button>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "procurement" ? "active" : ""}`}
            onClick={() => setActiveTab("procurement")}
            type="button"
          >
            <i className="bi bi-cart3 me-2"></i>
            Procurement
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "incoming" ? "active" : ""}`}
            onClick={() => setActiveTab("incoming")}
            type="button"
          >
            <i className="bi bi-truck me-2"></i>
            Incoming Goods
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "inventory" ? "active" : ""}`}
            onClick={() => setActiveTab("inventory")}
            type="button"
          >
            <i className="bi bi-box-seam me-2"></i>
            Inventory
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "production" ? "active" : ""}`}
            onClick={() => setActiveTab("production")}
            type="button"
          >
            <i className="bi bi-clipboard-data me-2"></i>
            Production Entry
          </button>
        </li>
      </ul>

      <div className="tab-content">
        {activeTab === "procurement" && (
          <div>
            {selectedFacility && currentFacility && (
              <div className="row g-3">
                <div className="col-12">
                  <FactoryMap
                    factory={currentFacility}
                    storageLocations={procurementData.flatMap(crop => crop.storage_locations || [])}
                  />
                </div>
                <div className="col-12">
                  <ProcurementBoard
                    facilityId={selectedFacility}
                    onDataLoaded={(data) => setProcurementData(data)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "incoming" && (
          <div>
            {selectedFacility && <IncomingGoodsBoard facilityId={selectedFacility} onDataLoaded={(data) => setIncomingData(data)} />}
          </div>
        )}

        {activeTab === "inventory" && (
          <div>
            {selectedFacility && <FactoryInventory facilityId={selectedFacility} onDataLoaded={(data) => setInventoryData(data)} />}
          </div>
        )}

        {activeTab === "production" && (
          <div>
            {selectedFacility && (
              <ProductionEntryForm facilityId={selectedFacility} onSuccess={handleProductionSuccess} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
