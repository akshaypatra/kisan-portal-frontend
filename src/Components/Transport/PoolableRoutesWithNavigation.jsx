import React, { useState, useEffect, useCallback } from 'react';
import { FaTruck, FaMapMarkedAlt, FaUsers, FaCheckCircle, FaClock, FaRoute } from 'react-icons/fa';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import api from '../../services/api';
import CONFIG from '../../config';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '8px'
};

const defaultCenter = {
  lat: 18.5204,
  lng: 73.8567
};

function PoolableRoutesContent({ vehicles }) {
  const [poolableRoutes, setPoolableRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accepting, setAccepting] = useState(null);
  const [directionsResponses, setDirectionsResponses] = useState({});

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: CONFIG.GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    fetchPoolableRoutes();
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

  const calculateRoute = useCallback(async (pickupLocations, dropLocation, poolRouteId) => {
    if (!isLoaded || !window.google || !window.google.maps) {
      console.error('Google Maps not loaded yet');
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();

    if (pickupLocations.length === 0 || !dropLocation.lat || !dropLocation.lng) {
      return;
    }

    // If only one pickup, simple route
    if (pickupLocations.length === 1) {
      const origin = new window.google.maps.LatLng(pickupLocations[0].lat, pickupLocations[0].lng);
      const destination = new window.google.maps.LatLng(dropLocation.lat, dropLocation.lng);

      try {
        const result = await directionsService.route({
          origin,
          destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        });

        setDirectionsResponses(prev => ({
          ...prev,
          [poolRouteId]: result
        }));
      } catch (error) {
        console.error('Error calculating route:', error);
      }
    } else {
      // Multiple pickups - use waypoints
      const origin = new window.google.maps.LatLng(pickupLocations[0].lat, pickupLocations[0].lng);
      const destination = new window.google.maps.LatLng(dropLocation.lat, dropLocation.lng);

      // Use other pickups as waypoints (max 8 waypoints for free API)
      const waypoints = pickupLocations.slice(1, 9).map(loc => ({
        location: new window.google.maps.LatLng(loc.lat, loc.lng),
        stopover: true
      }));

      try {
        const result = await directionsService.route({
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true, // Optimize the route order
          travelMode: window.google.maps.TravelMode.DRIVING,
        });

        setDirectionsResponses(prev => ({
          ...prev,
          [poolRouteId]: result
        }));
      } catch (error) {
        console.error('Error calculating route:', error);
      }
    }
  }, [isLoaded]);

  const handleAcceptPool = async (poolRouteId) => {
    setAccepting(poolRouteId);
    try {
      await api.post(`/api/transport/poolable-routes/${poolRouteId}/accept`);
      alert('Pool accepted successfully! All bookings have been assigned to your vehicle.');
      fetchPoolableRoutes();
    } catch (err) {
      console.error('Failed to accept pool:', err);
      const msg = err?.response?.data?.detail || 'Failed to accept pool';
      alert(msg);
    }
    setAccepting(null);
  };

  const getEstimatedEarnings = (directions, vehicleType = 'tempo') => {
    if (!directions || !directions.routes || !directions.routes[0]) {
      return '0';
    }
    const totalDistance = directions.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const totalKm = totalDistance / 1000;
    // Tempo: ₹26/km, Truck: ₹65/km
    const pricePerKm = vehicleType === 'truck' ? 65 : 26;
    return (totalKm * pricePerKm).toFixed(0);
  };

  const getTotalDistance = (directions) => {
    if (!directions || !directions.routes || !directions.routes[0]) {
      return '0';
    }
    const totalDistance = directions.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    return (totalDistance / 1000).toFixed(1);
  };

  const getTotalDuration = (directions) => {
    if (!directions || !directions.routes || !directions.routes[0]) {
      return '0 mins';
    }
    const totalDuration = directions.routes[0].legs.reduce((sum, leg) => sum + leg.duration.value, 0);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Calculate routes when pools are loaded and Google Maps is ready
  useEffect(() => {
    if (!isLoaded) return;

    poolableRoutes.forEach(pool => {
      const stats = pool.stats || {};
      const pickupLocations = stats.pickup_locations || [];
      const dropLocation = stats.drop_location || {};

      if (pickupLocations.length > 0 && dropLocation.lat && !directionsResponses[pool.pool_route_id]) {
        calculateRoute(pickupLocations, dropLocation, pool.pool_route_id);
      }
    });
  }, [poolableRoutes, isLoaded, calculateRoute, directionsResponses]);

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

  if (!isLoaded) {
    return <div className="text-center py-4">Loading Google Maps...</div>;
  }

  return (
    <div className="poolable-routes">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="mb-0">
            <FaUsers className="text-success me-2" />
            Poolable Routes with Navigation
          </h5>
          <span className="badge bg-success">{poolableRoutes.length} pools</span>
        </div>

        <p className="text-muted small mb-3">
          Multiple farmers going to similar destinations. Accept a pool to pick up all farmers in one trip.
          Routes are optimized for shortest distance.
        </p>

        <div className="row">
          {poolableRoutes.map((pool) => {
            const stats = pool.stats || {};
            const totalQuantity = Number(stats.total_quantity) || 0;
            const bookingsCount = stats.bookings_count || 0;
            const pickupLocations = stats.pickup_locations || [];
            const dropLocation = stats.drop_location || {};
            const recommendedVehicle = stats.recommended_vehicle || 'tempo';
            const directions = directionsResponses[pool.pool_route_id];
            const totalKm = getTotalDistance(directions);
            const earnings = getEstimatedEarnings(directions, recommendedVehicle);
            const duration = getTotalDuration(directions);

            const isAcceptable = totalQuantity >= 1.67;

            return (
              <div key={pool.pool_route_id} className="col-12 mb-4">
                <div
                  className={`card shadow-sm border-${isAcceptable ? 'success' : 'warning'}`}
                  style={{ borderLeftWidth: '5px' }}
                >
                  <div className="card-body">
                    <div className="row">
                      {/* Left Column - Details */}
                      <div className="col-md-5">
                        <div className="d-flex justify-content-between align-items-start mb-3">
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
                          <small className="text-muted fw-bold d-block mb-1">
                            <FaRoute className="me-1" />
                            Route Summary:
                          </small>
                          <small className="d-block">
                            <FaMapMarkedAlt className="text-success me-1" />
                            {pickupLocations.length} pickup{pickupLocations.length > 1 ? 's' : ''} → {dropLocation.address || 'Drop point'}
                          </small>
                          {directions && (
                            <>
                              <small className="d-block text-muted">
                                Distance: {totalKm} km | Duration: {duration}
                              </small>
                              <small className="d-block text-success fw-bold">
                                Estimated Earnings: ₹{earnings}
                              </small>
                            </>
                          )}
                        </div>

                        {/* Recommended Vehicle */}
                        <div className="mb-3">
                          <small className="text-muted">
                            Recommended: <span className="badge bg-info">{recommendedVehicle.toUpperCase()}</span>
                          </small>
                        </div>

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

                      {/* Right Column - Google Maps Navigation */}
                      <div className="col-md-7">
                        {pickupLocations.length > 0 && dropLocation.lat ? (
                          <div className="position-relative">
                            <GoogleMap
                              mapContainerStyle={mapContainerStyle}
                              center={
                                pickupLocations.length > 0
                                  ? { lat: pickupLocations[0].lat, lng: pickupLocations[0].lng }
                                  : defaultCenter
                              }
                              zoom={10}
                            >
                              {/* Show directions if calculated */}
                              {directions && (
                                <DirectionsRenderer
                                  directions={directions}
                                  options={{
                                    polylineOptions: {
                                      strokeColor: '#10b981',
                                      strokeWeight: 5,
                                      strokeOpacity: 0.8
                                    },
                                    suppressMarkers: false
                                  }}
                                />
                              )}

                              {/* If no directions yet, show basic markers */}
                              {!directions && (
                                <>
                                  {pickupLocations.map((pickup, idx) => (
                                    <Marker
                                      key={`pickup-${idx}`}
                                      position={{ lat: pickup.lat, lng: pickup.lng }}
                                      label={{
                                        text: `${idx + 1}`,
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}
                                      icon={{
                                        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
                                      }}
                                    />
                                  ))}
                                  <Marker
                                    position={{ lat: dropLocation.lat, lng: dropLocation.lng }}
                                    label={{
                                      text: 'D',
                                      color: 'white',
                                      fontWeight: 'bold'
                                    }}
                                    icon={{
                                      url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
                                    }}
                                  />
                                </>
                              )}
                            </GoogleMap>

                            {directions && (
                              <div className="mt-2 small text-muted">
                                <strong>Route Optimized:</strong> Pickups in order → Storage facility
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="d-flex align-items-center justify-content-center bg-light rounded" style={{ height: '400px' }}>
                            <p className="text-muted">No location data available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );
}

export default function PoolableRoutesWithNavigation({ vehicles }) {
  return <PoolableRoutesContent vehicles={vehicles} />;
}
