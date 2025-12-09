import React, { useState, useEffect } from 'react';
import { FaTruck, FaMapMarkedAlt, FaUsers, FaCheckCircle, FaClock } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function PoolableRoutes({ vehicles }) {
  const [poolableRoutes, setPoolableRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [accepting, setAccepting] = useState(null);

  useEffect(() => {
    fetchPoolableRoutes();
    // Refresh every 30 seconds
    const interval = setInterval(fetchPoolableRoutes, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPoolableRoutes = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/transport/poolable-routes');
      setPoolableRoutes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch poolable routes:', err);
    }
    setLoading(false);
  };

  const handleAcceptPool = async (poolRouteId) => {
    setAccepting(poolRouteId);
    try {
      await api.post(`/api/transport/poolable-routes/${poolRouteId}/accept`);
      alert('Pool accepted successfully! All bookings have been assigned to your vehicle.');
      fetchPoolableRoutes(); // Refresh list
    } catch (err) {
      console.error('Failed to accept pool:', err);
      const msg = err?.response?.data?.detail || 'Failed to accept pool';
      alert(msg);
    }
    setAccepting(null);
  };

  const getTotalDistance = (pickups, drop) => {
    // Simple estimation: sum of distances from each pickup to drop
    let total = 0;
    pickups.forEach((pickup) => {
      const R = 6371; // Earth radius in km
      const dLat = (drop.lat - pickup.lat) * (Math.PI / 180);
      const dLng = (drop.lng - pickup.lng) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(pickup.lat * (Math.PI / 180)) *
          Math.cos(drop.lat * (Math.PI / 180)) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      total += R * c;
    });
    return total.toFixed(1);
  };

  const getEstimatedEarnings = (totalKm) => {
    const pricePerKm = 10; // Rs 10 per km
    return (totalKm * pricePerKm).toFixed(0);
  };

  if (loading && poolableRoutes.length === 0) {
    return <div className="text-center py-4">Loading poolable routes...</div>;
  }

  if (poolableRoutes.length === 0) {
    return (
      <div className="alert alert-info">
        <FaClock className="me-2" />
        No poolable routes available right now. Check back soon!
      </div>
    );
  }

  return (
    <div className="poolable-routes">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">
          <FaUsers className="text-success me-2" />
          Poolable Routes
        </h5>
        <span className="badge bg-success">{poolableRoutes.length} pools</span>
      </div>

      <p className="text-muted small mb-3">
        Multiple farmers going to similar destinations. Accept a pool to pick up all farmers in one trip.
      </p>

      <div className="row">
        {poolableRoutes.map((pool) => {
          const stats = pool.stats || {};
          const totalQuantity = Number(stats.total_quantity) || 0;
          const bookingsCount = stats.bookings_count || 0;
          const pickupLocations = stats.pickup_locations || [];
          const dropLocation = stats.drop_location || {};
          const recommendedVehicle = stats.recommended_vehicle || 'tempo';
          const totalKm = getTotalDistance(pickupLocations, dropLocation);
          const earnings = getEstimatedEarnings(totalKm);

          // Check if volume is acceptable (> 1.67 tons)
          const isAcceptable = totalQuantity >= 1.67;

          return (
            <div key={pool.pool_route_id} className="col-md-6 mb-3">
              <div
                className={`card shadow-sm border-${isAcceptable ? 'success' : 'warning'}`}
                style={{ borderLeftWidth: '5px' }}
              >
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="card-title mb-0">
                      <FaTruck className="me-2 text-primary" />
                      Pool: {pool.pool_route_id}
                    </h6>
                    {isAcceptable ? (
                      <span className="badge bg-success">Ready</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Low Volume</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-sm">
                      <span>
                        <FaUsers className="me-1" />
                        {bookingsCount} farmer{bookingsCount > 1 ? 's' : ''}
                      </span>
                      <span className="fw-bold text-success">{totalQuantity.toFixed(1)} tons</span>
                    </div>
                    <div className="progress mt-2" style={{ height: '8px' }}>
                      <div
                        className={`progress-bar ${isAcceptable ? 'bg-success' : 'bg-warning'}`}
                        style={{ width: `${Math.min((totalQuantity / 5) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <small className="text-muted">Capacity: {totalQuantity.toFixed(1)}/5.0 tons</small>
                  </div>

                  {/* Farmers List */}
                  <div className="mb-3">
                    <small className="text-muted fw-bold">Farmers:</small>
                    <ul className="list-unstyled mb-0 ms-3">
                      {pool.bookings.map((booking) => (
                        <li key={booking.id} className="small">
                          • {booking.farmer_name} - {booking.quantity.toFixed(1)} tons
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Route Info */}
                  <div className="mb-3 p-2 bg-light rounded">
                    <small className="text-muted fw-bold d-block mb-1">Route Summary:</small>
                    <small className="d-block">
                      <FaMapMarkedAlt className="text-success me-1" />
                      {pickupLocations.length} pickup{pickupLocations.length > 1 ? 's' : ''} → {dropLocation.address || 'Drop point'}
                    </small>
                    <small className="d-block text-muted">
                      Est. Distance: ~{totalKm} km | Earnings: ₹{earnings}
                    </small>
                  </div>

                  {/* Recommended Vehicle */}
                  <div className="mb-3">
                    <small className="text-muted">
                      Recommended: <span className="badge bg-info">{recommendedVehicle.toUpperCase()}</span>
                    </small>
                  </div>

                  {/* Map Preview */}
                  {pickupLocations.length > 0 && dropLocation.lat && (
                    <div className="mb-3" style={{ height: '200px', borderRadius: '8px', overflow: 'hidden' }}>
                      <MapContainer
                        center={[pickupLocations[0].lat, pickupLocations[0].lng]}
                        zoom={10}
                        style={{ height: '100%', width: '100%' }}
                      >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {pickupLocations.map((pickup, idx) => (
                          <Marker key={idx} position={[pickup.lat, pickup.lng]} icon={greenIcon}>
                            <Popup>
                              <strong>{pickup.farmer}</strong>
                              <br />
                              Pickup: {pickup.quantity} tons
                            </Popup>
                          </Marker>
                        ))}
                        <Marker position={[dropLocation.lat, dropLocation.lng]} icon={redIcon}>
                          <Popup>
                            <strong>Drop Location</strong>
                            <br />
                            {dropLocation.address}
                          </Popup>
                        </Marker>
                        {/* Draw route lines */}
                        {pickupLocations.map((pickup, idx) => (
                          <Polyline
                            key={idx}
                            positions={[
                              [pickup.lat, pickup.lng],
                              [dropLocation.lat, dropLocation.lng],
                            ]}
                            color="blue"
                            weight={2}
                            opacity={0.5}
                          />
                        ))}
                      </MapContainer>
                    </div>
                  )}

                  {/* Accept Button */}
                  {isAcceptable ? (
                    <button
                      className="btn btn-success w-100"
                      onClick={() => handleAcceptPool(pool.pool_route_id)}
                      disabled={accepting === pool.pool_route_id}
                    >
                      {accepting === pool.pool_route_id ? (
                        'Accepting...'
                      ) : (
                        <>
                          <FaCheckCircle className="me-2" />
                          Accept Pool ({bookingsCount} bookings)
                        </>
                      )}
                    </button>
                  ) : (
                    <button className="btn btn-outline-warning w-100" disabled>
                      <FaClock className="me-2" />
                      Waiting for more farmers ({totalQuantity.toFixed(1)}/1.67 tons)
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
