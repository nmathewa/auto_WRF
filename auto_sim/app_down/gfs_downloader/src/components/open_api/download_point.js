// Import the required modules
const axios = require('axios');
const fs = require('fs');

// Function to download ERA5 data using Open-Meteo API
async function downloadERA5Data(startDate, endDate, variables, latitude, longitude) {
    // Construct the URL for the API request
    const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&hourly=${variables.join(',')}`;
    
    try {
        // Make the API request
        const response = await axios.get(url);
        
        // Check if the response status is OK
        if (response.status === 200) {
            // Write the data to a file
            const outputPath = `ERA5_data_${latitude}_${longitude}_${startDate}_to_${endDate}.json`;
            fs.writeFileSync(outputPath, JSON.stringify(response.data, null, 2));
            console.log(`Data successfully downloaded and saved to ${outputPath}`);
        } else {
            console.error(`Failed to download data. Status code: ${response.status}`);
        }
    } catch (error) {
        console.error(`Error occurred while downloading data: ${error.message}`);
    }
}

