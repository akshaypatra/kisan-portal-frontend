import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Polygon, Polyline, FeatureGroup, useMapEvents } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import * as turf from "@turf/turf";
import exifr from "exifr";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix icon paths for many bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});


export default function PlotRegistrationForm() {
  // form state
  const [plotName, setPlotName] = useState("");
  const [description, setDescription] = useState("");
  const [areaInput, setAreaInput] = useState("");
  const [coords, setCoords] = useState([]); // finalized polygon coords [[lat,lng],...]
  const [markers, setMarkers] = useState([]); // generic markers (photo/device/point mode)
  const [calculatedAreaSqM, setCalculatedAreaSqM] = useState(0);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoGeo, setPhotoGeo] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");

  // point-by-point mode state
  const [pointMode, setPointMode] = useState(false);
  const [tempPoints, setTempPoints] = useState([]); // points being plotted in pointMode

  // refs
  const mapRef = useRef(null);
  const fgRef = useRef(null);

  // compute area whenever coords changes
  useEffect(() => {
    if (coords.length >= 3) {
      // turf expects [lng, lat]
      const poly = turf.polygon([[...coords.map(c => [c[1], c[0]]), [coords[0][1], coords[0][0]]]]);
      const area = turf.area(poly);
      setCalculatedAreaSqM(Math.round(area));
    } else {
      setCalculatedAreaSqM(0);
    }
  }, [coords]);

  // map click handler that supports pointMode vs normal marker
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        if (pointMode) {
          // add to temp points
          setTempPoints(prev => [...prev, [lat, lng]]);
        } else {
          // regular quick marker
          setMarkers(prev => [...prev, [lat, lng]]);
        }
      }
    });
    return null;
  }

  // EditControl handlers: use layer.toGeoJSON() to reliably convert to coords
  function geoJSONPolygonToLatLngArray(geojson) {
    // geojson.geometry.coordinates is an array: [ [ [lng,lat], ... ] ] for Polygon
    if (!geojson || !geojson.coordinates) return [];
    const coordsArr = geojson.coordinates;
    // take the first ring
    const firstRing = coordsArr[0];
    return firstRing.map(([lng, lat]) => [lat, lng]);
  }

  function onCreated(e) {
    const layer = e.layer;
    if (!layer) return;
    try {
      const geo = layer.toGeoJSON();
      if (geo && geo.geometry) {
        if (geo.geometry.type === "Polygon") {
          const latlngs = geoJSONPolygonToLatLngArray(geo.geometry);
          setCoords(latlngs);
        } else if (geo.geometry.type === "MultiPolygon") {
          const latlngs = geoJSONPolygonToLatLngArray({ coordinates: geo.geometry.coordinates[0] });
          setCoords(latlngs);
        } else if (geo.geometry.type === "Point") {
          const [lng, lat] = geo.geometry.coordinates;
          setMarkers(prev => [...prev, [lat, lng]]);
        }
      }
    } catch (err) {
      // fallback: try layer.getLatLngs
      if (layer.getLatLngs) {
        try {
          const latlngs = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);
          setCoords(latlngs);
        } catch (_) {}
      }
    }
  }

  function onEdited(e) {
    const layers = e.layers;
    let updated = false;
    layers.eachLayer(layer => {
      try {
        const geo = layer.toGeoJSON();
        if (geo && geo.geometry && (geo.geometry.type === "Polygon" || geo.geometry.type === "MultiPolygon")) {
          const latlngs = geoJSONPolygonToLatLngArray(geo.geometry.type === "Polygon" ? geo.geometry : { coordinates: geo.geometry.coordinates[0] });
          setCoords(latlngs);
          updated = true;
        }
      } catch (err) {
        if (layer.getLatLngs) {
          try {
            const latlngs = layer.getLatLngs()[0].map(p => [p.lat, p.lng]);
            setCoords(latlngs);
            updated = true;
          } catch (_) {}
        }
      }
    });
    if (!updated) {
      // if no polygon found in edited layers, we don't change coords here
      // but we could inspect the featureGroup for remaining polygons
      const fg = fgRef.current;
      if (!fg) return;
      const remaining = Object.values(fg._layers || {}).map(l => {
        try { return l.toGeoJSON(); } catch { return null; }
      }).filter(Boolean);
      const poly = remaining.find(r => r.geometry && (r.geometry.type === "Polygon" || r.geometry.type === "MultiPolygon"));
      if (poly) {
        setCoords(geoJSONPolygonToLatLngArray(poly.geometry.type === "Polygon" ? poly.geometry : { coordinates: poly.geometry.coordinates[0] }));
      }
    }
  }

  function onDeleted(e) {
    // when shapes deleted, inspect remaining FG layers
    const fg = fgRef.current;
    if (!fg) {
      setCoords([]);
      return;
    }
    const remaining = Object.values(fg._layers || {}).map(l => {
      try { return l.toGeoJSON(); } catch { return null; }
    }).filter(Boolean);
    const poly = remaining.find(r => r.geometry && (r.geometry.type === "Polygon" || r.geometry.type === "MultiPolygon"));
    if (poly) {
      setCoords(geoJSONPolygonToLatLngArray(poly.geometry.type === "Polygon" ? poly.geometry : { coordinates: poly.geometry.coordinates[0] }));
    } else {
      setCoords([]);
    }
  }

  // SEARCH (Nominatim)
  async function handleSearch() {
    if (!searchQuery) return;
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url, { headers: { "Accept-Language": "en" } });
      const results = await res.json();
      if (results && results.length > 0) {
        const r = results[0];
        const lat = parseFloat(r.lat);
        const lon = parseFloat(r.lon);
        const map = mapRef.current;
        if (map) map.setView([lat, lon], 16);
        setMarkers(prev => [...prev, [lat, lon]]);
      } else {
        alert("No results found");
      }
    } catch (err) {
      console.error(err);
      alert("Search failed — check network");
    }
  }

  // PHOTO EXIF / fallback
  function tryBrowserGeolocation() {
    return new Promise((resolve, reject) => {
      if (!("geolocation" in navigator)) return reject(new Error("Geolocation unavailable"));
      navigator.geolocation.getCurrentPosition(pos => resolve([pos.coords.latitude, pos.coords.longitude]), err => reject(err), { enableHighAccuracy: true, timeout: 10000 });
    });
  }

  async function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    try {
      const gps = await exifr.gps(file);
      if (gps && gps.latitude && gps.longitude) {
        setPhotoGeo([gps.latitude, gps.longitude]);
        setMarkers(prev => [...prev, [gps.latitude, gps.longitude]]);
        if (mapRef.current) mapRef.current.setView([gps.latitude, gps.longitude], 16);
      } else {
        try {
          const devicePos = await tryBrowserGeolocation();
          setPhotoGeo(devicePos);
          setMarkers(prev => [...prev, devicePos]);
          if (mapRef.current) mapRef.current.setView(devicePos, 16);
          alert("Photo has no EXIF GPS — used device GPS as fallback.");
        } catch (err) {
          console.warn("Geolocation failed", err);
          alert("Photo has no GPS EXIF and device location was not available — please mark location on the map.");
        }
      }
    } catch (err) {
      console.warn("EXIF read failed", err);
    }
  }

  // POINT MODE controls
  function startPointMode() {
    setTempPoints([]);
    setPointMode(true);
    // focus user attention
    alert("Point mode: Click on the map to add vertices. Press 'Finish Polygon' when done.");
  }

  function finishPolygonFromPoints() {
    if (tempPoints.length < 3) {
      alert("You need at least 3 points to form a polygon.");
      return;
    }
    // set finalized coords and clear temp points
    setCoords(tempPoints);
    setTempPoints([]);
    setPointMode(false);
    // add polygon to featureGroup visually by creating L.polygon and adding to FG (optional)
    const fg = fgRef.current;
    const map = mapRef.current;
    if (fg && map) {
      // create leafet polygon and add to FG so EditControl can edit/delete it
      const polygonLayer = L.polygon(tempPoints);
      fg.addLayer(polygonLayer);
      // ensure map view fits polygon bounds
      map.fitBounds(polygonLayer.getBounds(), { padding: [20, 20] });
    }
  }

  function cancelPointMode() {
    setTempPoints([]);
    setPointMode(false);
  }

  function clearAll() {
    setCoords([]);
    setMarkers([]);
    setCalculatedAreaSqM(0);
    setTempPoints([]);
    setPointMode(false);
    const fg = fgRef.current;
    if (fg && fg._layers) {
      Object.keys(fg._layers).forEach(k => fg.removeLayer(fg._layers[k]));
    }
  }

  function copyJSON() {
    const data = { plotName, description, userProvidedArea: areaInput, calculatedAreaSqM, polygonCoordinates: coords, markers, photoGeo, photoFile: photoFile ? photoFile.name : null };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => alert("Copied JSON to clipboard"));
  }

  function sqmToHa(sqm) { return (sqm / 10000).toFixed(3); }
  function sqmToAcres(sqm) { return (sqm / 4046.85642).toFixed(3); }

  function handleSubmit(e) {
    e.preventDefault();
    const payload = { plotName, description, userProvidedArea: areaInput, calculatedAreaSqM, polygonCoordinates: coords, markers, photo: photoFile ? photoFile.name : null, photoGeo, submittedAt: new Date().toISOString() };
    console.log("SUBMIT", payload);
    alert("Submitted — check console");
  }

  return (
    <div>
      <div className="container my-4">
        <div className="row gx-3">
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5 className="card-title text-success">Plot Details</h5>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Plot Name</label>
                    <input className="form-control" value={plotName} onChange={e => setPlotName(e.target.value)} placeholder="e.g. North Field" required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea className="form-control" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Area (optional)</label>
                    <input className="form-control" value={areaInput} onChange={e => setAreaInput(e.target.value)} placeholder="e.g. 1.25 ha or 12500 sq.m" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Upload plot photo</label>
                    <input type="file" accept="image/*" className="form-control" onChange={handlePhotoChange} />
                    {photoPreview && (
                      <div className="mt-2 d-flex gap-2 align-items-center">
                        <img src={photoPreview} alt="preview" style={{ width: 120, height: 80, objectFit: "cover", borderRadius: 8 }} />
                        <div className="small">Photo geo: {photoGeo ? `${photoGeo[0].toFixed(6)}, ${photoGeo[1].toFixed(6)}` : "not set"}</div>
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success">Save Plot</button>
                    <button type="button" className="btn btn-outline-secondary" onClick={clearAll}>Clear</button>
                  </div>
                </form>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h6 className="text-muted">Quick Stats</h6>
                <div className="row text-center">
                  <div className="col-4">
                    <div className="fw-bold">{coords.length >= 3 ? coords.length : "-"}</div>
                    <div className="small text-muted">Polygon pts</div>
                  </div>
                  <div className="col-4">
                    <div className="fw-bold">{markers.length + tempPoints.length}</div>
                    <div className="small text-muted">Markers (incl. temp)</div>
                  </div>
                  <div className="col-4">
                    <div className="fw-bold">{photoGeo ? "Yes" : "No"}</div>
                    <div className="small text-muted">Photo geo</div>
                  </div>
                </div>

                <div className="mt-3 small text-muted">
                  Calculated area: <strong>{calculatedAreaSqM}</strong> sq.m {calculatedAreaSqM ? `(~ ${sqmToHa(calculatedAreaSqM)} ha / ${sqmToAcres(calculatedAreaSqM)} acres)` : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Map col */}
          <div className="col-12 col-lg-6">
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <div className="d-flex mb-2">
                  <input className="form-control me-2" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search location" />
                  <button className="btn btn-warning me-2" onClick={handleSearch}>Search</button>
                  <button className="btn btn-outline-secondary" onClick={() => setSearchQuery("")}>Reset</button>
                </div>

                <div style={{ marginBottom: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {/* point mode controls */}
                  {!pointMode ? (
                    <button className="btn btn-sm btn-outline-primary" onClick={startPointMode}>Start Point Mode</button>
                  ) : (
                    <>
                      <button className="btn btn-sm btn-success" onClick={finishPolygonFromPoints}>Finish Polygon</button>
                      <button className="btn btn-sm btn-outline-secondary" onClick={cancelPointMode}>Cancel Points</button>
                    </>
                  )}

                  <button className="btn btn-sm btn-light" onClick={() => alert("Use the draw toolbar (top-left) to draw polygon/rectangle or use point mode to click points.")}>Toolbar tip</button>
                  <button className="btn btn-sm btn-light" onClick={() => {
                    if (!("geolocation" in navigator)) return alert("Geolocation not supported");
                    navigator.geolocation.getCurrentPosition(pos => {
                      const lat = pos.coords.latitude; const lng = pos.coords.longitude;
                      setMarkers(prev => [...prev, [lat, lng]]);
                      if (mapRef.current) mapRef.current.setView([lat, lng], 16);
                    }, err => alert("Device location failed or permission denied"));
                  }}>Locate</button>

                  <button className="btn btn-sm btn-outline-danger" onClick={clearAll}>Clear shapes</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={copyJSON}>Copy JSON</button>
                </div>

                <div style={{ height: 420, borderRadius: 8, overflow: "hidden", position: "relative" }}>
                  <MapContainer center={[20.5937, 78.9629]} zoom={5} whenCreated={map => { mapRef.current = map; setTimeout(() => map.invalidateSize(), 200); }} style={{ height: "100%", width: "100%" }}>
                    <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                    <FeatureGroup ref={fgRef}>
                      <EditControl position="topleft"
                        onCreated={onCreated}
                        onEdited={onEdited}
                        onDeleted={onDeleted}
                        draw={{
                          rectangle: true,
                          polygon: true,
                          circle: false,
                          polyline: false,
                          marker: false,
                          circlemarker: false
                        }}
                        edit={{
                          edit: true,
                          remove: true
                        }}
                      />
                    </FeatureGroup>

                    <MapClickHandler />

                    {/* show regular markers */}
                    {markers.map((m, i) => <Marker key={`m-${i}`} position={m} />)}

                    {/* show temp points as small markers (while in pointMode) */}
                    {tempPoints.map((p, i) => <Marker key={`tp-${i}`} position={p} />)}

                    {/* preview polyline/polygon while drawing points */}
                    {tempPoints.length >= 2 && tempPoints.length < 3 && <Polyline positions={tempPoints} pathOptions={{ color: "#ff9900", dashArray: "6" }} />}
                    {tempPoints.length >= 3 && <Polygon positions={tempPoints} pathOptions={{ color: "#ff9900", weight: 2, dashArray: null, fillOpacity: 0.15 }} />}

                    {/* show finalized polygon */}
                    {coords.length >= 3 && <Polygon positions={coords} pathOptions={{ color: "#2e7d32", weight: 2, fillOpacity: 0.2 }} />}
                  </MapContainer>
                </div>

                <div className="mt-2 small text-muted">Use draw tools (top-left) OR point mode to click points and build a polygon.</div>
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-body">
                <h6>Preview JSON</h6>
                <pre style={{ maxHeight: 220, overflow: "auto", background: "#f8f9fa", padding: 10, borderRadius: 6, fontSize: 13 }}>
{JSON.stringify({ plotName, description, userProvidedArea: areaInput, calculatedAreaSqM, polygonCoordinates: coords, tempPoints, markers, photoGeo, photoFile: photoFile ? photoFile.name : null }, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}