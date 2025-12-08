import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import './App.css';
import HomePage from './Pages/Home/HomePage';
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
import ManufacturerDashboard from './Pages/ManufacturingDashboard';
import RetailerDashboard from './Pages/RetailerDashboard';
import PolicyMakerDashboard from './Pages/PolicyMakerDashboard';
import CropPlanning from './Pages/Farmers/CropPlanning';
import TransportDashboard from './Pages/TransportDashboard';
import BookTransportPage from './Pages/Farmers/BookTransportPage';
import DriverLoginPage from './Pages/DriverLoginPage';
import DriverDashboard from './Pages/DriverDashboard';
import AIAdvisoryPage from './Pages/AI-Advisory/AIAdvisoryPage';
import FavorableCrops from './Components/AI-advisory-Components/FavorableCrops';
import PlanCropsAdvisory from './Components/AI-advisory-Components/PlanCropsAdvisory';

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
            <Route path='/ai-advisory' element={<AIAdvisoryPage/>}/>

            {/* Existing Dashboards */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path='/seed-seller' element={<SeedSellerDashboard/>}/>

            {/* New Role-Based Dashboards */}
            <Route path="/fpo-dashboard" element={<FPODashboard />} />
            <Route path="/trader-dashboard" element={<TraderDashboard />} />
            <Route path="/storage-dashboard" element={<StorageDashboard />} />
            <Route path="/transport-dashboard" element={<TransportDashboard />} />
            <Route path="/manufacturer-dashboard" element={<ManufacturerDashboard />} />
            <Route path="/retailer-dashboard" element={<RetailerDashboard />} />
            <Route path="/policy-maker-dashboard" element={<PolicyMakerDashboard />} />

            {/* Other Routes */}
            <Route path="/plot-registration" element={<PlotRegistration />} />
            <Route path="/book-transport" element={<BookTransportPage />} />
            <Route path="/driver-login" element={<DriverLoginPage />} />
            <Route path="/driver-dashboard" element={<DriverDashboard />} />
            <Route path="/mandi-prices"
                  element={<Provider store={store}>
                      <MandiMarketDashboardRedux />
                      </Provider>} >
            </Route>
            <Route path="/news" element={<News/>} />
            <Route path='/manage-fields' element={<ManageFields/>}></Route>
            <Route path='/manage-fields/:plotId' element={<ManageFields/>}></Route>
            <Route path="/market" element={<MarketPage/>} />
            <Route path="/crop-detail" element={<CropsPage/>} />
            <Route path="/profile" element={<FarmerProfile/>} />
            <Route path="/edit-profile" element={<FarmersProfileEditForm/>} />
            <Route path="/sell-crops" element={<SellCropsPage/>} />
            <Route path="/buy-crops" element={<FarmersListingPage/>}/>
            <Route path="/crop-planning/:plotId" element={<CropPlanning />} />
            <Route path='/advisory/crop-recommendation' element={<FavorableCrops/>}/>
            <Route path='/advisory/plan-crops' element={<PlanCropsAdvisory/>}/>
          </Routes>
        </section>

        
      </div>
    </Router>
  );
}

export default App;
