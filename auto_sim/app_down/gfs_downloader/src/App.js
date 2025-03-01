import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import './App.css';
import GFSDataDownloader from './components/GFSDataDownloader';
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
            </ul>
          </nav>
        </header>
        <main>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/gfs-data-downloader" element={<GFSDataDownloader />} />
          </Routes>
        </main>
        <footer>
          <img src="https://www.noaa.gov/sites/default/files/2022-03/noaa_emblem_logo-2022.png" alt="Logo" className="Footer-logo" />
          <p>© {new Date().getFullYear()} - NOAA GFS Data Downloader</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;