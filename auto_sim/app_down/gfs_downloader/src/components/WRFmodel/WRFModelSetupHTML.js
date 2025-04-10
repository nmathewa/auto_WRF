// Import React for JSX rendering
import React from 'react';
// Import Leaflet components for the map display
import { MapContainer, TileLayer, Rectangle } from 'react-leaflet';

/**
 * WRFModelSetupHTML - The HTML structure for the WRF Model Setup component
 * This component is responsible for rendering the UI based on props received from the main component
 * Separating the view from the logic improves readability and maintainability
 * 
 * @param {Object} props - Component props
 * @param {string} props.fileContents - The contents of the imported file
 * @param {string} props.fileName - The name of the imported file
 * @param {Array} props.mapCenter - The center coordinates for the map [lat, lng]
 * @param {number} props.mapZoom - The zoom level for the map
 * @param {RefObject} props.fileInputRef - Reference to the file input element
 * @param {Function} props.handleFileImport - Function to handle file import
 * @param {Function} props.clearFile - Function to clear the imported file
 * @param {Object} props.gridConfig - Configuration for grid display
 * @param {Array} props.gridRectangles - Array of grid rectangles to display
 * @param {string} props.currentDateTime - Current date and time in UTC format
 * @param {string} props.currentUser - Current user's login name
 * @param {boolean} props.shouldFlyToCenter - Flag to control auto-flying to the center
 * @param {Component} props.MapController - Component for controlling the map view
 */
const WRFModelSetupHTML = ({
  fileContents,
  fileName,
  mapCenter,
  mapZoom,
  fileInputRef,
  handleFileImport,
  clearFile,
  gridConfig,
  gridRectangles,
  currentDateTime,
  currentUser,
  shouldFlyToCenter,
  MapController
}) => {
  return (
    <div className="wrf-model-setup">
      {/* HEADER SECTION */}
      {/* Contains the title, timestamp, and user information */}
      <div className="wrf-header">
        <h2>WRF Model Setup</h2>
        <div className="wrf-timestamp">
          <span>Current Date and Time (UTC): {currentDateTime}</span>
          <span>User: {currentUser}</span>
        </div>
      </div>
      
      {/* Introduction text */}
      <p>Configure the WRF model parameters and view the map:</p>
      
      {/* MAIN CONTAINER */}
      {/* Two-column layout with file section on the left and map on the right */}
      <div className="wrf-container">
        {/* LEFT SECTION - FILE INPUT AND DISPLAY */}
        <div className="wrf-file-section">
          {/* File import controls */}
          <div className="file-import-container">
            <h3>Import WRF File</h3>
            {/* File input element accepting only .input and .wps files */}
            <input
              type="file"
              accept=".input,.wps"
              onChange={handleFileImport}
              ref={fileInputRef}
            />
            
            {/* File information and clear button (only shown when a file is selected) */}
            {fileName && (
              <div className="file-info">
                <p>Imported file: {fileName}</p>
                <button onClick={clearFile}>Clear File</button>
              </div>
            )}
          </div>
          
          {/* Grid configuration information section (only shown when a file is imported) */}
          {gridConfig.e_we.length > 0 && (
            <div className="grid-config-info">
              <h4>Parsed Grid Configuration:</h4>
              <p><strong>East-West Grid Points (e_we):</strong> {gridConfig.e_we.join(', ')}</p>
              <p><strong>South-North Grid Points (e_sn):</strong> {gridConfig.e_sn.join(', ')}</p>
              <p><strong>Reference Coordinates:</strong> {gridConfig.ref_lat !== null ? `${gridConfig.ref_lat}°N, ${gridConfig.ref_lon}°E` : 'Not specified'}</p>
              <p><strong>Grid Resolution:</strong> {gridConfig.dx !== null ? `dx=${gridConfig.dx}m, dy=${gridConfig.dy}m` : 'Not specified'}</p>
            </div>
          )}
          
          {/* File contents display area */}
          <div className="file-contents">
            <h4>File Contents:</h4>
            {/* Conditionally show file contents or a placeholder message */}
            {fileContents ? (
              <pre>{fileContents}</pre>
            ) : (
              <p className="no-file">No file imported yet. Please import a .input or .wps file.</p>
            )}
          </div>
        </div>
        
        {/* RIGHT SECTION - MAP DISPLAY */}
        <div className="wrf-map-section">
          <h3>Map View with Grid Overlay</h3>
          {/* Map container with proper dimensions to ensure visibility */}
          <div className="map-container">
            <MapContainer 
              center={mapCenter} 
              zoom={mapZoom} 
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}   // Show zoom controls
              scrollWheelZoom={true} // Enable zoom with mouse wheel
            >
              {/* Map controller component for programmatically controlling the view */}
              <MapController 
                center={mapCenter} 
                zoom={mapZoom} 
                shouldFly={shouldFlyToCenter} 
              />
              
              {/* OpenStreetMap tile layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {/* Domain rectangles - one for each WRF domain */}
              {/* No tooltips as requested */}
              {gridRectangles.map((rect) => (
                <Rectangle 
                  key={`domain-${rect.id}`}
                  bounds={rect.bounds}
                  pathOptions={{
                    color: rect.color,
                    weight: 2,
                    fillOpacity: 0.1
                  }}
                />
              ))}
            </MapContainer>
          </div>
          
          {/* Domain legend - only shown when domains are present */}
          {gridRectangles.length > 0 && (
            <div className="map-legend">
              <h4>Domain Legend:</h4>
              <ul>
                {gridRectangles.map((rect) => (
                  <li key={`legend-${rect.id}`}>
                    <span className="color-box" style={{ backgroundColor: rect.color }}></span>
                    Domain {rect.id}: {gridConfig.e_we[rect.id-1]} x {gridConfig.e_sn[rect.id-1]} grid points
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the component for use in other parts of the application
export default WRFModelSetupHTML;