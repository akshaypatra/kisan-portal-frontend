import React, { useState, useEffect } from 'react';
import { FaMapMarkerAlt, FaTruck, FaUsers, FaInfoCircle } from 'react-icons/fa';
import api from '../../services/api';

export default function NewBookTransportSimple({ farmerId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [plots, setPlots] = useState([]);
  const [storages, setStorages] = useState([]);

  const [form, setForm] = useState({
    plot_id: '',
    booking_type: 'pooling', // 'pooling' or 'separate'
    pickup_location: '',
    pickup_lat: null,
    pickup_lng: null,
    drop_location: '',
    drop_lat: null,
    drop_lng: null,
    storage_facility_id: null,
    shipping_date: '',
    shipping_time: '',
    crops: [],
  });

  // Fetch user plots
  useEffect(() => {
    const fetchPlots = async () => {
      if (!farmerId) {
        console.log('No farmerId provided, skipping plot fetch');
        return;
      }
      try {
        console.log(`Fetching plots for farmer ID: ${farmerId}`);
        const res = await api.get(`/api/plots/with-cycles/${farmerId}`);
        console.log('Plots fetched:', res.data);
        setPlots(res.data || []);
      } catch (err) {
        console.error('Failed to fetch plots:', err);
        setError(`Failed to load plots: ${err?.response?.data?.detail || err.message}`);
      }
    };
    fetchPlots();
  }, [farmerId]);

  // Fetch storage facilities
  useEffect(() => {
    const fetchStorages = async () => {
      try {
        const res = await api.get('/api/storage/facilities');
        setStorages(res.data || []);
      } catch (err) {
        console.error('Failed to fetch storage facilities:', err);
      }
    };
    fetchStorages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlotSelect = (e) => {
    const plotId = e.target.value;
    setForm((prev) => ({ ...prev, plot_id: plotId }));

    // Auto-fill pickup from plot
    const selectedPlot = plots.find((p) => p.id === parseInt(plotId));
    if (selectedPlot) {
      // Get plot center from markers or polygon
      let lat = null, lng = null;
      if (selectedPlot.markers && selectedPlot.markers.length > 0) {
        lat = selectedPlot.markers[0].lat;
        lng = selectedPlot.markers[0].lng;
      } else if (selectedPlot.polygon_coordinates?.coordinates?.[0]) {
        const coords = selectedPlot.polygon_coordinates.coordinates[0];
        const lats = coords.map(c => c[1]);
        const lngs = coords.map(c => c[0]);
        lat = lats.reduce((a, b) => a + b, 0) / lats.length;
        lng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
      }

      // Load crops from plot's crop cycles
      const activeCrops = (selectedPlot.crop_cycles || [])
        .filter(cycle => cycle.status && cycle.status.toLowerCase() !== 'harvested')
        .map(cycle => ({
          name: cycle.crop_name,
          quantity: 0, // Farmer will enter quantity
          cycle_id: cycle.id,
          status: cycle.status
        }));

      setForm((prev) => ({
        ...prev,
        pickup_location: lat && lng ? `${selectedPlot.plot_name} (${lat.toFixed(4)}, ${lng.toFixed(4)})` : selectedPlot.plot_name,
        pickup_lat: lat,
        pickup_lng: lng,
        crops: activeCrops.length > 0 ? activeCrops : [{ name: '', quantity: 0 }], // Fallback to manual entry if no crops
      }));
    }
  };

  const handleStorageSelect = (e) => {
    const storageId = e.target.value;
    const storage = storages.find(s => s.id === parseInt(storageId));

    if (storage) {
      setForm((prev) => ({
        ...prev,
        storage_facility_id: storage.id,
        drop_location: `${storage.name}, ${storage.city}`,
        drop_lat: storage.latitude,
        drop_lng: storage.longitude,
      }));
    }
  };

  const handleCropChange = (index, field, value) => {
    const updatedCrops = [...form.crops];
    updatedCrops[index] = { ...updatedCrops[index], [field]: value };
    setForm((prev) => ({ ...prev, crops: updatedCrops }));
  };

  const addCrop = () => {
    setForm((prev) => ({
      ...prev,
      crops: [...prev.crops, { name: '', quantity: 0 }],
    }));
  };

  const removeCrop = (index) => {
    setForm((prev) => ({
      ...prev,
      crops: prev.crops.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (!form.plot_id || !form.pickup_location || !form.drop_location || !form.shipping_date || !form.shipping_time) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    const chosenCrops = form.crops.filter((c) => c.name && c.quantity > 0);
    if (chosenCrops.length === 0) {
      setError('Add at least one crop with quantity');
      setLoading(false);
      return;
    }

    try {
      const selectedPlot = plots.find((p) => p.id === parseInt(form.plot_id));
      const payload = {
        plot_id: parseInt(form.plot_id),
        plot_name: selectedPlot?.plot_name || '',
        crops: chosenCrops,
        is_shared: form.booking_type === 'pooling',
        drop_location: form.drop_location,
        drop_lat: form.drop_lat,
        drop_lng: form.drop_lng,
        storage_facility_id: form.storage_facility_id,
        pickup_lat: form.pickup_lat,
        pickup_lng: form.pickup_lng,
        shipping_date: form.shipping_date,
        shipping_time: form.shipping_time,
      };

      const res = await api.post('/api/transport/bookings', payload);

      if (res?.data) {
        // Check for pooling info
        const poolingInfo = res.data.pooling_info;
        if (poolingInfo) {
          if (poolingInfo.is_low_volume) {
            setSuccess(`⏳ ${poolingInfo.message} (Volume below minimum threshold)`);
          } else {
            setSuccess(`✅ ${poolingInfo.message}`);
          }
        } else {
          setSuccess('✅ Transport booking created successfully!');
        }

        // Reset form
        setForm({
          plot_id: '',
          booking_type: 'pooling',
          pickup_location: '',
          pickup_lat: null,
          pickup_lng: null,
          drop_location: '',
          drop_lat: null,
          drop_lng: null,
          storage_facility_id: null,
          shipping_date: '',
          shipping_time: '',
          crops: [],
        });
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.detail || err?.response?.data?.message || 'Failed to create booking.';
      setError(msg);
    }

    setLoading(false);
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">
            <FaTruck className="me-2 text-success" />
            Book Transport
          </h5>
        </div>

        <p className="text-muted small mb-3">
          Select pickup and drop locations, choose your crops, and request transport.
        </p>

        <div className="alert alert-info py-2 d-flex align-items-start gap-2 mb-3">
          <FaInfoCircle className="mt-1" />
          <div className="small">
            <strong>Pooling:</strong> Share transport with other farmers for lower cost. System automatically matches routes within 30km.
            <br />
            <strong>Separate:</strong> Dedicated vehicle just for you.
          </div>
        </div>

        {error && <div className="alert alert-warning py-2">{error}</div>}
        {success && <div className="alert alert-success py-2">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* Booking Type */}
          <div className="mb-3">
            <label className="form-label small text-muted">Booking Type</label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn ${form.booking_type === 'pooling' ? 'btn-success' : 'btn-outline-success'}`}
                onClick={() => setForm((p) => ({ ...p, booking_type: 'pooling' }))}
              >
                <FaUsers className="me-1" /> Pooling (Shared)
              </button>
              <button
                type="button"
                className={`btn ${form.booking_type === 'separate' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setForm((p) => ({ ...p, booking_type: 'separate' }))}
              >
                <FaTruck className="me-1" /> Separate
              </button>
            </div>
          </div>

          {/* Plot Selection */}
          <div className="mb-3">
            <label className="form-label small text-muted">Select Plot *</label>
            <select className="form-select" value={form.plot_id} onChange={handlePlotSelect} required>
              <option value="">Choose plot...</option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.plot_name} - {p.user_provided_area} acres
                </option>
              ))}
            </select>
          </div>

          {/* Pickup Location (Auto-filled from plot) */}
          <div className="mb-3">
            <label className="form-label small text-muted">
              <FaMapMarkerAlt className="text-success me-1" />
              Pickup Location *
            </label>
            <input
              type="text"
              className="form-control"
              value={form.pickup_location}
              readOnly
              placeholder="Select a plot first..."
            />
            {form.pickup_lat && form.pickup_lng && (
              <small className="text-muted">
                📍 {form.pickup_lat.toFixed(4)}, {form.pickup_lng.toFixed(4)}
              </small>
            )}
          </div>

          {/* Drop Location (Storage Facility) */}
          <div className="mb-3">
            <label className="form-label small text-muted">
              <FaMapMarkerAlt className="text-danger me-1" />
              Drop Location (Storage Facility) *
            </label>
            <select
              className="form-select"
              value={form.storage_facility_id || ''}
              onChange={handleStorageSelect}
              required
            >
              <option value="">Choose storage facility...</option>
              {storages.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.city}, {s.state}
                </option>
              ))}
            </select>
            {form.drop_lat && form.drop_lng && (
              <small className="text-muted">
                📍 {form.drop_lat.toFixed(4)}, {form.drop_lng.toFixed(4)}
              </small>
            )}
          </div>

          {/* Shipping Date & Time */}
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label small text-muted">Shipping Date *</label>
              <input
                type="date"
                className="form-control"
                name="shipping_date"
                value={form.shipping_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6">
              <label className="form-label small text-muted">Preferred Time *</label>
              <input
                type="time"
                className="form-control"
                name="shipping_time"
                value={form.shipping_time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Crops */}
          <div className="mb-3">
            <label className="form-label small text-muted">Crops to Transport *</label>
            {form.crops.map((crop, index) => (
              <div key={index} className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Crop name"
                  value={crop.name}
                  onChange={(e) => handleCropChange(index, 'name', e.target.value)}
                />
                <input
                  type="number"
                  className="form-control"
                  placeholder="Quantity (quintals)"
                  value={crop.quantity}
                  onChange={(e) => handleCropChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                  step="0.1"
                  min="0"
                />
                <button type="button" className="btn btn-outline-danger" onClick={() => removeCrop(index)}>
                  Remove
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-sm btn-outline-success" onClick={addCrop}>
              + Add Crop
            </button>
          </div>

          {/* Submit */}
          <div className="d-grid">
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Creating Booking...' : 'Book Transport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
