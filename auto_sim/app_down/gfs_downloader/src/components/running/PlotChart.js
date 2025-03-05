import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import moment from 'moment-timezone';
import axios from 'axios';

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

  // Prepare the chart options
  const chartOptions = {
    chart: {
      type: 'line',
    },
    title: {
      text: 'Weather Data',
    },
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Time',
      },
      labels: {
        formatter: function () {
          return moment(this.value).format('YYYY-MM-DD HH:mm');
        },
      },
    },
    yAxis: [
      {
        title: {
          text: 'Temperature and Heat Index (°C)',
        },
      },
      {
        title: {
          text: 'Humidity (%)',
        },
        opposite: true,
      },
    ],
    series: datasets.map(dataset => ({
      name: dataset.label,
      data: dataset.data.map((value, index) => [moment.utc(timeData[index]).valueOf(), value]),
      color: dataset.borderColor,
      yAxis: dataset.yAxisID === 'y1' ? 1 : 0,
    })),
    plotOptions: {
      series: {
        marker: {
          enabled: false,
        },
      },
    },
  };

  // Return the Highcharts component
  return <HighchartsReact highcharts={Highcharts} options={chartOptions} />;
};

export default PlotChart;