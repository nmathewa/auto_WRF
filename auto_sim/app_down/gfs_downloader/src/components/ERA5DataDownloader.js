import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import './ERA5DataDownloader.css';
import 'leaflet-draw';
import axios from 'axios'; // Import axios for the download function
import { saveAs } from 'file-saver'; // Import file-saver for file downloads in the browser
import * as d3 from 'd3-dsv'; // Import d3-dsv for CSV creation

function ERA5DataDownloader() {
  const [boundingBox, setBoundingBox] = useState(null);
  const [selectedComponent, setSelectedComponent] = useState('ERA5');
  const [selectedTimeResolution, setSelectedTimeResolution] = useState('hourly');
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedVariables, setSelectedVariables] = useState([]);
  const [apiResponses, setApiResponses] = useState([]); // State to hold multiple API responses
  
  const markerRef = useRef(null); // Ref to hold the marker

  // Components and their details
  const components = {
    ERA5: {
      resolution: '31 km',
      levels: '37 pressure levels',
      dataAvailability: '1979 to present',
    },
    'ERA5-LAND': {
      resolution: '9 km',
      levels: 'Single level',
      dataAvailability: '1950 to present',
    },
    ERA6: {
      resolution: 'Not released yet',
      levels: 'Not released yet',
      dataAvailability: 'Not released yet',
    },
  };

  // Variables for selection
  const variables = {
    ERA5: ['temperature_2m', 'relative_humidity_2m'],
    'ERA5-LAND': ['soil_temperature_level_1', 'volumetric_soil_water_layer_1'],
    ERA6: ['Not released yet'],
  };

  // Initialize the Leaflet map
  useEffect(() => {
    if (!document.getElementById('map')._leaflet_id) {
      const map = L.map('map').setView([51.505, -0.09], 2);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
          circlemarker: false,
        },
      });
      map.addControl(drawControl);

      // Handling the drawing events on the map
      map.on(L.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer);

        if (layer instanceof L.Marker) {
          // Handle marker drawing
          setSelectedPoint(layer.getLatLng());
          setBoundingBox(null);
          if (markerRef.current) {
            markerRef.current.remove(); // Remove previous marker using the ref
          }
          markerRef.current = L.marker(layer.getLatLng(), { icon: L.divIcon({ className: 'custom-marker' }) }).addTo(map);
        } else if (layer instanceof L.Rectangle) {
          // Handle rectangle drawing
          const latlngs = layer.getLatLngs()[0];
          setBoundingBox(latlngs);
          setSelectedPoint(null);
          if (markerRef.current) {
            markerRef.current.remove(); // Remove marker for bounding box
          }
        }
      });
    }
  }, []);

  // Format coordinates to 2 decimal places
  const formatCoordinate = (coordinate) => coordinate.toFixed(2);

  // Handle component change
  const handleComponentChange = (event) => {
    setSelectedComponent(event.target.value);
    setSelectedVariables([]);
  };

  // Handle time resolution change
  const handleTimeResolutionChange = (event) => setSelectedTimeResolution(event.target.value);
  
  // Handle start date change
  const handleStartDateChange = (event) => setStartDate(event.target.value);

  // Handle end date change
  const handleEndDateChange = (event) => setEndDate(event.target.value);

  // Handle variable selection change
  const handleVariableChange = (event) => {
    const options = event.target.options;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setSelectedVariables(selected);
  };

  // Generate CDS API code
  const generateCdsApiCode = () => {
    let code = `import cdsapi\n\nc = cdsapi.Client()\n\nc.retrieve(\n    '${selectedComponent.toLowerCase()}',\n    {\n        'product_type': '${selectedTimeResolution}',\n`;
    if (startDate && endDate) code += `        'date': '${startDate}/${endDate}',\n`;
    if (selectedPoint) code += `        'area': [${formatCoordinate(selectedPoint.lat)}, ${formatCoordinate(selectedPoint.lng)}, ${formatCoordinate(selectedPoint.lat)}, ${formatCoordinate(selectedPoint.lng)}],\n`;
    else if (boundingBox) code += `        'area': [${formatCoordinate(boundingBox[1].lat)}, ${formatCoordinate(boundingBox[0].lng)}, ${formatCoordinate(boundingBox[0].lat)}, ${formatCoordinate(boundingBox[2].lng)}],\n`;
    code += `        'variable': [${selectedVariables.map((v) => `'${v}'`).join(', ')}]\n    },\n    'download.nc')`;
    return code;
  };

  // Combine multiple JSON responses into one with separate columns for each variable
  const combineResponses = (responses) => {
    const combinedData = [];
    const time = responses[0].time; // Assuming all responses have the same time array
    time.forEach((t, index) => {
      const record = { time: t };
      responses.forEach(response => {
        const { latitude, longitude, ...variables } = response;
        Object.keys(variables).forEach(variable => {
          record[`${variable}_${formatCoordinate(latitude)}_${formatCoordinate(longitude)}`] = variables[variable][index];
        });
      });
      combinedData.push(record);
    });
    return combinedData;
  };

  // Convert JSON response to CSV format
  const convertToCSV = (data) => {
    return d3.csvFormat(data);
  };

  // Function to download ERA5 data for a single point using Open-Meteo API
  const downloadERA5DataForPoint = async (latitude, longitude) => {
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=${selectedVariables.join(',')}`;
    
    try {
      const response = await axios.get(url);
      if (response.status === 200) {
        return { latitude, longitude, ...response.data.hourly };
      } else {
        console.error(`Failed to download data. Status code: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error(`Error occurred while downloading data: ${error.message}`);
      return null;
    }
  };

  // Function to download ERA5 data within a bounding box
  const downloadERA5DataForBoundingBox = async () => {
    if (!boundingBox) {
      alert('Please draw a bounding box on the map.');
      return;
    }

    const latStep = 0.25;
    const lonStep = 0.25;
    const latStart = Math.min(boundingBox[0].lat, boundingBox[1].lat);
    const latEnd = Math.max(boundingBox[0].lat, boundingBox[1].lat);
    const lonStart = Math.min(boundingBox[0].lng, boundingBox[2].lng);
    const lonEnd = Math.max(boundingBox[0].lng, boundingBox[2].lng);

    const allData = [];
    for (let lat = latStart; lat <= latEnd; lat += latStep) {
      for (let lon = lonStart; lon <= lonEnd; lon += lonStep) {
        const data = await downloadERA5DataForPoint(lat, lon);
        if (data) {
          allData.push(data);
        }
      }
    }

    const combinedData = combineResponses(allData);
    setApiResponses(combinedData);

    // Convert the combined data to CSV and trigger download
    const csv = convertToCSV(combinedData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `ERA5_data_${startDate}_to_${endDate}.csv`);
  };

  // Handle download button click
  const handleDownloadClick = () => {
    if (selectedPoint) {
      // If a point is selected, download data for that point
      const latitude = selectedPoint.lat;
      const longitude = selectedPoint.lng;
      downloadERA5DataForPoint(latitude, longitude).then(data => {
        if (data) {
          const csvData = data.time.map((time, index) => ({
            time,
            [`${formatCoordinate(latitude)}_${formatCoordinate(longitude)}`]: data.temperature_2m[index],
            ...selectedVariables.reduce((acc, variable) => ({
              ...acc,
              [`${variable}_${formatCoordinate(latitude)}_${formatCoordinate(longitude)}`]: data[variable][index]
            }), {})
          }));
          const csv = convertToCSV(csvData);
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          saveAs(blob, `ERA5_data_${latitude}_${longitude}_${startDate}_to_${endDate}.csv`);
        }
      });
    } else if (boundingBox) {
      // If a bounding box is selected, download data for all points within the bounding box
      downloadERA5DataForBoundingBox();
    } else {
      alert('Please select a point or bounding box, set start and end dates, and choose at least one variable.');
    }
  };

  return (
    <div className="era5-container">
      <div className="left-side">
        <h2>ERA5 Data Downloader</h2>
        <p>Access and download ERA5 reanalysis data.</p>
        
        {/* Display bounding box info */}
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

        {/* Display selected point info */}
        {selectedPoint && (
          <div className="selected-point">
            <div><strong>Latitude:</strong> {formatCoordinate(selectedPoint.lat)}</div>
            <div><strong>Longitude:</strong> {formatCoordinate(selectedPoint.lng)}</div>
          </div>
        )}

        <div className="selectors">
          {/* Component Selector */}
          <div className="component-selector">
            <label htmlFor="component-select">Select Component:</label>
            <select id="component-select" value={selectedComponent} onChange={handleComponentChange}>
              <option value="ERA5">ERA5</option>
              <option value="ERA5-LAND">ERA5-LAND</option>
              <option value="ERA6">ERA6</option>
            </select>
          </div>

          {/* Time Resolution Selector */}
          <div className="time-resolution-selector">
            <label htmlFor="time-resolution-select">Time Resolution:</label>
            <select id="time-resolution-select" value={selectedTimeResolution} onChange={handleTimeResolutionChange}>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {/* Date Selectors */}
          <div className="date-selector">
            <label htmlFor="start-date">Start Date:</label>
            <input type="date" id="start-date" value={startDate} onChange={handleStartDateChange} />
            <label htmlFor="end-date">End Date:</label>
            <input type="date" id="end-date" value={endDate} onChange={handleEndDateChange} />
          </div>
        </div>

        {/* Component Details */}
        <div className="component-details">
          <h3>Component Details</h3>
          <p><strong>Resolution:</strong> {components[selectedComponent].resolution}</p>
          <p><strong>Levels:</strong> {components[selectedComponent].levels}</p>
          <p><strong>Data Availability:</strong> {components[selectedComponent].dataAvailability}</p>
        </div>

        {/* Variable Selector */}
        <div className="variable-selector">
          <h3>Select Variables</h3>
          <select multiple={true} value={selectedVariables} onChange={handleVariableChange}>
            {variables[selectedComponent] && variables[selectedComponent].map((variable) => (
              <option key={variable} value={variable}>
                {variable}
              </option>
            ))}
          </select>
        </div>

        {/* Display CDSAPI code */}
        <div className="api-code">
          <h3>CDSAPI Code</h3>
          <pre>
            <code>
              {generateCdsApiCode()}
            </code>
          </pre>
        </div>

        {/* Download Button */}
        <button onClick={handleDownloadClick}>Download ERA5 Data</button>

        {/* Display API Responses */}
        {apiResponses.length > 0 && (
          <div className="api-responses">
            <h3>API Responses</h3>
            <pre>
              <code>
                {JSON.stringify(apiResponses, null, 2)}
              </code>
            </pre>
          </div>
        )}
      </div>

      {/* Map Section */}
      <div id="map" className="map"></div>
    </div>
  );
}

export default ERA5DataDownloader;