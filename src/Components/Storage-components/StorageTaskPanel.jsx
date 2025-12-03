import React from "react";
import { FaClipboardCheck } from "react-icons/fa";
import { useStorage } from "./StorageContext";

const statusBadge = {
  pending: "bg-secondary-subtle text-secondary",
  in_progress: "bg-info-subtle text-info",
  completed: "bg-success-subtle text-success",
};

export default function StorageTaskPanel() {
  const { tasks, completeTask } = useStorage();

  return (
    <div className="card shadow-sm h-100" style={{ borderRadius: 16 }}>
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="mb-0 d-flex align-items-center gap-2">
              <FaClipboardCheck /> Operations tasks
            </h5>
            <small className="text-muted">Drying, fumigation, compliance workflows</small>
          </div>
          <span className="badge bg-warning-subtle text-warning">
            {tasks.filter((task) => task.status !== "completed").length} pending
          </span>
        </div>

        <div className="d-flex flex-column gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border rounded-4 p-3"
              style={{ borderColor: "#f3efe1", background: "#fff" }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-semibold">{task.title}</div>
                  <small className="text-muted">
                    {task.owner} • Due {task.dueDate}
                  </small>
                </div>
                <span className={`badge ${statusBadge[task.status] || "bg-light text-dark"}`}>
                  {task.status.replace("_", " ")}
                </span>
              </div>
              {task.status !== "completed" && (
                <button
                  className="btn btn-sm btn-outline-primary mt-2"
                  onClick={() => completeTask(task.id)}
                >
                  Mark complete
                </button>
              )}
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-muted py-4">No operational tasks assigned.</div>
          )}
        </div>
      </div>
    </div>
  );
}
