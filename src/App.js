import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import './App.css';
import HomePage from './Pages/Farmers/HomePage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import PlotRegistration from './Components/Plots-component/PlotRegistration';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import Dashboard from './Pages/Farmers/Dashboard';
import { Provider } from 'react-redux'
import MandiMarketDashboardRedux from './Components/Mandi-components/MandiMarketDashboardRedux'
import store from './Components/Mandi-components/store'
import News from './Components/News-component/News';
import ManageFields from './Components/Plots-component/ManageFields';
import MarketPage from './Pages/Farmers/MarketPage';
import CropsPage from './Pages/Farmers/CropsPage';
import FarmerProfile from './Components/Profile-component/FarmerProfile';
import FarmersProfileEditForm from './Components/Profile-component/FarmerProfileEditForm';
import SellCropsPage from './Components/SellCrops-component/SellCropsPage';
import FarmersListingPage from './Pages/Vendors/FamersListingPage';
import SeedSellerDashboard from './Pages/SeedSeller/SeedSellerDashboard';
import DashboardRouter from './Pages/DashboardRouter';
import FPODashboard from './Pages/FPODashboard';
import TraderDashboard from './Pages/TraderDashboard';
import StorageDashboard from './Pages/StorageDashboard';
import ManufacturerDashboard from './Pages/ManufacturerDashboard';
import RetailerDashboard from './Pages/RetailerDashboard';
import PolicyMakerDashboard from './Pages/PolicyMakerDashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <section className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login-redirect" element={<DashboardRouter />} />

            {/* Existing Dashboards */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path='/seed-seller' element={<SeedSellerDashboard/>}/>

            {/* New Role-Based Dashboards */}
            <Route path="/fpo-dashboard" element={<FPODashboard />} />
            <Route path="/trader-dashboard" element={<TraderDashboard />} />
            <Route path="/storage-dashboard" element={<StorageDashboard />} />
            <Route path="/manufacturer-dashboard" element={<ManufacturerDashboard />} />
            <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
            <Route path="/policy-maker-dashboard" element={<PolicyMakerDashboard />} />

            {/* Other Routes */}
            <Route path="/plot-registration" element={<PlotRegistration />} />
            <Route path="/mandi-prices"
                  element={<Provider store={store}>
                      <MandiMarketDashboardRedux />
                      </Provider>} >
            </Route>
            <Route path="/news" element={<News/>} />
            <Route path='/manage-fields' element={<ManageFields/>}></Route>
            <Route path="/market" element={<MarketPage/>} />
            <Route path="/crop-detail" element={<CropsPage/>} />
            <Route path="/profile" element={<FarmerProfile/>} />
            <Route path="/edit-profile" element={<FarmersProfileEditForm/>} />
            <Route path="/sell-crops" element={<SellCropsPage/>} />
            <Route path="/buy-crops" element={<FarmersListingPage/>}/>
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
