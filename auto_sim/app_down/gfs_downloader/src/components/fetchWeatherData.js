import axios from 'axios';

const fetchWeatherData = async (latitude, longitude) => {
  const apiUrl = 'https://api.open-meteo.com/v1/forecast';
  const params = {
    latitude: latitude,
    longitude: longitude,
    hourly: 'temperature_2m',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(), // Next 10 hours
  };

  try {
    const response = await axios.get(apiUrl, { params });
    return {
      temperatureData: response.data.hourly.temperature_2m,
      timeData: response.data.hourly.time,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
};

export default fetchWeatherData;