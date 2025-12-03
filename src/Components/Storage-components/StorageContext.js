import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import storageService from "../../services/storageService";

const StorageContext = createContext(null);

const initialFacilities = [
  {
    id: "fac-01",
    name: "GreenPalm Integrated Warehouse",
    location: "Kolhapur, Maharashtra",
    capacity_t: 2200,
    available_t: 480,
    commodities: ["Soybean", "Groundnut", "Sunflower"],
    services: ["Drying", "Cold Storage", "Quality Lab", "Blockchain Tagging"],
    utilizationTrend: [72, 78, 81, 84, 79, 76],
    alerts: 1,
    throughput_t: 540,
    revenue_lakh: 32,
    manager: "Asha Kulkarni",
  },
  {
    id: "fac-02",
    name: "Narmada Riverfront Silos",
    location: "Narsinghpur, Madhya Pradesh",
    capacity_t: 1500,
    available_t: 210,
    commodities: ["Soybean", "Mustard", "Sesame"],
    services: ["Aeration", "Fumigation", "Rail Siding"],
    utilizationTrend: [65, 62, 68, 70, 74, 77],
    alerts: 2,
    throughput_t: 420,
    revenue_lakh: 24,
    manager: "Rohit Tiwari",
  },
  {
    id: "fac-03",
    name: "Eastern Delta Cold Chain",
    location: "Kakinada, Andhra Pradesh",
    capacity_t: 980,
    available_t: 610,
    commodities: ["Oil Palm", "Coconut"],
    services: ["Cold Storage", "Packaging", "Ripening"],
    utilizationTrend: [44, 48, 52, 55, 60, 58],
    alerts: 0,
    throughput_t: 295,
    revenue_lakh: 18,
    manager: "Seema Babu",
  },
];

const initialRequests = [
  {
    id: "req-301",
    farmer: "Field A Collective",
    crop: "Soybean",
    quantity_t: 22,
    facilityId: "fac-01",
    status: "Queued",
    preferredDate: "2025-11-23",
  },
  {
    id: "req-302",
    farmer: "North Plot FPO",
    crop: "Mustard",
    quantity_t: 12,
    facilityId: "fac-02",
    status: "Scheduled",
    preferredDate: "2025-11-22",
  },
  {
    id: "req-303",
    farmer: "Sunrise Farmer Group",
    crop: "Oil Palm",
    quantity_t: 18,
    facilityId: "fac-03",
    status: "Approved",
    preferredDate: "2025-11-21",
  },
];

const initialLots = [
  {
    id: "lot-500",
    crop: "Soybean",
    quantity_t: 16,
    facilityId: "fac-01",
    facilityName: "GreenPalm Integrated Warehouse",
    status: "Stored",
    intakeDate: "2025-11-18",
    dispatchEta: "2025-11-28",
    owner: "Field A Collective",
    qualityGrade: "A",
  },
  {
    id: "lot-501",
    crop: "Mustard",
    quantity_t: 9,
    facilityId: "fac-02",
    facilityName: "Narmada Riverfront Silos",
    status: "In transit",
    intakeDate: "2025-11-20",
    dispatchEta: "2025-11-24",
    owner: "North Plot FPO",
    qualityGrade: "B+",
  },
  {
    id: "lot-502",
    crop: "Oil Palm",
    quantity_t: 12,
    facilityId: "fac-03",
    facilityName: "Eastern Delta Cold Chain",
    status: "Scheduled",
    intakeDate: "2025-11-23",
    dispatchEta: "2025-11-30",
    owner: "Sunrise Farmer Group",
    qualityGrade: "A",
  },
  {
    id: "lot-503",
    crop: "Groundnut",
    quantity_t: 7,
    facilityId: "fac-01",
    facilityName: "GreenPalm Integrated Warehouse",
    status: "Ready for dispatch",
    intakeDate: "2025-11-16",
    dispatchEta: "2025-11-21",
    owner: "Riverbank Farmers Co-op",
    qualityGrade: "A-",
  },
];

const initialAlerts = [
  {
    id: "alert-21",
    facilityId: "fac-02",
    facilityName: "Narmada Riverfront Silos",
    type: "Temperature spike",
    severity: "high",
    message: "Silo tower #2 crossed 34°C for 15 minutes.",
    timestamp: "2025-11-21T09:45:00Z",
    acknowledged: false,
  },
  {
    id: "alert-22",
    facilityId: "fac-01",
    facilityName: "GreenPalm Integrated Warehouse",
    type: "Fumigation due",
    severity: "medium",
    message: "Stack 3 requires fumigation within 48 hours.",
    timestamp: "2025-11-21T08:10:00Z",
    acknowledged: false,
  },
  {
    id: "alert-23",
    facilityId: "fac-03",
    facilityName: "Eastern Delta Cold Chain",
    type: "Door sensor",
    severity: "low",
    message: "Dock door #2 opened longer than 10 minutes.",
    timestamp: "2025-11-21T07:30:00Z",
    acknowledged: true,
  },
];

const initialTasks = [
  {
    id: "task-21",
    facilityId: "fac-01",
    title: "Upload blockchain lot certificates",
    dueDate: "2025-11-22",
    status: "pending",
    owner: "Operations Lead",
  },
  {
    id: "task-22",
    facilityId: "fac-02",
    title: "Schedule fumigation contractor",
    dueDate: "2025-11-21",
    status: "in_progress",
    owner: "Maintenance Supervisor",
  },
  {
    id: "task-23",
    facilityId: "fac-03",
    title: "Cold room calibration",
    dueDate: "2025-11-25",
    status: "pending",
    owner: "Tech Team",
  },
];

const fallbackTrend = [50, 55, 60, 58, 62, 64];

const ownerLabels = {
  storage_business: "Storage Business",
  fpo: "FPO",
  company_center: "Company Center",
};

function normalizeFacilityPayload(facility) {
  if (!facility) return null;
  return {
    id: facility.id,
    name: facility.name,
    owner_type: facility.owner_type,
    owner_type_label: ownerLabels[facility.owner_type] || facility.owner_type,
    location: facility.city && facility.state ? `${facility.city}, ${facility.state}` : facility.city || facility.state || "",
    capacity_t: Number(facility.capacity_t || 0),
    available_t: Number(facility.capacity_t || 0),
    commodities: [],
    services: facility.storage_type === "cold" ? ["Cold Storage"] : ["Warehouse"],
    utilizationTrend: fallbackTrend,
    alerts: 0,
    throughput_t: 0,
    revenue_lakh: 0,
    manager: facility.owner_name || "Facility Owner",
    latitude: facility.latitude,
    longitude: facility.longitude,
    storage_type: facility.storage_type,
    owner_name: facility.owner_name,
    offloading_slots: facility.offloading_slots,
  };
}

function StorageProvider({ children }) {
  const [facilities, setFacilities] = useState(initialFacilities);
  const [requests, setRequests] = useState(initialRequests);
  const [lots, setLots] = useState(initialLots);
  const [alerts, setAlerts] = useState(initialAlerts);
  const [tasks, setTasks] = useState(initialTasks);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [facilityError, setFacilityError] = useState(null);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    if (!localStorage.getItem("accessToken")) {
      setFacilities(initialFacilities);
      return;
    }
    setLoadingFacilities(true);
    setFacilityError(null);
    try {
      const { data } = await storageService.listFacilities();
      if (Array.isArray(data) && data.length) {
        setFacilities(data.map(normalizeFacilityPayload));
      } else {
        setFacilities([]);
      }
    } catch (err) {
      console.error("Failed to load facilities", err);
      setFacilityError("Unable to load facilities");
    } finally {
      setLoadingFacilities(false);
    }
  };

  const createStorageRequest = (payload) => {
    setRequests((prev) => [
      {
        id: `req-${Date.now()}`,
        status: "Queued",
        ...payload,
      },
      ...prev,
    ]);
  };

  const updateRequestStatus = (requestId, status) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status } : req))
    );
  };

  const updateLotStatus = (lotId, status) => {
    setLots((prev) =>
      prev.map((lot) =>
        lot.id === lotId ? { ...lot, status, updatedAt: new Date().toISOString() } : lot
      )
    );
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? { ...alert, acknowledged: true, acknowledgedAt: new Date().toISOString() }
          : alert
      )
    );
  };

  const completeTask = (taskId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: "completed", completedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const summary = useMemo(() => {
    const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity_t, 0);
    const available = facilities.reduce((sum, f) => sum + f.available_t, 0);
    const utilization = totalCapacity ? ((totalCapacity - available) / totalCapacity) * 100 : 0;
    const inTransitLots = lots.filter((lot) => lot.status === "In transit").length;
    const readyForDispatch = lots.filter((lot) => lot.status === "Ready for dispatch").length;
    const storedLots = lots.filter((lot) => lot.status === "Stored").length;
    return {
      totalCapacity,
      availableCapacity: available,
      utilization: +utilization.toFixed(1),
      inTransitLots,
      readyForDispatch,
      storedLots,
      openAlerts: alerts.filter((alert) => !alert.acknowledged).length,
      pendingTasks: tasks.filter((task) => task.status !== "completed").length,
      queuedRequests: requests.filter((req) => req.status === "Queued").length,
    };
  }, [facilities, alerts, tasks, lots, requests]);

  const createFacility = async (payload) => {
    const response = await storageService.createFacility(payload);
    const normalized = normalizeFacilityPayload(response.data);
    setFacilities((prev) => [normalized, ...prev]);
    return normalized;
  };

  const value = useMemo(
    () => ({
      facilities,
      requests,
      lots,
      alerts,
      tasks,
      summary,
      createStorageRequest,
      updateRequestStatus,
      updateLotStatus,
      acknowledgeAlert,
      completeTask,
      createFacility,
      fetchFacilities,
      loadingFacilities,
      facilityError,
    }),
    [facilities, requests, lots, alerts, tasks, summary]
  );

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>;
}

export function useStorage() {
  const ctx = useContext(StorageContext);
  if (!ctx) throw new Error("useStorage must be used within StorageProvider");
  return ctx;
}

export default StorageProvider;
