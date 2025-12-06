import React from "react";

export default function AIAdvisoryBanner({ onClick, className = "" }) {
  return (
    <div className={`row mb-3 ${className}`}>
      <div className="col-12">
        <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between p-3 bg-light border rounded">
          <div className="fw-semibold text-success">AI Advisory</div>
          <button type="button" className="btn btn-primary mt-2 mt-sm-0" onClick={onClick}>
            Click here
          </button>
        </div>
      </div>
    </div>
  );
}
