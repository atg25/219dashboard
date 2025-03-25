import React from 'react';

function ScatterChart() {
  return (
    <div style={{ 
      width: '100%', 
      height: '300px', 
      border: '2px dashed #ccc', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '1rem',
      boxSizing: 'border-box'
    }}>
      <p style={{ textAlign: 'center' }}>
        Placeholder for Advanced Scatter Plot Analysis.<br/>
        Disclaimer: Data for this chart are estimated. For accurate data, please refer to the 
        <a href="https://nces.ed.gov/ipeds/search?query=Stem%20degrees" target="_blank" rel="noopener noreferrer">IPEDS Data set</a> 
        and the <a href="https://www.census.gov" target="_blank" rel="noopener noreferrer">US Census Bureau</a>.
      </p>
    </div>
  );
}

export default ScatterChart;
