import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import GFSDataDownloader from './components/GFSDataDownloader';
import ERA5DataDownloader from './components/ERA5DataDownloader';
import RunningIndexCalculator from './components/RunningLayout';
import Home from './components/Home';
import WRFModelSetup from './components/WRFmodel/WRFModelSetup';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>GFS Forecast Data Tool</h1>
          <nav>
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/gfs-data-downloader" element={<GFSDataDownloader />} />
            <Route path="/era5-data-downloader" element={<ERA5DataDownloader />} />
            <Route path="/running-index-calculator" element={<RunningIndexCalculator />} />
            <Route path="/WRF-model-setup" element={<WRFModelSetup />} />
          </Routes>
        </main>
        <footer>
          <img src="https://example.com/your-logo-image.jpg" alt="Logo" className="Footer-logo" />
          <p>© {new Date().getFullYear()} - NOAA GFS Data Downloader</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;