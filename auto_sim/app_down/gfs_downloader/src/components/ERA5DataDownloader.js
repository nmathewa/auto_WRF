import React, { useEffect, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './ERA5DataDownloader.css';
import 'leaflet-draw';

function ERA5DataDownloader() {
  const [boundingBox, setBoundingBox] = useState(null);

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
          marker: false,
          rectangle: true,
          circlemarker: false
        }
      });
      map.addControl(drawControl);

      // Handle the created event to get the latitude and longitude of the drawn shape
      map.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        const latlngs = layer.getLatLngs()[0];
        setBoundingBox(latlngs);
      });
    }
  }, []);

  const formatCoordinate = (coordinate) => {
    return coordinate.toFixed(2);
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
      </div>
      <div id="map" className="map"></div>
    </div>
  );
}

export default ERA5DataDownloader;