import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h2>Welcome to the GFS Forecast Data Tool</h2>
        <p>An automated WRF simulation workflow with interactive visualization.</p>
      </div>
      <div className="content-section">
        <h3>Explore Tools</h3>
        <div className="card-container">
          <div className="card">
            <h4>GFS Data Downloader</h4>
            <p>Access and download NOAA GFS forecast data.</p>
            <Link to="/gfs-data-downloader" className="card-link">Go to GFS Data Downloader</Link>
          </div>
          <div className="card">
            <h4>ERA5 Data Downloader</h4>
            <p>Access and download ERA5 reanalysis data.</p>
            <Link to="/era5-data-downloader" className="card-link">Go to ERA5 Data Downloader</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;