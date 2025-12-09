import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NewBookTransportSimple from '../../Components/Transport/NewBookTransportSimple';
import AIAdvisoryBanner from '../../Components/Common/AIAdvisoryBanner';

export default function NewBookTransportPage() {
  const [farmerId, setFarmerId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (!userData.id || userData.role !== 'farmer') {
      navigate('/login');
      return;
    }
    setFarmerId(userData.id);
  }, [navigate]);

  if (!farmerId) {
    return <div className="container py-5 text-center">Loading...</div>;
  }

  return (
    <div className="container py-4">
      <AIAdvisoryBanner />

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <NewBookTransportSimple farmerId={farmerId} />
        </div>
      </div>
    </div>
  );
}
