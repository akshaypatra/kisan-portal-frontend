import React, { useMemo } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import { useStorage } from "./StorageContext";

export default function StorageInsights() {
  const { facilities, lots } = useStorage();

  const capacityData = useMemo(
    () =>
      facilities.map((facility) => ({
        name: facility.name.split(" ")[0],
        capacity: facility.capacity_t,
        available: facility.available_t,
      })),
    [facilities]
  );

  const lotStatusData = useMemo(() => {
    const grouped = lots.reduce((acc, lot) => {
      acc[lot.status] = (acc[lot.status] || 0) + lot.quantity_t;
      return acc;
    }, {});
    return Object.entries(grouped).map(([status, qty]) => ({ status, qty }));
  }, [lots]);

  const weeks = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];
  const utilizationTrendData = useMemo(
    () =>
      weeks.map((label, weekIdx) => {
        const entry = { week: label };
        facilities.forEach((facility) => {
          entry[facility.name] = facility.utilizationTrend?.[weekIdx] ?? null;
        });
        return entry;
      }),
    [weeks, facilities]
  );

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0">Network insights</h5>
            <small className="text-muted">Capacity, inventory mix, and utilization</small>
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="border rounded-4 p-3 h-100">
              <h6 className="text-muted small mb-2">Capacity vs availability</h6>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={capacityData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="capacity" fill="#2e7d32" />
                    <Bar dataKey="available" fill="#a5d6a7" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="border rounded-4 p-3 h-100">
              <h6 className="text-muted small mb-2">Lot status mix (t)</h6>
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer>
                  <BarChart data={lotStatusData}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="qty" fill="#ffb300" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="border rounded-4 p-3">
              <h6 className="text-muted small mb-2">Utilization trend (last 6 weeks)</h6>
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                  <LineChart data={utilizationTrendData}>
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {facilities.map((facility, idx) => (
                      <Line
                        key={facility.id}
                        type="monotone"
                        dataKey={facility.name}
                        stroke={["#2e7d32", "#f57c00", "#1565c0", "#6a1b9a"][idx % 4]}
                        strokeWidth={2}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
