import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import transportService from "../../services/transportService";

const TransportContext = createContext(null);

function normalizeVehicle(vehicle) {
  if (!vehicle) return null;
  return {
    id: vehicle.id || `veh-${Date.now()}`,
    driver_name: vehicle.driver_name,
    contact_number: vehicle.contact_number,
    vehicle_number: vehicle.vehicle_number,
    capacity_tons: Number(vehicle.capacity_tons) || 0,
    vehicle_type: vehicle.vehicle_type || "tempo",
    notes: vehicle.notes || "",
    latitude: vehicle.latitude ?? null,
    longitude: vehicle.longitude ?? null,
    location_updated_at: vehicle.location_updated_at || null,
  };
}

export function TransportProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await transportService.listVehicles();
      if (Array.isArray(data) && data.length) {
        setVehicles(data.map(normalizeVehicle));
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error("Failed to load vehicles", err);
      setError("Unable to load vehicles at the moment.");
    } finally {
      setLoading(false);
    }
  };

  const registerVehicle = async (payload) => {
    const body = {
      driver_name: payload.driver_name,
      contact_number: payload.contact_number,
      vehicle_number: payload.vehicle_number.toUpperCase(),
      capacity_tons: Number(payload.capacity_tons),
      vehicle_type: payload.vehicle_type,
      driver_password: payload.driver_password,
    };

    const { data } = await transportService.createVehicle(body);
    const created = normalizeVehicle(data);

    setVehicles((prev) => [created, ...prev]);
    return created;
  };

  const value = useMemo(
    () => ({
      vehicles,
      loading,
      error,
      loadVehicles,
      registerVehicle,
    }),
    [vehicles, loading, error]
  );

  return <TransportContext.Provider value={value}>{children}</TransportContext.Provider>;
}

export function useTransport() {
  const ctx = useContext(TransportContext);
  if (!ctx) throw new Error("useTransport must be used within TransportProvider");
  return ctx;
}
