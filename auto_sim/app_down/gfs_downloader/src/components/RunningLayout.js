// RunningLayout.js
import React, { useEffect, useState } from 'react';
import { fetchWeatherData, calculateHeatIndex } from './running/RunningIndexCalculator';
import PlotChart from './running/PlotChart';
import './RunningLayout.css';

const RunningLayout = () => {
  const [latitude, setLatitude] = useState(28.0836);  // Default latitude for Melbourne, Florida
  const [longitude, setLongitude] = useState(-80.6081);  // Default longitude for Melbourne, Florida
  const [temperatureData, setTemperatureData] = useState([]);
  const [timeData, setTimeData] = useState([]);
  const [heatIndexData, setHeatIndexData] = useState([]);

  useEffect(() => {
    const getWeatherData = async () => {
      try {
        const data = await fetchWeatherData(latitude, longitude);
        setTemperatureData(data.temperatureData);
        setTimeData(data.timeData);

        const heatIndex = data.temperatureData.map((temp, index) =>
          calculateHeatIndex(temp, data.humidityData[index])
        );
        setHeatIndexData(heatIndex);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    getWeatherData();
  }, [latitude, longitude]);

  const handleLatitudeChange = (e) => setLatitude(e.target.value);
  const handleLongitudeChange = (e) => setLongitude(e.target.value);

  return (
    <div className="running-layout">
      <h2>Next 10 Hours Temperature and Heat Index</h2>
      <div className="input-container">
        <label>
          Latitude:
          <input type="number" value={latitude} onChange={handleLatitudeChange} />
        </label>
        <label>
          Longitude:
          <input type="number" value={longitude} onChange={handleLongitudeChange} />
        </label>
      </div>
      <div className="chart-container">
        <PlotChart timeData={timeData} temperatureData={temperatureData} label="Temperature (°C)" />
        <PlotChart timeData={timeData} temperatureData={heatIndexData} label="Heat Index (°C)" />
      </div>
    </div>
  );
};

export default RunningLayout;