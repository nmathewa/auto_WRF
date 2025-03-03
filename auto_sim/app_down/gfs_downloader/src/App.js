import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import GFSDataDownloader from './components/GFSDataDownloader';
import ERA5DataDownloader from './components/ERA5DataDownloader';
import RunningIndexCalculator from './components/RunningLayout';
import Home from './components/Home';

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
              <li>
                <Link to="/gfs-data-downloader">GFS Data Downloader</Link>
              </li>
              <li>
                <Link to="/era5-data-downloader">ERA5 Data Downloader</Link>
              </li>
              <li>
                <Link to="/running-index-calculator">Running Index Calculator</Link>
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