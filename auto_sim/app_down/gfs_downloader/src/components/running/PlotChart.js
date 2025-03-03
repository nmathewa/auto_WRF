// PlotChart.js
import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PlotChart = ({ timeData, temperatureData, label }) => {
  const chartData = {
    labels: timeData.map(time => new Date(time).toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', hour12: false })),
    datasets: [
      {
        label: label,
        data: temperatureData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: false,
      },
    ],
  };

  return <Line data={chartData} />;
};

export default PlotChart;