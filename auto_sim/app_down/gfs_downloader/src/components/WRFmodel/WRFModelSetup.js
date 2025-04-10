// Import React and necessary hooks for state management and side effects
import React, { useEffect, useState, useRef } from 'react';
// Import Leaflet and related packages for the map functionality
import { MapContainer, TileLayer, Rectangle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS for map styling
import L from 'leaflet'; // Import core Leaflet library for map functionality
// Import the CSS file for styling the WRF Model Setup component
import './WRFModelSetup.css';
// Import the HTML component for displaying the structure
import WRFModelSetupHTML from './WRFModelSetupHTML';

/**
 * Fix for Leaflet default marker icon issue in React
 * This is a common issue when using Leaflet with React because the way webpack packages assets
 * The paths to marker icons get broken in the build process, so we need to explicitly set them
 */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

/**
 * MapController - Component to control map view programmatically
 * This allows us to change the map view without direct user interaction
 * Uses Leaflet's flyTo method for a smooth transition to a new location
 * 
 * @param {Object} props - Component props
 * @param {Array} props.center - Center coordinates [lat, lng] to fly to
 * @param {number} props.zoom - Zoom level to apply
 * @param {boolean} props.shouldFly - Flag indicating whether to fly to the center
 */
const MapController = ({ center, zoom, shouldFly }) => {
  // Get access to the Leaflet map instance using the useMap hook
  const map = useMap();
  
  // useEffect hook runs when dependencies (shouldFly, center, zoom) change
  useEffect(() => {
    // Only fly to the location if shouldFly is true and we have valid coordinates
    if (shouldFly && center && center.length === 2) {
      // Use flyTo for a smooth animated transition to the new location
      // The duration parameter controls how long the animation lasts in seconds
      map.flyTo(center, zoom, { 
        animate: true,  // Enable animation
        duration: 1.5,  // Animation duration in seconds
        easeLinearity: 0.25 // Control the animation curve (lower is more natural)
      });
    }
  }, [map, center, zoom, shouldFly]);
  
  // This component doesn't render anything visible
  return null;
};

/**
 * WRFModelSetup - Component for setting up and configuring the WRF model
 * Main component that handles logic, state management, and data processing
 * 
 * Features:
 * - Import .wps or .input configuration files
 * - Parse WRF configuration parameters from imported files
 * - Display file contents in a text viewer
 * - Render domains as rectangles on an interactive map
 * - Automatically fly to the domain location when a file is uploaded
 */
const WRFModelSetup = () => {
  // STATE VARIABLES
  // ---------------
  
  // File handling state
  const [fileContents, setFileContents] = useState(''); // Store the imported file contents as text
  const [fileName, setFileName] = useState(''); // Store the name of the imported file
  
  // Map control state
  const [mapCenter, setMapCenter] = useState([28.0836, -80.6081]); // Default center at Melbourne, Florida
  const [mapZoom, setMapZoom] = useState(5); // Default zoom level (1-18, where higher is more zoomed in)
  const [shouldFlyToCenter, setShouldFlyToCenter] = useState(false); // Flag to control flying to the center
  
  // Hardcoded values as requested
  // Using the exact date/time string format as specified in the requirements
  const currentDateTime = "2025-04-10 01:09:30"; // Fixed UTC time in YYYY-MM-DD HH:MM:SS format
  const currentUser = 'nmathewaAlways'; // Fixed username as requested
  
  // WRF configuration state
  // This stores the parsed grid configuration from the imported file
  const [gridConfig, setGridConfig] = useState({
    e_we: [],       // East-west grid points (number of grid cells in each domain)
    e_sn: [],       // South-north grid points (number of grid cells in each domain)
    ref_lat: null,  // Reference latitude (center point of the model domain)
    ref_lon: null,  // Reference longitude (center point of the model domain)
    dx: null,       // Grid resolution in x direction (meters)
    dy: null,       // Grid resolution in y direction (meters)
  });
  
  // REFS
  // ----
  
  // Reference to the file input element
  // This allows us to programmatically control the file input (e.g., clearing its value)
  const fileInputRef = useRef(null);

  /**
   * Parse the WRF configuration file content to extract grid parameters
   * Extracts key parameters from the namelist.input or namelist.wps files
   * 
   * @param {string} content - The text content of the imported WRF file
   * @returns {Object} The extracted grid configuration parameters
   */
  const parseWRFConfig = (content) => {
    // Initialize empty configuration object
    const config = {
      e_we: [],
      e_sn: [],
      ref_lat: null,
      ref_lon: null,
      dx: null,
      dy: null,
    };

    // PARSING EAST-WEST GRID POINTS
    // The e_we parameter defines the number of grid points in the east-west direction for each domain
    // In WRF files, this appears as "e_we = 100,88,76," for multiple domains
    const e_weMatch = content.match(/e_we\s*=\s*([\d,\s]+)/);
    if (e_weMatch && e_weMatch[1]) {
      // Split by comma, convert to integers, and filter out any NaN values
      config.e_we = e_weMatch[1].split(',')
        .map(num => parseInt(num.trim(), 10))
        .filter(num => !isNaN(num));
    }

    // PARSING SOUTH-NORTH GRID POINTS
    // The e_sn parameter defines the number of grid points in the south-north direction for each domain
    // In WRF files, this appears as "e_sn = 89,79,67," for multiple domains
    const e_snMatch = content.match(/e_sn\s*=\s*([\d,\s]+)/);
    if (e_snMatch && e_snMatch[1]) {
      // Split by comma, convert to integers, and filter out any NaN values
      config.e_sn = e_snMatch[1].split(',')
        .map(num => parseInt(num.trim(), 10))
        .filter(num => !isNaN(num));
    }

    // PARSING REFERENCE LATITUDE
    // The ref_lat parameter defines the center latitude of the domain
    const ref_latMatch = content.match(/ref_lat\s*=\s*([\d.]+)/);
    if (ref_latMatch && ref_latMatch[1]) {
      config.ref_lat = parseFloat(ref_latMatch[1].trim());
    }

    // PARSING REFERENCE LONGITUDE
    // The ref_lon parameter defines the center longitude of the domain
    const ref_lonMatch = content.match(/ref_lon\s*=\s*([\d.]+)/);
    if (ref_lonMatch && ref_lonMatch[1]) {
      config.ref_lon = parseFloat(ref_lonMatch[1].trim());
    }

    // PARSING GRID X-RESOLUTION
    // The dx parameter defines the grid spacing in meters in the x direction
    const dxMatch = content.match(/dx\s*=\s*([\d.]+)/);
    if (dxMatch && dxMatch[1]) {
      config.dx = parseFloat(dxMatch[1].trim());
    }

    // PARSING GRID Y-RESOLUTION
    // The dy parameter defines the grid spacing in meters in the y direction
    const dyMatch = content.match(/dy\s*=\s*([\d.]+)/);
    if (dyMatch && dyMatch[1]) {
      config.dy = parseFloat(dyMatch[1].trim());
    }

    return config;
  };

  /**
   * Handle the file import process
   * Validates the file extension, reads the content, and parses WRF configuration
   * 
   * @param {Event} event - The file input change event
   */
  const handleFileImport = (event) => {
    // Get the selected file from the input element
    const file = event.target.files[0];
    
    // Check if a file was actually selected (could be null if user cancels)
    if (!file) return;

    // Validate file extension to ensure it's a WRF configuration file
    // WRF configuration files typically have .input or .wps extensions
    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (fileExtension !== 'input' && fileExtension !== 'wps') {
      // Alert user and reset the file input if the extension is invalid
      alert('Please select a file with .input or .wps extension');
      event.target.value = null; // Clear the file input
      return;
    }

    // Store the file name to display it in the UI
    setFileName(file.name);
    
    // Create a FileReader to read the text content of the file
    const reader = new FileReader();
    
    // Set up the onload event handler for the FileReader
    // This runs after the file has been successfully read
    reader.onload = (e) => {
      // Get the content of the file as text
      const content = e.target.result;
      
      // Update state with the file contents to display in the UI
      setFileContents(content);
      
      // Parse the WRF configuration from the file content
      const parsedConfig = parseWRFConfig(content);
      setGridConfig(parsedConfig);
      
      // If reference coordinates are specified in the file,
      // update the map center to focus on the domain location
      if (parsedConfig.ref_lat !== null && parsedConfig.ref_lon !== null) {
        // Set the map center to the parsed reference coordinates
        setMapCenter([parsedConfig.ref_lat, parsedConfig.ref_lon]);
        
        // Calculate an appropriate zoom level based on the domain size
        // This ensures the entire domain is visible in the map view
        if (parsedConfig.e_we.length > 0 && parsedConfig.dx) {
          // Calculate the approximate width of the domain in kilometers
          const domainWidth = parsedConfig.e_we[0] * parsedConfig.dx / 1000; // in km
          
          // Adjust zoom based on domain width: smaller domains get higher zoom levels
          // The formula uses logarithmic scaling so zoom decreases as domain size increases
          // Min zoom level: 5, Max zoom level: 10
          const calculatedZoom = Math.max(5, Math.min(10, Math.floor(12 - Math.log(domainWidth) / Math.log(2))));
          setMapZoom(calculatedZoom);
        }
        
        // Trigger the map to fly to the new center location
        setShouldFlyToCenter(true);
      }
    };
    
    // Set up error handling for the file reading process
    reader.onerror = () => {
      alert('Error reading file');
      // Reset file-related state on error
      setFileContents('');
      setFileName('');
    };
    
    // Start reading the file as text
    reader.readAsText(file);
  };

  /**
   * Clear the file and its contents
   * Resets the file input element and all file-related state
   */
  const clearFile = () => {
    // Reset all file-related state variables
    setFileContents('');
    setFileName('');
    setGridConfig({
      e_we: [],
      e_sn: [],
      ref_lat: null,
      ref_lon: null,
      dx: null,
      dy: null,
    });
    
    // Disable flying to center as we no longer have a domain reference
    setShouldFlyToCenter(false);
    
    // Reset the file input element to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  /**
   * Generate grid rectangles based on the WRF configuration
   * Creates rectangles representing each domain to display on the map
   * 
   * @returns {Array} Array of grid rectangles to be displayed on the map
   */
  const generateGridRectangles = () => {
    // Check if we have all required configuration to generate grid rectangles
    if (!gridConfig.ref_lat || !gridConfig.ref_lon || !gridConfig.dx || !gridConfig.dy || 
        gridConfig.e_we.length === 0 || gridConfig.e_sn.length === 0) {
      return [];
    }

    // EARTH GEOMETRY CALCULATIONS
    // These calculations convert grid dimensions from meters to lat/lon coordinates
    
    // The distance in kilometers per degree of latitude is roughly constant globally
    const lat_km_per_degree = 111.32; // km per degree of latitude
    
    // The distance in kilometers per degree of longitude varies with latitude
    // It decreases as you move away from the equator due to the Earth's curvature
    // We calculate it based on the cosine of the latitude in radians
    const lon_km_per_degree = 111.32 * Math.cos(gridConfig.ref_lat * (Math.PI / 180)); 
    
    // Convert grid cell size from meters to degrees
    // First convert meters to km, then divide by km per degree
    const lat_cell_size = gridConfig.dy / 1000 / lat_km_per_degree; 
    const lon_cell_size = gridConfig.dx / 1000 / lon_km_per_degree; 

    // Generate grid rectangles for each domain
    // WRF typically uses multiple nested domains with different resolutions
    const domains = [];
    for (let d = 0; d < gridConfig.e_we.length; d++) {
      // Get grid dimensions for this domain
      const domain_width = gridConfig.e_we[d];   // Number of grid points in E-W direction
      const domain_height = gridConfig.e_sn[d];  // Number of grid points in S-N direction
      
      // Calculate the total domain size in degrees
      // The reference point is at the center of the domain
      const domain_lat_diff = (domain_height * lat_cell_size) / 2;
      const domain_lon_diff = (domain_width * lon_cell_size) / 2;
      
      // Calculate the corners of the domain rectangle
      const south = gridConfig.ref_lat - domain_lat_diff;
      const north = gridConfig.ref_lat + domain_lat_diff;
      const west = gridConfig.ref_lon - domain_lon_diff;
      const east = gridConfig.ref_lon + domain_lon_diff;

      // Create the domain rectangle object
      domains.push({
        id: d + 1, // Domain ID (1-based for user display)
        bounds: [
          [south, west], // Southwest corner [lat, lon]
          [north, east]  // Northeast corner [lat, lon]
        ],
        // Assign different colors to different domains
        // Domain 1: Red, Domain 2: Blue, Domain 3+: Green
        color: d === 0 ? 'red' : d === 1 ? 'blue' : 'green'
      });
    }
    
    return domains;
  };

  // Render the component using the separate HTML component
  // Pass all necessary props to the HTML component for rendering
  return (
    <WRFModelSetupHTML 
      // File related props
      fileContents={fileContents}
      fileName={fileName}
      fileInputRef={fileInputRef}
      
      // Map related props
      mapCenter={mapCenter}
      mapZoom={mapZoom}
      shouldFlyToCenter={shouldFlyToCenter}
      
      // WRF configuration props
      gridConfig={gridConfig}
      gridRectangles={generateGridRectangles()}
      
      // Event handlers
      handleFileImport={handleFileImport}
      clearFile={clearFile}
      
      // Fixed display props
      currentDateTime={currentDateTime}
      currentUser={currentUser}
      
      // Components
      MapController={MapController}
    />
  );
};

// Export the component for use in other parts of the application
export default WRFModelSetup;