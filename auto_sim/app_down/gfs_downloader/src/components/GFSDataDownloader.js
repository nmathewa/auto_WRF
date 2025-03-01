import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import './GFSDataDownloader.css';

const GFSDataDownloader = () => {
  // Current user info and time
  const [currentUser] = useState('nmathewa');
  const [currentUTC, setCurrentUTC] = useState('');
  
  // State for date pickers
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  
  // Selected hours and file types
  const [selectedHours, setSelectedHours] = useState(['00', '06', '12', '18']);
  const [selectedFileTypes, setSelectedFileTypes] = useState(['anl']);
  
  // State for coordinate inputs
  const [coordinates, setCoordinates] = useState({
    leftlon: 60,
    rightlon: 100,
    toplat: 40,
    bottomlat: 0
  });
  
  // State for generated links and UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedLinks, setGeneratedLinks] = useState([]);
  
  // Available hours in GFS data
  const availableHours = ['00', '06', '12', '18'];
  
  // Available file types (anl = analysis, f000 to f384 = forecast hours)
  const fileTypes = [
    { value: 'anl', label: 'Analysis' },
    ...Array.from({ length: 65 }, (_, i) => ({ 
      value: `f${String(i*6).padStart(3, '0')}`, 
      label: `${i*6}h forecast` 
    }))
  ];

  // Update current UTC time
  useEffect(() => {
    const updateCurrentUTC = () => {
      const now = new Date();
      const formatted = formatUTCDateTime(now);
      setCurrentUTC(formatted);
    };

    updateCurrentUTC();
    const interval = setInterval(updateCurrentUTC, 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Format a date to YYYY-MM-DD HH:MM:SS in UTC
  const formatUTCDateTime = (date) => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Format a date to YYYYMMDD
  const formatDateForUrl = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}${month}${day}`;
  };

  // Handle coordinate input changes
  const handleCoordinateChange = (e) => {
    const { name, value } = e.target;
    setCoordinates(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  // Handle hour selection
  const handleHourChange = (hour) => {
    setSelectedHours(prev => {
      if (prev.includes(hour)) {
        return prev.filter(h => h !== hour);
      } else {
        return [...prev, hour];
      }
    });
  };

  // Handle file type selection
  const handleFileTypeChange = (e) => {
    const value = e.target.value;
    if (value === "all") {
      setSelectedFileTypes(fileTypes.map(ft => ft.value));
    } else if (value === "anl_only") {
      setSelectedFileTypes(['anl']);
    } else if (value === "forecasts_only") {
      setSelectedFileTypes(fileTypes.filter(ft => ft.value !== 'anl').map(ft => ft.value));
    } else if (value === "clear") {
      setSelectedFileTypes([]);
    } else {
      // Add or remove individual file types
      setSelectedFileTypes(prev => {
        if (prev.includes(value)) {
          return prev.filter(ft => ft !== value);
        } else {
          return [...prev, value];
        }
      });
    }
  };

  // Get dates between start and end date
  const getDatesBetween = (startDate, endDate) => {
    const dates = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  // Construct a single download URL
  const constructUrl = (date, hour, fileType) => {
    const dateStr = formatDateForUrl(date);
    
    // Construct the URL components
    const baseUrl = 'https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_0p25_1hr.pl';
    const dirParam = `%2Fgfs.${dateStr}%2F${hour}%2Fatmos`;
    const fileParam = `gfs.t${hour}z.pgrb2.0p25.${fileType}`;
    
    // Construct the complete URL with coordinates
    const completeUrl = `${baseUrl}?dir=${dirParam}&file=${fileParam}&all_var=on&all_lev=on` +
      `&leftlon=${coordinates.leftlon}` +
      `&rightlon=${coordinates.rightlon}` +
      `&toplat=${coordinates.toplat}` +
      `&bottomlat=${coordinates.bottomlat}`;
    
    return {
      url: completeUrl,
      date: date.toISOString().split('T')[0],
      hour,
      fileType,
      label: fileType === 'anl' ? 'Analysis' : `${parseInt(fileType.substring(1))}h forecast`
    };
  };

  // Generate all download links based on selections
  const generateDownloadLinks = () => {
    try {
      setLoading(true);
      setError(null);
      
      if (selectedHours.length === 0 || selectedFileTypes.length === 0) {
        setError("Please select at least one hour and file type");
        setLoading(false);
        return;
      }
      
      // Get all dates between start and end
      const allDates = getDatesBetween(startDate, endDate);
      
      // Generate links for each combination
      const links = [];
      
      allDates.forEach(date => {
        selectedHours.forEach(hour => {
          selectedFileTypes.forEach(fileType => {
            links.push(constructUrl(date, hour, fileType));
          });
        });
      });
      
      setGeneratedLinks(links);
      setLoading(false);
      
      // Scroll to the links section
      setTimeout(() => {
        const linkSection = document.getElementById('downloads-section');
        if (linkSection) {
          linkSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
    } catch (err) {
      setError('Failed to generate download links: ' + err.message);
      setLoading(false);
    }
  };

  // Download all links as a text file
  const downloadLinksAsText = () => {
    if (generatedLinks.length === 0) return;
    
    // Create content with the URLs
    const content = generatedLinks.map(link => 
      `${link.date} ${link.hour}Z ${link.label}\n${link.url}\n\n`
    ).join('');
    
    // Create and trigger download
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `gfs_download_links_${formatDateForUrl(new Date())}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="gfs-downloader">
      <h2>GFS Forecast Data Downloader</h2>
      
      <div className="user-info">
        <p>Current Date and Time (UTC): {currentUTC}</p>
        <p>Current User's Login: {currentUser}</p>
      </div>
      
      <div className="date-section">
        <div className="date-picker-container">
          <label>Start Date:</label>
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            dateFormat="yyyy-MM-dd"
            className="date-picker"
            minDate={new Date(2020, 0, 1)} // Set a reasonable minimum date
          />
        </div>
        
        <div className="date-picker-container">
          <label>End Date:</label>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            dateFormat="yyyy-MM-dd"
            className="date-picker"
            minDate={startDate}
          />
        </div>
      </div>
      
      <div className="options-section">
        <div className="hours-section">
          <h3>Select Forecast Hours</h3>
          <div className="hours-checkboxes">
            {availableHours.map(hour => (
              <label key={hour} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedHours.includes(hour)}
                  onChange={() => handleHourChange(hour)}
                />
                {hour}Z
              </label>
            ))}
          </div>
        </div>
        
        <div className="file-types-section">
          <h3>Select File Types</h3>
          <div className="file-type-quick-select">
            <button onClick={() => setSelectedFileTypes(['anl'])}>Analysis Only</button>
            <button onClick={() => setSelectedFileTypes(fileTypes.filter(ft => ft.value !== 'anl').map(ft => ft.value))}>All Forecasts</button>
            <button onClick={() => setSelectedFileTypes(fileTypes.map(ft => ft.value))}>All Types</button>
            <button onClick={() => setSelectedFileTypes([])}>Clear</button>
          </div>
          <div className="file-types-container">
            <div className="file-types-checkboxes">
              {fileTypes.slice(0, 11).map(type => (
                <label key={type.value} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedFileTypes.includes(type.value)}
                    value={type.value}
                    onChange={(e) => handleFileTypeChange(e)}
                  />
                  {type.label}
                </label>
              ))}
            </div>
          </div>
          <div className="file-types-message">
            {selectedFileTypes.length === 0 ? (
              <p className="warning">Please select at least one file type</p>
            ) : (
              <p>{selectedFileTypes.length} file type(s) selected</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="coordinates-section">
        <h3>Set Coordinates</h3>
        <div className="coordinate-layout">
          {/* North position - top */}
          <div className="coordinate-north">
            <label>North (Top Latitude):</label>
            <input
              type="number"
              name="toplat"
              value={coordinates.toplat}
              onChange={handleCoordinateChange}
              step="0.25"
            />
          </div>
          
          {/* Middle row - West, Center, East */}
          <div className="coordinate-middle-row">
            {/* West position - left */}
            <div className="coordinate-west">
              <label>West (Left Longitude):</label>
              <input
                type="number"
                name="leftlon"
                value={coordinates.leftlon}
                onChange={handleCoordinateChange}
                step="0.25"
              />
            </div>
            
            {/* Center - Map placeholder */}
            <div className="coordinate-center">
              <div className="map-placeholder"></div>
            </div>
            
            {/* East position - right */}
            <div className="coordinate-east">
              <label>East (Right Longitude):</label>
              <input
                type="number"
                name="rightlon"
                value={coordinates.rightlon}
                onChange={handleCoordinateChange}
                step="0.25"
              />
            </div>
          </div>
          
          {/* South position - bottom */}
          <div className="coordinate-south">
            <label>South (Bottom Latitude):</label>
            <input
              type="number"
              name="bottomlat"
              value={coordinates.bottomlat}
              onChange={handleCoordinateChange}
              step="0.25"
            />
          </div>
        </div>
      </div>
      
      <div className="actions">
        <button 
          onClick={generateDownloadLinks} 
          disabled={loading || selectedHours.length === 0 || selectedFileTypes.length === 0}
          className="download-button"
        >
          {loading ? 'Generating...' : 'Generate Download Links'}
        </button>
      </div>
      
      {error && <div className="error">{error}</div>}
      
      {generatedLinks.length > 0 && (
        <div id="downloads-section" className="download-links-section">
          <div className="download-links-header">
            <h3>Generated Download Links ({generatedLinks.length})</h3>
            <button onClick={downloadLinksAsText} className="download-text-button">
              Download All Links as Text
            </button>
          </div>
          
          <div className="download-links-container">
            {generatedLinks.map((link, index) => (
              <div key={index} className="download-link-item">
                <div className="download-link-details">
                  <span className="download-link-date">{link.date}</span>
                  <span className="download-link-hour">{link.hour}Z</span>
                  <span className="download-link-type">{link.label}</span>
                </div>
                <div className="download-link-actions">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="download-link-button">
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GFSDataDownloader;