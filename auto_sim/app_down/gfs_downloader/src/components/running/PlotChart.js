import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import moment from 'moment-timezone';
import axios from 'axios';
import annotationPlugin from 'chartjs-plugin-annotation';

// Register the necessary Chart.js components and plugins.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale, annotationPlugin);

/**
 * Convert UTC time to local time based on latitude and longitude.
 * 
 * @param {string} utcTime - The UTC time string.
 * @param {number} latitude - The latitude value.
 * @param {number} longitude - The longitude value.
 * @returns {string} - The local time string formatted as 'weekname-hour (am/pm)'.
 */
const convertToLocalTime = (utcTime, latitude, longitude) => {
  // Get the timezone name based on latitude and longitude
  const timezone = moment.tz.guess(true);

  // Convert the UTC time to local time using the timezone and format it as 'weekname-hour (am/pm)'
  return moment.utc(utcTime).tz(timezone).format('ddd-hA');
};

/**
 * PlotChart component for rendering dynamic line charts with multiple datasets and dual y-axes.
 * 
 * @param {Array} timeData - Array of time values.
 * @param {Array} datasets - Array of dataset objects, each containing label, data, borderColor, backgroundColor, yAxisID.
 * @param {number} latitude - The latitude value.
 * @param {number} longitude - The longitude value.
 * @returns {JSX.Element} - Line chart component.
 */
const PlotChart = ({ timeData, datasets, latitude, longitude }) => {
  const [sunrise, setSunrise] = useState(null);
  const [sunset, setSunset] = useState(null);

  // Fetch sunrise and sunset times from the Sunrise-Sunset API
  useEffect(() => {
    const fetchSunriseSunset = async () => {
      try {
        const response = await axios.get(`https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&formatted=0`);
        setSunrise(response.data.results.sunrise);
        setSunset(response.data.results.sunset);
      } catch (error) {
        console.error('Error fetching sunrise and sunset times:', error);
      }
    };

    fetchSunriseSunset();
  }, [latitude, longitude]);

  // Convert the timeData to local time
  const localTimeData = timeData.map(time => convertToLocalTime(time, latitude, longitude));

  // Prepare the chart data
  const chartData = {
    labels: localTimeData,
    datasets: datasets.map(dataset => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: dataset.borderColor,
      backgroundColor: dataset.backgroundColor,
      fill: false,
      yAxisID: dataset.yAxisID, // Specify the y-axis for the dataset
      tension: 0.5, // Add tension to make the line smoother
    })),
  };

  // Chart options to configure dual y-axes and background shade
  const chartOptions = {
    scales: {
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Temperature and Heat Index (°C)',
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: {
          display: true,
          text: 'Humidity (%)',
        },
        grid: {
          drawOnChartArea: false, // Prevent grid lines from being drawn on the chart area
        },
      },
    },
    plugins: {
      annotation: {
        annotations: [
          // Shade the background based on sunset and sunrise times
          {
            type: 'box',
            xMin: sunset ? convertToLocalTime(sunset, latitude, longitude) : null,
            xMax: sunrise ? convertToLocalTime(sunrise, latitude, longitude) : null,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
          },
        ],
      },
    },
  };

  // Return the Line chart component
  return <Line data={chartData} options={chartOptions} />;
};

export default PlotChart;