import React from 'react';
import './App.css';
import GFSDataDownloader from './components/GFSDataDownloader';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>GFS Forecast Data Tool</h1>
      </header>
      <main>
        <GFSDataDownloader />
      </main>
      <footer>
        <p>© {new Date().getFullYear()} - NOAA GFS Data Downloader</p>
      </footer>
    </div>
  );
}

export default App;