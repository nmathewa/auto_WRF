/**
 * Calculate the heat index based on temperature and humidity using the NWS formula.
 * If the temperature is below 26.7°C (80°F) or the relative humidity is below 40%, 
 * the heat index is not applicable and the temperature is returned as is.
 * 
 * @param {number} temperature - The temperature in Celsius.
 * @param {number} humidity - The relative humidity in percentage.
 * @returns {number} - The calculated heat index in Celsius or the original temperature if not applicable.
 */
export const calculateHeatIndex = (temperature, humidity) => {
  // Convert temperature from Celsius to Fahrenheit
  const tempF = (temperature * 9/5) + 32;

  // Check if temperature and humidity are within the range for heat index calculation
  if (tempF < 80 || humidity < 40) {
    // Heat index is not applicable, return the temperature as is
    console.log(`Temperature ${temperature}°C or humidity ${humidity}% is out of range for heat index calculation.`);
    return temperature;
  }

  // NWS Heat Index formula in Fahrenheit
  const heatIndexF = (
    -42.379 +
    2.04901523 * tempF +
    10.14333127 * humidity -
    0.22475541 * tempF * humidity -
    0.00683783 * tempF * tempF -
    0.05481717 * humidity * humidity +
    0.00122874 * tempF * tempF * humidity +
    0.00085282 * tempF * humidity * humidity -
    0.00000199 * tempF * tempF * humidity * humidity
  );

  // Convert the heat index back to Celsius
  const heatIndexC = (heatIndexF - 32) * 5/9;

  console.log(`Calculated heat index: ${heatIndexC}°C for temperature ${temperature}°C and humidity ${humidity}%`);
  return heatIndexC;
};