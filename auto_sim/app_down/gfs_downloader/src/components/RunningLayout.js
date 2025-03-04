import React, { useEffect, useState } from 'react';
import { calculateHeatIndex } from './running/RunningIndexCalculator'; // Import the calculateHeatIndex function
import PlotChart from './running/PlotChart'; // Import the PlotChart component
import './RunningLayout.css'; // Import the CSS for styling

const RunningLayout = () => {
  const [latitude, setLatitude] = useState(28.0836); // Default latitude for Melbourne, Florida
  const [longitude, setLongitude] = useState(-80.6081); // Default longitude for Melbourne, Florida
  const [temperatureData, setTemperatureData] = useState([]); // State for temperature data
  const [humidityData, setHumidityData] = useState([]); // State for humidity data
  const [timeData, setTimeData] = useState([]); // State for time data
  const [heatIndexData, setHeatIndexData] = useState([]); // State for heat index data

  useEffect(() => {
    // Fetch weather data when the component mounts or when latitude/longitude changes
    const getWeatherData = async () => {
      const apiUrl = 'https://api.open-meteo.com/v1/forecast';
      const params = {
        latitude: latitude,
        longitude: longitude,
        hourly: 'temperature_2m,relative_humidity_2m',
        forecast_days: 3, // Forecast for the next 3 days
      };

      try {
        const response = await fetch(`${apiUrl}?${new URLSearchParams(params)}`);
        if (!response.ok) {
          throw new Error('Failed to fetch weather data');
        }
        const data = await response.json();

        // Set the data for plotting
        setTemperatureData(data.hourly.temperature_2m);
        setHumidityData(data.hourly.relative_humidity_2m);
        setTimeData(data.hourly.time);

        // Calculate the heat index for each temperature and humidity pair
        const heatIndex = data.hourly.temperature_2m.map((temp, index) =>
          calculateHeatIndex(temp, data.hourly.relative_humidity_2m[index])
        );
        setHeatIndexData(heatIndex);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      }
    };

    getWeatherData();
  }, [latitude, longitude]);

  // Handlers for latitude and longitude input changes
  const handleLatitudeChange = (e) => setLatitude(e.target.value);
  const handleLongitudeChange = (e) => setLongitude(e.target.value);

  // Prepare datasets for the PlotChart component
  const chartDatasets = [
    {
      label: 'Temperature (°C)',
      data: temperatureData,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      yAxisID: 'y', // Use the primary y-axis
    },
    {
      label: 'Heat Index (°C)',
      data: heatIndexData,
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
      yAxisID: 'y', // Use the primary y-axis
    },
    {
      label: 'Humidity (%)',
      data: humidityData,
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      yAxisID: 'y1', // Use the secondary y-axis
    },
  ];

  return (
    <div className="running-layout">
      <h2>Next 3 Days Temperature, Humidity, and Heat Index</h2>
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
        <PlotChart timeData={timeData} datasets={chartDatasets} />
      </div>
    </div>
  );
};

export default RunningLayout;