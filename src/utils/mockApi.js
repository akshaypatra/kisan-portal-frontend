export const mockLogin = (farmer_id, password) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          farmer_id: farmer_id,
          token: 'mock_jwt_token_' + Date.now(),
          farmer_name: 'Rajesh Kumar'
        }
      });
    }, 1000);
  });
};

export const mockSignup = (data) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          farmer_id: 'FRM' + Math.floor(Math.random() * 1000000),
          token: 'mock_jwt_token_' + Date.now(),
          farmer_name: data.farmer_name
        }
      });
    }, 1000);
  });
};

export const mockGetProfile = (farmer_id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          farmer_id: farmer_id,
          farmer_name: 'Rajesh Kumar',
          email: 'rajesh@example.com',
          phone_number: '9876543210',
          regionState: 'Maharashtra',
          landArea: '5.5',
          cropPreferences: ['Soybean', 'Sunflower'],
          location: { latitude: 18.5846, longitude: 73.9701 }
        }
      });
    }, 500);
  });
};

export const mockGetPlots = (farmer_id) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          plots: [
            {
              id: 1,
              plotName: "North Field",
              description: "Main crop field",
              calculatedAreaSqM: 6178,
              polygonCoordinates: [[18.5855, 73.9698], [18.5847, 73.9696]],
              photoFile: "field.jpg"
            }
          ]
        }
      });
    }, 500);
  });
};
