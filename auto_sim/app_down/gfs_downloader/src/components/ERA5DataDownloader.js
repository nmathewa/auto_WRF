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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVariables, setSelectedVariables] = useState([]);
  const [variables, setVariables] = useState({});

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
    fetch('./Dataset_Variables.json')
      .then(response => response.json())
      .then(data => setVariables(data))
      .catch(error => console.error('Error fetching the JSON file:', error));
  }, []);

  useEffect(() => {
    if (!document.getElementById('map')._leaflet_id) {
      const map = L.map('map').setView([51.505, -0.09], 2);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      const drawnItems = new L.FeatureGroup();
      map.addLayer(drawnItems);

      const drawControl = new L.Control.Draw({
        edit: { featureGroup: drawnItems },
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

      map.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);
        
        if (layer instanceof L.Marker) {
          setSelectedPoint(layer.getLatLng());
          setBoundingBox(null);
          if (marker) marker.remove();
          const newMarker = L.marker(layer.getLatLng(), {icon: L.divIcon({className: 'custom-marker'})}).addTo(map);
          setMarker(newMarker);
        } else if (layer instanceof L.Rectangle) {
          const latlngs = layer.getLatLngs()[0];
          setBoundingBox(latlngs);
          setSelectedPoint(null);
          if (marker) marker.remove();
        }
      });
    }
  }, [marker]);

  const formatCoordinate = (coordinate) => coordinate.toFixed(2);

  const handleComponentChange = (event) => {
    setSelectedComponent(event.target.value);
    setSelectedVariables([]);
  };

  const handleTimeResolutionChange = (event) => setSelectedTimeResolution(event.target.value);
  
  const handleStartDateChange = (event) => setStartDate(event.target.value);

  const handleEndDateChange = (event) => setEndDate(event.target.value);

  const handleVariableChange = (event) => {
    const variable = event.target.value;
    const isChecked = event.target.checked;
    setSelectedVariables((prevSelectedVariables) =>
      isChecked ? [...prevSelectedVariables, variable] : prevSelectedVariables.filter((v) => v !== variable)
    );
  };

  const generateCdsApiCode = () => {
    let code = `import cdsapi\n\nc = cdsapi.Client()\n\nc.retrieve(\n    '${selectedComponent.toLowerCase()}',\n    {\n        'product_type': '${selectedTimeResolution}',\n`;
    if (startDate && endDate) code += `        'date': '${startDate}/${endDate}',\n`;
    if (selectedPoint) code += `        'area': [${formatCoordinate(selectedPoint.lat)}, ${formatCoordinate(selectedPoint.lng)}, ${formatCoordinate(selectedPoint.lat)}, ${formatCoordinate(selectedPoint.lng)}],\n`;
    else if (boundingBox) code += `        'area': [${formatCoordinate(boundingBox[1].lat)}, ${formatCoordinate(boundingBox[0].lng)}, ${formatCoordinate(boundingBox[0].lat)}, ${formatCoordinate(boundingBox[2].lng)}],\n`;
    code += `        'variable': [${selectedVariables.map((v) => `'${v}'`).join(', ')}]\n    },\n    'download.nc')`;
    return code;
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
          <div className="date-selector">
            <label htmlFor="start-date">Start Date:</label>
            <input type="date" id="start-date" value={startDate} onChange={handleStartDateChange} />
            <label htmlFor="end-date">End Date:</label>
            <input type="date" id="end-date" value={endDate} onChange={handleEndDateChange} />
          </div>
        </div>
        <div className="component-details">
          <h3>Component Details</h3>
          <p><strong>Resolution:</strong> {components[selectedComponent].resolution}</p>
          <p><strong>Levels:</strong> {components[selectedComponent].levels}</p>
          <p><strong>Data Availability:</strong> {components[selectedComponent].dataAvailability}</p>
        </div>
        <div className="variable-selector">
          <h3>Select Variables</h3>
          {variables[selectedComponent] && variables[selectedComponent].map((variable) => (
            <div key={variable}>
              <label>
                <input
                  type="checkbox"
                  value={variable}
                  checked={selectedVariables.includes(variable)}
                  onChange={handleVariableChange}
                />
                {variable}
              </label>
            </div>
          ))}
        </div>
        <div className="api-code">
          <h3>CDSAPI Code</h3>
          <pre>
            <code>
              {generateCdsApiCode()}
            </code>
          </pre>
        </div>
      </div>
      <div id="map" className="map"></div>
    </div>
  );
}

export default ERA5DataDownloader;