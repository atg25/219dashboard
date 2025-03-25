import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const CorrelationChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [primaryFactor, setPrimaryFactor] = useState('hsi_growth');
  const [demographic, setDemographic] = useState('hispanic');

  const factorOptions = [
    { id: 'hsi_growth', label: 'HSI Growth' },
    { id: 'funding_level', label: 'STEM Funding Level' },
    { id: 'population_growth', label: 'Population Growth' },
    { id: 'completion_rate', label: 'Completion Rate' }
  ];

  const demographicOptions = ['hispanic', 'black', 'asian', 'other'];
  
  // Create color map
  const colorMap = {
    'hispanic': '#ffc658',
    'black': '#82ca9d',
    'asian': '#ff8042',
    'other': '#3d426b'
  };

  // Load CSV data
  useEffect(() => {
    const loadData = async () => {
      try {
        // This would normally load real data - using synthetic data for demonstration
        // In a real implementation, you would load actual correlation data from a CSV
        
        // Synthetic data for demonstration - this simulates correlations between 
        // different factors and STEM growth for each demographic
        const syntheticData = [];
        
        // Years from 2011 to 2021
        const years = Array.from({length: 11}, (_, i) => 2011 + i);
        
        // HSI growth data (increases over time)
        const hsiGrowth = years.map((year, i) => ({
          year,
          value: 100 + i * 16, // Starting at 100 HSIs in 2011, growing each year
          factor: 'hsi_growth'
        }));
        
        // Funding level data (fluctuates with overall upward trend)
        const fundingLevel = years.map((year, i) => ({
          year,
          value: 500 + i * 50 + Math.sin(i) * 30, // In millions, with some fluctuation
          factor: 'funding_level'
        }));
        
        // Population growth (steady increase)
        const populationGrowth = years.map((year, i) => ({
          year,
          value: 15000 + i * 400, // In thousands
          factor: 'population_growth'
        }));
        
        // Completion rate (slight improvement)
        const completionRate = years.map((year, i) => ({
          year,
          value: 60 + i * 0.8, // Percentage
          factor: 'completion_rate'
        }));
        
        // STEM degree data for each demographic (these would match your actual data)
        const hispanicSTEM = years.map((year, i) => ({
          year,
          value: 50000 + i * 5000 + (i > 5 ? i * 3000 : 0), // Accelerating growth
          demographic: 'hispanic'
        }));
        
        const blackSTEM = years.map((year, i) => ({
          year,
          value: 45000 + i * 1500,
          demographic: 'black'
        }));
        
        const asianSTEM = years.map((year, i) => ({
          year,
          value: 48000 + i * 3800,
          demographic: 'asian'
        }));
        
        const otherSTEM = years.map((year, i) => ({
          year,
          value: 30000 + i * 2000,
          demographic: 'other'
        }));
        
        // Combine all data
        syntheticData.push(...hsiGrowth, ...fundingLevel, ...populationGrowth, ...completionRate,
                          ...hispanicSTEM, ...blackSTEM, ...asianSTEM, ...otherSTEM);
        
        setData(syntheticData);
        setError(null);
      } catch (err) {
        console.error('Error loading data:', err);
        setError(`Failed to load data: ${err.message}`);
      }
    };

    loadData();
  }, []);

  // Render chart
  useEffect(() => {
    if (!data || !svgRef.current) return;

    try {
      const margin = { top: 50, right: 50, bottom: 70, left: 70 };
      const width = 700 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();
      
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Filter data for selected factor and demographic
      const factorData = data.filter(d => d.factor === primaryFactor);
      const demographicData = data.filter(d => d.demographic === demographic);
      
      if (factorData.length === 0 || demographicData.length === 0) {
        g.append('text')
          .attr('x', width / 2)
          .attr('y', height / 2)
          .attr('text-anchor', 'middle')
          .text('No data available for the selected combination');
        return;
      }
      
      // Create combined data with matching years
      const combinedData = factorData.map(fd => {
        const matchingDemographic = demographicData.find(dd => dd.year === fd.year);
        return {
          year: fd.year,
          factorValue: fd.value,
          stemValue: matchingDemographic ? matchingDemographic.value : null
        };
      }).filter(d => d.stemValue !== null);

      // Set scales
      const xScale = d3.scaleLinear()
        .domain([d3.min(combinedData, d => d.factorValue) * 0.9, 
                d3.max(combinedData, d => d.factorValue) * 1.1])
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([d3.min(combinedData, d => d.stemValue) * 0.9, 
                d3.max(combinedData, d => d.stemValue) * 1.1])
        .range([height, 0]);

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
        
      g.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-height)
          .tickFormat('')
        )
        .selectAll('line')
        .attr('stroke', '#e0e0e0')
        .attr('stroke-dasharray', '3,3');

      // Calculate regression line
      const regression = calculateRegression(combinedData);
      
      // Draw regression line
      const line = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y));
        
      g.append('path')
        .datum([
          { x: d3.min(combinedData, d => d.factorValue), 
            y: regression.slope * d3.min(combinedData, d => d.factorValue) + regression.intercept },
          { x: d3.max(combinedData, d => d.factorValue), 
            y: regression.slope * d3.max(combinedData, d => d.factorValue) + regression.intercept }
        ])
        .attr('fill', 'none')
        .attr('stroke', '#999')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '5,5')
        .attr('d', line);

      // Add points with transitions
      const points = g.selectAll('.point')
        .data(combinedData)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => xScale(d.factorValue))
        .attr('cy', d => yScale(d.stemValue))
        .attr('r', 0) // Start with radius 0
        .attr('fill', colorMap[demographic])
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .style('opacity', 0.7)
        .on('mouseover', function(event, d) {
          d3.select(this).transition()
            .duration(200)
            .attr('r', 8)
            .style('opacity', 1);
            
          // Show tooltip with year
          const tooltip = g.append('g')
            .attr('class', 'tooltip')
            .attr('transform', `translate(${xScale(d.factorValue)},${yScale(d.stemValue) - 15})`);
            
          tooltip.append('rect')
            .attr('x', -40)
            .attr('y', -25)
            .attr('width', 80)
            .attr('height', 25)
            .attr('fill', 'rgba(0,0,0,0.7)')
            .attr('rx', 5);
            
          tooltip.append('text')
            .attr('x', 0)
            .attr('y', -8)
            .attr('text-anchor', 'middle')
            .attr('fill', '#fff')
            .style('font-size', '12px')
            .text(d.year);
        })
        .on('mouseout', function() {
          d3.select(this).transition()
            .duration(200)
            .attr('r', 5)
            .style('opacity', 0.7);
            
          g.selectAll('.tooltip').remove();
        })
        .transition() // Add transition
        .duration(800)
        .delay((d, i) => i * 50)
        .attr('r', 5);

      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('font-size', '12px');

      g.append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '12px');

      // Add axis labels
      const factorLabel = factorOptions.find(f => f.id === primaryFactor)?.label || primaryFactor;
      
      g.append('text')
        .attr('transform', `translate(${width/2},${height + 40})`)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(factorLabel);

      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 15)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text(`${demographic.charAt(0).toUpperCase() + demographic.slice(1)} STEM Degrees`);

      // Add chart title
      svg.append('text')
        .attr('x', width / 2 + margin.left)
        .attr('y', 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .text(`Correlation: ${factorLabel} vs ${demographic.charAt(0).toUpperCase() + demographic.slice(1)} STEM Degrees`);

      // Add correlation statistics
      svg.append('text')
        .attr('x', width - 50)
        .attr('y', 60)
        .attr('text-anchor', 'end')
        .style('font-size', '14px')
        .text(`r = ${regression.correlation.toFixed(2)}`);

    } catch (err) {
      console.error('Error rendering chart:', err);
      setError(`Failed to render chart: ${err.message}`);
    }
  }, [data, primaryFactor, demographic]);

  // Calculate linear regression
  const calculateRegression = (data) => {
    const n = data.length;
    const sumX = data.reduce((acc, d) => acc + d.factorValue, 0);
    const sumY = data.reduce((acc, d) => acc + d.stemValue, 0);
    const sumXY = data.reduce((acc, d) => acc + (d.factorValue * d.stemValue), 0);
    const sumXX = data.reduce((acc, d) => acc + (d.factorValue * d.factorValue), 0);
    const sumYY = data.reduce((acc, d) => acc + (d.stemValue * d.stemValue), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Calculate correlation coefficient
    const correlation = (n * sumXY - sumX * sumY) / 
                        (Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY)));
    
    return { slope, intercept, correlation };
  };

  return (
    <div className="correlation-chart-container">
      <div className="chart-controls">
        <div className="control-group">
          <h4>Select Factor</h4>
          <select value={primaryFactor} onChange={(e) => setPrimaryFactor(e.target.value)}>
            {factorOptions.map(factor => (
              <option key={factor.id} value={factor.id}>{factor.label}</option>
            ))}
          </select>
        </div>
        
        <div className="control-group">
          <h4>Select Demographic</h4>
          <select value={demographic} onChange={(e) => setDemographic(e.target.value)}>
            {demographicOptions.map(demo => (
              <option key={demo} value={demo}>
                {demo.charAt(0).toUpperCase() + demo.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="chart-container">
        {error ? (
          <div className="error-message">{error}</div>
        ) : !data ? (
          <div className="loading-message">Loading data...</div>
        ) : (
          <svg ref={svgRef} />
        )}
      </div>
      
      <div className="correlation-insight">
        <h4>Understanding This Correlation</h4>
        <p>
          This chart shows the relationship between {primaryFactor === 'hsi_growth' ? 'the growth of Hispanic-Serving Institutions' : 
             primaryFactor === 'funding_level' ? 'STEM funding levels' :
             primaryFactor === 'population_growth' ? 'demographic population growth' :
             'program completion rates'} 
          and {demographic.charAt(0).toUpperCase() + demographic.slice(1)} STEM degree attainment.
        </p>
        <p>
          Each point represents a year from 2011 to 2021. The dashed line shows the trend, 
          and the r-value indicates correlation strength (values closer to 1 or -1 indicate stronger relationships).
        </p>
      </div>
    </div>
  );
};

export default CorrelationChart;
