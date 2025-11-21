import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar';
import './App.css';
import HomePage from './Pages/HomePage';
import LoginPage from './Pages/LoginPage';
import SignupPage from './Pages/SignupPage';
import PlotRegistration from './Pages/PlotRegistration';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import Dashboard from './Pages/Dashboard';
import { Provider } from 'react-redux'
import MandiMarketDashboardRedux from './Components/Mandi-components/MandiMarketDashboardRedux'
import store from './Components/Mandi-components/store'
import News from './Components/News-component/News';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <section className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/plot-registration" element={<PlotRegistration />} />
            <Route path="/mandi-prices" 
                  element={<Provider store={store}>
                      <MandiMarketDashboardRedux />
                      </Provider>} >
            </Route>
            <Route path="/news" element={<News/>} />
            
          </Routes>
        </section>
      </div>
    </Router>
  );
}

export default App;
