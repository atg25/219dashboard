import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const GeographicMap = () => {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [usMap, setUsMap] = useState(null);
  const [error, setError] = useState(null);
  const [demographic, setDemographic] = useState('hispanic');
  const [year, setYear] = useState(2021);

  const demographicOptions = ['hispanic', 'black', 'asian', 'other'];
  const yearOptions = Array.from({length: 11}, (_, i) => 2011 + i);

  // Define color scales for each demographic - using more saturated colors
  const colorScales = {
    hispanic: d3.scaleSequential(d3.interpolateYlGn).interpolator(d3.interpolate("#ffffd9", "#FFD700")),
    black: d3.scaleSequential(d3.interpolateGreens).interpolator(d3.interpolate("#edf8e9", "#005a32")),
    asian: d3.scaleSequential(d3.interpolateOranges).interpolator(d3.interpolate("#feedde", "#a63603")),
    other: d3.scaleSequential(d3.interpolatePurples).interpolator(d3.interpolate("#f2f0f7", "#54278f"))
  };

  // Load map and data
  useEffect(() => {
    const loadData = async () => {
      try {
        // In a real implementation, you would load both the map data and STEM data
        // For this example, we're using US states TopoJSON and synthetic data
        
        // Load US map data (would be a real fetch in production)
        const usMapData = await fetch('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json')
          .then(response => response.json());
        
        setUsMap(usMapData);
        
        // Generate synthetic STEM data by state and demographic
        // In a real implementation, you would load actual data
        const states = topojson.feature(usMapData, usMapData.objects.states).features;
        
        // Create synthetic data for all states, demographics, and years
        const syntheticData = [];
        
        // First, let's extract the proper state features and IDs from the topojson
        const stateFeatures = topojson.feature(usMapData, usMapData.objects.states).features;
        console.log('State Features:', stateFeatures);
        
        // Create a comprehensive state mapping with correct FIPS codes
        const stateNamesByFips = {
          '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California',
          '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '11': 'District of Columbia',
          '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois',
          '18': 'Indiana', '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana',
          '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
          '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska', '32': 'Nevada',
          '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico', '36': 'New York',
          '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma', '41': 'Oregon',
          '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina', '46': 'South Dakota',
          '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont', '51': 'Virginia',
          '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming',
          '60': 'American Samoa', '66': 'Guam', '69': 'Northern Mariana Islands', '72': 'Puerto Rico',
          '78': 'U.S. Virgin Islands'
        };
        
        states.forEach((state, index) => {
          // Get the index or ID of the state
          const stateId = state.id;
          
          // Format the ID as a two-digit string if it's a number
          let formattedId = stateId;
          if (typeof stateId === 'number') {
            formattedId = stateId < 10 ? `0${stateId}` : `${stateId}`;
          } else if (typeof stateId === 'string') {
            // Remove any non-numeric characters and ensure two digits
            formattedId = stateId.replace(/\D/g, '');
            formattedId = formattedId.length === 1 ? `0${formattedId}` : formattedId;
          }
          
          // Get the proper state name
          let stateName = stateNamesByFips[formattedId];
          
          // Fallback: if we can't find a proper name, use a predefined list as backup
          if (!stateName) {
            const stateNames = [
              "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
              "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
              "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
              "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
              "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
              "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
              "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
              "Wisconsin", "Wyoming", "District of Columbia"
            ];
            
            // Use the index as a fallback (since it appears related to alphabetical ordering)
            stateName = stateNames[index % stateNames.length];
            console.log(`Using fallback name for ID ${stateId}: ${stateName} (index: ${index})`);
          }
          
          // Growth factors - some states have higher growth for specific demographics
          // These would be based on real data in production
          const baseGrowth = {
            hispanic: Math.random() * 80 + 20, // 20-100% growth
            black: Math.random() * 50 + 10,    // 10-60% growth
            asian: Math.random() * 70 + 30,    // 30-100% growth
            other: Math.random() * 40 + 20     // 20-60% growth
          };
          
          // Special cases - higher Hispanic growth in southwest, etc.
          if (["Arizona", "New Mexico", "California", "Texas", "Nevada", "Florida"].includes(stateName)) {
            baseGrowth.hispanic *= 1.5; // Higher Hispanic growth in these states
          }
          
          if (["Georgia", "Maryland", "South Carolina", "Alabama", "Mississippi"].includes(stateName)) {
            baseGrowth.black *= 1.3; // Higher Black student growth in these states
          }
          
          if (["California", "Washington", "New York", "New Jersey"].includes(stateName)) {
            baseGrowth.asian *= 1.3; // Higher Asian student growth in these states
          }
          
          // Generate data for each year and demographic
          yearOptions.forEach(dataYear => {
            demographicOptions.forEach(demo => {
              // Growth increases each year from the base in 2011
              const yearFactor = (dataYear - 2011) / 10; // 0 to 1 over the decade
              const growthPercent = baseGrowth[demo] * (1 + yearFactor);
              
              // Calculate the value
              const baseValue = Math.random() * 10000 + 5000; // Base STEM degrees in 2011
              const value = baseValue * (1 + (growthPercent / 100) * yearFactor);
              
              syntheticData.push({
                stateId: formattedId,
                stateName,
                demographic: demo,
                year: dataYear,
                value: Math.round(value),
                growthPercent: Math.round(growthPercent * yearFactor)
              });
            });
          });
        });
        
        setData(syntheticData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Failed to load data: ${err.message}`);
      }
    };

    loadData();
  }, []);

  // Render map
  useEffect(() => {
    if (!data || !usMap || !svgRef.current) return;

    try {
      // Filter data for selected demographic and year
      const filteredData = data.filter(d => 
        d.demographic === demographic && d.year === year
      );
      
      const margin = { top: 50, right: 20, bottom: 50, left: 20 };
      const width = 960 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;

      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();
      
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Create projection
      const projection = d3.geoAlbersUsa()
        .fitSize([width, height], topojson.feature(usMap, usMap.objects.states));
        
      const path = d3.geoPath()
        .projection(projection);

      // Extract states
      const states = topojson.feature(usMap, usMap.objects.states).features;

      // Set color scale for selected demographic with better contrast
      const values = filteredData.map(d => d.value);
      // Use quantile scale for better color distribution
      const colorScale = d3.scaleQuantile()
        .domain(values)
        .range(d3.quantize(colorScales[demographic].interpolator(), 9));

      // Draw states with animation
      g.selectAll('.state')
        .data(states)
        .enter()
        .append('path')
        .attr('class', 'state')
        .attr('d', path)
        .attr('fill', d => {
          const stateData = filteredData.find(s => s.stateId === d.id);
          return stateData ? colorScale(stateData.value) : '#e6e6e6';
        })
        .attr('stroke', '#333')
        .attr('stroke-width', 1)
        .style('opacity', 0) // Start with opacity 0 for animation
        .transition()
        .duration(1000)
        .delay((d, i) => i * 5)
        .style('opacity', 1) // Fade in
        .on('end', function(d, i) {
          // Add tooltip interactivity after animation
          d3.select(this)
            .on('mouseover', function(event, d) {
              const stateData = filteredData.find(s => s.stateId === d.id);
              if (!stateData) return;
              
              d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 2)
                .attr('stroke', '#333');
                
              const [x, y] = path.centroid(d);
              
              const tooltip = g.append('g')
                .attr('class', 'tooltip')
                .attr('transform', `translate(${x},${y - 40})`);
                
              tooltip.append('rect')
                .attr('x', -120)
                .attr('y', -70)
                .attr('width', 240)
                .attr('height', 110)
                .attr('fill', 'rgba(0,0,0,0.85)')
                .attr('rx', 5)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);
                
              // Debug info for troubleshooting (will be hidden in final version)
              /*tooltip.append('text')
                .attr('x', 0)
                .attr('y', -40)
                .attr('text-anchor', 'middle')
                .attr('fill', '#aaa')
                .style('font-size', '10px')
                .text(`ID: ${d.id}`);*/
                
              tooltip.append('text')
                .attr('x', 0)
                .attr('y', -45)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .style('font-size', '14px')
                .style('font-weight', 'bold')
                .text(stateData.stateName);
                
              tooltip.append('text')
                .attr('x', 0)
                .attr('y', -15)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .style('font-size', '13px')
                .text(`${stateData.value.toLocaleString()} degrees`);
                
              tooltip.append('text')
                .attr('x', 0)
                .attr('y', 15)
                .attr('text-anchor', 'middle')
                .attr('fill', '#fff')
                .style('font-size', '12px')
                .text(`Growth: +${stateData.growthPercent}% since 2011`);
            })
            .on('mouseout', function() {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 1)
                .attr('stroke', '#333');
                
              g.selectAll('.tooltip').remove();
            });
        });

      // Add title
      svg.append('text')
        .attr('x', width / 2 + margin.left)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(`${demographic.charAt(0).toUpperCase() + demographic.slice(1)} STEM Degrees by State (${year})`);

      // Add legend
      const legendWidth = 300;
      const legendHeight = 15;
      const legendX = width - legendWidth - 10;
      const legendY = height + 20;
      
      const legendScale = d3.scaleLinear()
        .domain([d3.min(values), d3.max(values)])
        .range([0, legendWidth]);
        
      const legendAxis = d3.axisBottom(legendScale)
        .tickSize(legendHeight)
        .tickFormat(d3.format(',d'));
        
      const defs = svg.append('defs');
      
      const legendGradient = defs.append('linearGradient')
        .attr('id', 'legend-gradient')
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '0%');
        
      // Add gradient stops with better color contrast
      // Use multiple stops for a more detailed gradient
      d3.range(0, 10).forEach(i => {
        legendGradient.append('stop')
          .attr('offset', `${i * 10}%`)
          .attr('stop-color', d3.quantize(colorScales[demographic].interpolator(), 10)[i] || '#ccc');
      });
        
      // Draw legend rectangle
      svg.append('rect')
        .attr('x', legendX)
        .attr('y', legendY)
        .attr('width', legendWidth)
        .attr('height', legendHeight)
        .style('fill', 'url(#legend-gradient)');
        
      // Add legend axis
      svg.append('g')
        .attr('transform', `translate(${legendX},${legendY})`)
        .call(legendAxis)
        .select('.domain').remove();

    } catch (err) {
      console.error('Error rendering map:', err);
      setError(`Failed to render map: ${err.message}`);
    }
  }, [data, usMap, demographic, year]);

  return (
    <div className="geographic-map-container" style={{ padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', margin: '20px 0' }}>
      <div className="map-controls" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="control-group" style={{ marginRight: '15px', marginBottom: '10px' }}>
          <h4 style={{ marginBottom: '10px' }}>Select Demographic</h4>
          <select 
            value={demographic} 
            onChange={(e) => setDemographic(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
          >
            {demographicOptions.map(demo => (
              <option key={demo} value={demo}>
                {demo.charAt(0).toUpperCase() + demo.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="control-group" style={{ marginBottom: '10px' }}>
          <h4 style={{ marginBottom: '10px' }}>Select Year</h4>
          <select 
            value={year} 
            onChange={(e) => setYear(parseInt(e.target.value))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '150px' }}
          >
            {yearOptions.map(yearOption => (
              <option key={yearOption} value={yearOption}>{yearOption}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div style={{ width: '100%', minHeight: '600px', border: '1px solid #ccc', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', overflow: 'visible', backgroundColor: '#fff' }}>
        {error ? (
          <div className="error-message" style={{ color: 'red', fontWeight: 'bold' }}>{error}</div>
        ) : !data || !usMap ? (
          <div className="loading-message" style={{ color: '#666' }}>Loading map data...</div>
        ) : (
          <svg ref={svgRef} style={{ width: '100%', height: '600px', maxWidth: '960px', overflow: 'visible' }} />
        )}
      </div>
      
      <div style={{ padding: '15px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #ccc' }}>
        <h4 style={{ marginBottom: '15px', borderBottom: '2px solid #007bff', paddingBottom: '8px', color: '#007bff' }}>Geographic Insights</h4>
        <p>This map reveals regional variations in <strong>{demographic}</strong> STEM degree attainment across the United States in <strong>{year}</strong>.</p>
        <p>Hover over states to see detailed statistics. Notice how STEM degree patterns correlate with:</p>
        <ul style={{ paddingLeft: '20px' }}>
          <li>Regional demographic populations</li>
          <li>Presence of Hispanic-Serving Institutions (HSIs) in southwestern states</li>
          <li>State-level educational investments and policies</li>
        </ul>
      </div>
    </div>
  );
};

export default GeographicMap;
