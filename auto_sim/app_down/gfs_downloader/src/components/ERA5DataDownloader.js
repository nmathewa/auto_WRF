import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './ERA5DataDownloader.css';
import 'leaflet-draw';

function ERA5DataDownloader() {
  const [boundingBox, setBoundingBox] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('ERA5');
  const [selectedTimeResolution, setSelectedTimeResolution] = useState('hourly');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [marker, setMarker] = useState(null);

  const components = {
    ERA5: {
      resolution: '31 km',
      levels: '37 pressure levels',
      dataAvailability: '1979 to present'
    },
    'ERA5-LAND': {
      resolution: '9 km',
      levels: 'Single level',
      dataAvailability: '1950 to present'
    },
    ERA6: {
      resolution: 'Not released yet',
      levels: 'Not released yet',
      dataAvailability: 'Not released yet'
    }
  };

  useEffect(() => {
    // Check if the map is already initialized
    if (!document.getElementById('map')._leaflet_id) {
      const map = L.map('map').setView([51.505, -0.09], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Initialize the FeatureGroup to store editable layers
      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      // Initialize the draw control and pass it the FeatureGroup of editable layers
      const drawControl = new L.Control.Draw({
        edit: {
          featureGroup: drawnItems
        },
        draw: {
          polygon: false,
          polyline: false,
          circle: false,
          marker: true,
          rectangle: true,
          circlemarker: false
        }
      });
      map.addControl(drawControl);

      // Handle the created event to get the latitude and longitude of the drawn shape
      map.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        
        if (layer instanceof L.Marker) {
          setSelectedPoint(layer.getLatLng());
          setBoundingBox(null);
          if (marker) {
            marker.remove();
          }
          const newMarker = L.marker(layer.getLatLng(), {icon: L.divIcon({className: 'custom-marker'})}).addTo(map);
          setMarker(newMarker);
        } else if (layer instanceof L.Rectangle) {
          const latlngs = layer.getLatLngs()[0];
          setBoundingBox(latlngs);
          setSelectedPoint(null);
          if (marker) {
            marker.remove();
          }
        }
      });
    }
  }, [marker]);

  const formatCoordinate = (coordinate) => {
    return coordinate.toFixed(2);
  };

  const handleComponentChange = (event) => {
    setSelectedComponent(event.target.value);
  };

  const handleTimeResolutionChange = (event) => {
    setSelectedTimeResolution(event.target.value);
  };

  return (
    <div className="era5-container">
      <div className="left-side">
        <h2>ERA5 Data Downloader</h2>
        <p>Access and download ERA5 reanalysis data.</p>
        {boundingBox && (
          <div className="bounding-box">
            <div className="north"><strong>North:</strong> {formatCoordinate(boundingBox[1].lat)}</div>
            <div className="east-west">
              <div className="west"><strong>West:</strong> {formatCoordinate(boundingBox[0].lng)}</div>
              <div className="east"><strong>East:</strong> {formatCoordinate(boundingBox[2].lng)}</div>
            </div>
            <div className="south"><strong>South:</strong> {formatCoordinate(boundingBox[0].lat)}</div>
          </div>
        )}
        {selectedPoint && (
          <div className="selected-point">
            <div><strong>Latitude:</strong> {formatCoordinate(selectedPoint.lat)}</div>
            <div><strong>Longitude:</strong> {formatCoordinate(selectedPoint.lng)}</div>
          </div>
        )}
        <div className="selectors">
          <div className="component-selector">
            <label htmlFor="component-select">Select Component:</label>
            <select id="component-select" value={selectedComponent} onChange={handleComponentChange}>
              <option value="ERA5">ERA5</option>
              <option value="ERA5-LAND">ERA5-LAND</option>
              <option value="ERA6">ERA6</option>
            </select>
          </div>
          <div className="time-resolution-selector">
            <label htmlFor="time-resolution-select">Time Resolution:</label>
            <select id="time-resolution-select" value={selectedTimeResolution} onChange={handleTimeResolutionChange}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
        <div className="component-details">
          <h3>Component Details</h3>
          <p><strong>Resolution:</strong> {components[selectedComponent].resolution}</p>
          <p><strong>Levels:</strong> {components[selectedComponent].levels}</p>
          <p><strong>Data Availability:</strong> {components[selectedComponent].dataAvailability}</p>
        </div>
      </div>
      <div id="map" className="map"></div>
    </div>
  );
}

export default ERA5DataDownloader;