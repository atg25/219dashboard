// Use the clean state ID for data references
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const ComparisonChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDemographics, setSelectedDemographics] = useState(['hispanic', 'black']);
  const [metric, setMetric] = useState('total'); // 'total', 'growth', 'percentage'
  const [yearRange, setYearRange] = useState([2011, 2021]);

  // Define demographics and colors - only include what's available in the data
  const demographicOptions = ['hispanic', 'black', 'asian', 'other'];
  const colors = ['#ffc658', '#82ca9d', '#ff8042', '#3d426b'];
  
  // Create color scale
  const colorScale = d3.scaleOrdinal()
    .domain(demographicOptions)
    .range(colors);

  // Load CSV data
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading data from /data.csv');
        const result = await d3.csv('/data.csv');
        
        if (!result || result.length === 0) {
          throw new Error('No data loaded');
        }

        console.log('Raw data:', result);

        // Transform data with validation
        const transformedData = result.map(d => {
          // Ensure year is correctly parsed as a number first, then create a Date
          const yearNum = parseInt(d.year);
          // Only include demographics that are in the data
          const row = {
            year: new Date(yearNum, 0), // January 1st of the year
            yearNum: yearNum,
            black: +d.black || 0,
            hispanic: +d.hispanic || 0,
            asian: +d.asian || 0,
            other: +d.other || 0,
          };
          return row;
        }).filter(d => !isNaN(d.yearNum));

        if (transformedData.length === 0) {
          throw new Error('No valid data after transformation');
        }

        console.log('Transformed data:', transformedData);
        
        // Sort data by year to ensure correct order
        transformedData.sort((a, b) => a.yearNum - b.yearNum);
        
        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Failed to load data: ${err.message}`);
      }
    };

    loadData();
  }, []);

  // Calculate growth data
  const calculateGrowthData = () => {
    if (!data || data.length < 2) {
      console.log('No data or not enough data points for growth calculation');
      return [];
    }
    
    // Filter data by selected year range
    const startYear = yearRange[0];
    const endYear = yearRange[1];
    
    console.log(`Calculating growth data from ${startYear} to ${endYear}`);
    
    // Get the first and last data points in the selected range
    const startData = data.find(d => d.yearNum === startYear);
    const endData = data.find(d => d.yearNum === endYear);
    
    console.log('Start data:', startData);
    console.log('End data:', endData);
    
    if (!startData || !endData) {
      console.log('Could not find start or end year data');
      return [];
    }
    
    // Calculate growth for each demographic
    const result = demographicOptions.map(demo => {
      const startValue = startData[demo];
      const endValue = endData[demo];
      const growth = endValue - startValue;
      const percentage = startValue > 0 ? (growth / startValue) * 100 : 0;
      
      return {
        demographic: demo,
        startValue,
        endValue,
        growth,
        percentage
      };
    });
    
    console.log('Growth data results:', result);
    return result;
  };

  // Render chart
  useEffect(() => {
    if (!data || !data.length || !svgRef.current) {
      console.log('Missing requirements for chart rendering', { 
        hasData: Boolean(data), 
        dataLength: data?.length, 
        hasSvgRef: Boolean(svgRef.current) 
      });
      return;
    }

    try {
      console.log('Starting chart rendering');
      // Get growth data
      const growthData = calculateGrowthData();
      
      // Filter data by selected demographics
      const filteredData = growthData.filter(d => 
        selectedDemographics.includes(d.demographic)
      );
      console.log('Filtered data for selected demographics:', filteredData);

      if (filteredData.length === 0) {
        console.log('No filtered data available for chart');
        return;
      }

      const margin = { top: 50, right: 150, bottom: 80, left: 80 };
      const width = 700 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();
      
      // Set explicit dimensions on the SVG element
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Determine metric to display
      const metricMap = {
        'total': d => d.endValue,
        'growth': d => d.growth,
        'percentage': d => d.percentage
      };
      
      const metricValue = metricMap[metric];
      const metricLabel = {
        'total': `Total STEM Degrees (${yearRange[1]})`,
        'growth': `Growth in STEM Degrees (${yearRange[0]}-${yearRange[1]})`,
        'percentage': 'Percentage Growth (%)'
      }[metric];
      
      console.log('Using metric:', metric, 'with label:', metricLabel);

      // Set scales
      const xScale = d3.scaleBand()
        .domain(filteredData.map(d => d.demographic))
        .range([0, width])
        .padding(0.3);

      // Ensure there's a reasonable range for the yScale
      const maxValue = d3.max(filteredData, metricValue) || 0;
      const yMax = Math.max(maxValue * 1.1, 1); // Ensure we have at least some height even with zero values

      console.log('Y-axis max value:', yMax);
      
      const yScale = d3.scaleLinear()
        .domain([0, yMax])
        .range([height, 0]);
        
      console.log('Scale domains:', { 
        xDomain: xScale.domain(), 
        yDomain: yScale.domain() 
      });

      // Add grid lines
      g.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke', '#e0e0e0')
        .attr('stroke-dasharray', '3,3');

      // Add bars with transitions
      g.selectAll('.bar')
        .data(filteredData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.demographic))
        .attr('width', xScale.bandwidth())
        .attr('y', height) // Start from bottom for animation
        .attr('height', 0) // Start with height 0 for animation
        .attr('fill', d => colorScale(d.demographic))
        .attr('rx', 4) // Rounded corners
        .attr('ry', 4)
        .transition() // Add transition
        .duration(800)
        .delay((d, i) => i * 100)
        .attr('y', d => yScale(metricValue(d)))
        .attr('height', d => height - yScale(metricValue(d)));

      // Add labels
      g.selectAll('.value-label')
        .data(filteredData)
        .enter()
        .append('text')
        .attr('class', 'value-label')
        .attr('x', d => xScale(d.demographic) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(metricValue(d)) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('opacity', 0) // Start invisible for animation
        .text(d => {
          if (metric === 'percentage') {
            return `${metricValue(d).toFixed(1)}%`;
          }
          return metricValue(d).toLocaleString();
        })
        .transition()
        .duration(800)
        .delay((d, i) => i * 100 + 300)
        .style('opacity', 1); // Fade in

      // Add demographic labels on x-axis
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .tickFormat(d => d.charAt(0).toUpperCase() + d.slice(1)))
        .selectAll('text')
        .style('font-size', '12px')
        .style('text-anchor', 'middle')
        .attr('transform', 'rotate(0)');

      // Add y-axis
      g.append('g')
        .call(d3.axisLeft(yScale)
          .tickFormat(d => {
            if (metric === 'percentage') {
              return `${d}%`;
            }
            return d3.format(',d')(d);
          }))
        .selectAll('text')
        .style('font-size', '12px');

      // Add axis labels
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(metricLabel);

      // Add chart title
      svg.append('text')
        .attr('x', width / 2 + margin.left)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(`Demographic Comparison (${yearRange[0]}-${yearRange[1]})`);

    } catch (err) {
      console.error('Error rendering chart:', err);
      setError(`Failed to render chart: ${err.message}`);
    }
  }, [data, selectedDemographics, metric, yearRange]);

  // Handle demographic selection
  const handleDemographicChange = (demo) => {
    setSelectedDemographics(current => {
      if (current.includes(demo)) {
        // Remove if already selected
        return current.filter(d => d !== demo);
      } else {
        // Add if not selected (limit to 3 max)
        return current.length < 3 ? [...current, demo] : current;
      }
    });
  };

  // Handle metric change
  const handleMetricChange = (e) => {
    setMetric(e.target.value);
  };

  // Handle year range change
  const handleYearRangeChange = (e, index) => {
    const value = parseInt(e.target.value);
    setYearRange(current => {
      const newRange = [...current];
      newRange[index] = value;
      return newRange;
    });
  };

  return (
    <div className="comparison-chart-container">
      <div className="chart-controls">
        <div className="control-group">
          <h4>Select Demographics (max 3)</h4>
          <div className="demographic-toggles">
            {demographicOptions.map(demo => (
              <button
                key={demo}
                className={`demographic-toggle ${selectedDemographics.includes(demo) ? 'active' : ''}`}
                style={{ borderColor: colorScale(demo) }}
                onClick={() => handleDemographicChange(demo)}
              >
                {demo.charAt(0).toUpperCase() + demo.slice(1)}
              </button>
            ))}
          </div>
        </div>
        
        <div className="control-group">
          <h4>Select Metric</h4>
          <div className="metric-selector">
            <select value={metric} onChange={handleMetricChange}>
              <option value="total">Total Degrees (2021)</option>
              <option value="growth">Numeric Growth</option>
              <option value="percentage">Percentage Growth</option>
            </select>
          </div>
        </div>
        
        <div className="control-group">
          <h4>Select Year Range</h4>
          <div className="year-range-selector">
            <div>
              <label>Start Year:</label>
              <select 
                value={yearRange[0]} 
                onChange={(e) => handleYearRangeChange(e, 0)}
              >
                {Array.from({length: 11}, (_, i) => 2011 + i).map(year => (
                  <option key={`start-${year}`} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label>End Year:</label>
              <select 
                value={yearRange[1]} 
                onChange={(e) => handleYearRangeChange(e, 1)}
              >
                {Array.from({length: 11}, (_, i) => 2011 + i).map(year => (
                  <option key={`end-${year}`} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="chart-container" style={{ width: '100%', minHeight: '400px', border: '1px solid #eee', margin: '20px 0', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px', overflow: 'visible' }}>
        {error ? (
          <div className="error-message">{error}</div>
        ) : !data ? (
          <div className="loading-message">Loading data...</div>
        ) : selectedDemographics.length === 0 ? (
          <div className="no-selection-message">Please select at least one demographic to compare</div>
        ) : (
          <svg ref={svgRef} style={{ width: '100%', height: '400px', maxWidth: '800px', overflow: 'visible' }} />
        )}
      </div>
      
      <div className="chart-insights">
        <h4>Key Observations</h4>
        {data && selectedDemographics.length > 0 && (
          <ul className="insights-list">
            {selectedDemographics.map(demo => {
              const growthData = calculateGrowthData().find(d => d.demographic === demo);
              if (!growthData) return null;
              
              return (
                <li key={demo} style={{ borderLeft: `3px solid ${colorScale(demo)}` }}>
                  <strong>{demo.charAt(0).toUpperCase() + demo.slice(1)}</strong>: 
                  {metric === 'total' && ` ${growthData.endValue.toLocaleString()} degrees in ${yearRange[1]}`}
                  {metric === 'growth' && ` Increased by ${growthData.growth.toLocaleString()} degrees`}
                  {metric === 'percentage' && ` ${growthData.percentage.toFixed(1)}% growth from ${yearRange[0]} to ${yearRange[1]}`}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};



export default ComparisonChart;
