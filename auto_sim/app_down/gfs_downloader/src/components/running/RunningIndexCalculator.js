// RunningIndexCalculator.js
export const calculateHeatIndex = (temperature, humidity) => {
  // Simplified formula for heat index calculation
  return (
    -42.379 +
    2.04901523 * temperature +
    10.14333127 * humidity -
    0.22475541 * temperature * humidity -
    0.00683783 * temperature * temperature -
    0.05481717 * humidity * humidity +
    0.00122874 * temperature * temperature * humidity +
    0.00085282 * temperature * humidity * humidity -
    0.00000199 * temperature * temperature * humidity * humidity
  );
};

export const fetchWeatherData = async (latitude, longitude) => {
  const apiUrl = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude: latitude,
    longitude: longitude,
    hourly: 'temperature_2m,relative_humidity_2m',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // Next 10 hours
  };

  const response = await fetch(`${apiUrl}?${new URLSearchParams(params)}`);
  const data = await response.json();

  return {
    temperatureData: data.hourly.temperature_2m,
    humidityData: data.hourly.relative_humidity_2m,
    timeData: data.hourly.time,
  };
};