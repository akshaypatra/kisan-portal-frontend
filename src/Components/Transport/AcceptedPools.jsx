import React, { useState, useEffect } from 'react';
import { FaTruck, FaCheckCircle, FaMapMarkerAlt, FaUsers, FaClock } from 'react-icons/fa';
import { GoogleMap, Marker, DirectionsRenderer, useJsApiLoader } from '@react-google-maps/api';
import api from '../../services/api';
import CONFIG from '../../config';

const libraries = ['places'];

const mapContainerStyle = {
  width: '100%',
  height: '300px',
  borderRadius: '8px'
};

export default function AcceptedPools({ vehicles }) {
  const [acceptedPools, setAcceptedPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedPool, setExpandedPool] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: CONFIG.GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    fetchAcceptedPools();
    const interval = setInterval(fetchAcceptedPools, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAcceptedPools = async () => {
    setLoading(true);
    try {
      // Get all accepted bookings for the current transporter
      const res = await api.get('/api/transport/bookings');
      console.log('All bookings:', res.data);

      const bookings = res.data || [];

      // Debug: Check first booking structure
      if (bookings.length > 0) {
        console.log('Sample booking fields:', Object.keys(bookings[0]));
        console.log('Sample booking data:', bookings[0]);
      }

      // Filter accepted pooling bookings and group by pool_route_id
      const pooledBookings = bookings.filter(
        b => b.booking_type === 'pooling' && b.status === 'accepted' && b.pool_route_id
      );

      console.log('Filtered pooled bookings:', pooledBookings);

      // Group by pool_route_id
      const pools = {};
      pooledBookings.forEach(booking => {
        if (!pools[booking.pool_route_id]) {
          pools[booking.pool_route_id] = [];
        }
        pools[booking.pool_route_id].push(booking);
      });

      console.log('Grouped pools:', pools);

      // Convert to array format
      const poolsArray = Object.keys(pools).map(poolId => ({
        pool_route_id: poolId,
        bookings: pools[poolId],
        vehicle: pools[poolId][0]?.vehicle || null,
      }));

      setAcceptedPools(poolsArray);
    } catch (err) {
      console.error('Failed to fetch accepted pools:', err);
    }
    setLoading(false);
  };

  const getTotalQuantity = (bookings) => {
    return bookings.reduce((sum, b) => sum + parseFloat(b.quantity || 0), 0);
  };

  const getPickupLocations = (bookings) => {
    return bookings.map(b => ({
      lat: b.pickup_lat,
      lng: b.pickup_lng,
      farmer: b.farmer_name,
      quantity: b.quantity
    })).filter(loc => loc.lat && loc.lng);
  };

  const getDropLocation = (bookings) => {
    const firstBooking = bookings[0];
    if (firstBooking?.drop_lat && firstBooking?.drop_lng) {
      return {
        lat: firstBooking.drop_lat,
        lng: firstBooking.drop_lng,
        address: firstBooking.drop_location
      };
    }
    return null;
  };

  if (loading && acceptedPools.length === 0) {
    return <div className="text-center py-4">Loading accepted pools...</div>;
  }

  if (acceptedPools.length === 0) {
    return (
      <div className="alert alert-secondary">
        <FaClock className="me-2" />
        No accepted pools yet. Accept poolable routes to see them here.
      </div>
    );
  }

  return (
    <div className="accepted-pools">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">
          <FaCheckCircle className="text-success me-2" />
          Accepted Pool Bookings
        </h5>
        <span className="badge bg-success">{acceptedPools.length} pools</span>
      </div>

      <p className="text-muted small mb-3">
        Your accepted pool bookings. Complete the deliveries and mark them as delivered.
      </p>

      <div className="row">
        {acceptedPools.map((pool) => {
          const totalQuantity = getTotalQuantity(pool.bookings);
          const pickupLocations = getPickupLocations(pool.bookings);
          const dropLocation = getDropLocation(pool.bookings);
          const isExpanded = expandedPool === pool.pool_route_id;

          return (
            <div key={pool.pool_route_id} className="col-12 mb-3">
              <div className="card shadow-sm border-success" style={{ borderLeftWidth: '5px' }}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="card-title mb-0">
                      <FaTruck className="me-2 text-success" />
                      Pool: {pool.pool_route_id}
                    </h6>
                    <span className="badge bg-success">Accepted</span>
                  </div>

                  {pool.vehicle && (
                    <div className="mb-2">
                      <small className="text-muted">
                        Vehicle: <strong>{pool.vehicle.vehicle_number}</strong> ({pool.vehicle.vehicle_type})
                      </small>
                    </div>
                  )}

                  <div className="mb-3">
                    <div className="d-flex justify-content-between text-sm">
                      <span>
                        <FaUsers className="me-1" />
                        {pool.bookings.length} farmer{pool.bookings.length > 1 ? 's' : ''}
                      </span>
                      <span className="fw-bold text-success">{totalQuantity.toFixed(1)} tons</span>
                    </div>
                  </div>

                  {/* Farmers List */}
                  <div className="mb-3">
                    <small className="text-muted fw-bold">Pickup List:</small>
                    <ul className="list-unstyled mb-0 ms-3">
                      {pool.bookings.map((booking, idx) => (
                        <li key={booking.id} className="small">
                          {idx + 1}. {booking.farmer_name} - {booking.quantity.toFixed(1)} tons
                          <br />
                          <span className="text-muted">{booking.plot_name || 'Plot'}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Drop Location */}
                  {dropLocation && (
                    <div className="mb-3 p-2 bg-light rounded">
                      <small className="text-muted fw-bold d-block mb-1">
                        <FaMapMarkerAlt className="text-danger me-1" />
                        Drop Location:
                      </small>
                      <small className="d-block">{dropLocation.address}</small>
                    </div>
                  )}

                  {/* Toggle Map Button */}
                  <button
                    className="btn btn-sm btn-outline-primary w-100 mb-2"
                    onClick={() => setExpandedPool(isExpanded ? null : pool.pool_route_id)}
                  >
                    {isExpanded ? 'Hide Map' : 'Show Route Map'}
                  </button>

                  {/* Map */}
                  {isExpanded && isLoaded && pickupLocations.length > 0 && dropLocation && (
                    <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={{ lat: pickupLocations[0].lat, lng: pickupLocations[0].lng }}
                        zoom={10}
                      >
                        {/* Pickup Markers */}
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

                        {/* Drop Marker */}
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
                      </GoogleMap>
                    </div>
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
