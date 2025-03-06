import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

function D3TimeSeriesChart() {
  const svgRef = useRef();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // Define demographics and colors - using lowercase to match CSV
  const demographics = ['black', 'hispanic', 'asian', 'other'];
  const colors = ['#82ca9d', '#ffc658', '#ff8042', '#3d426b'];
  
  // Create color scale
  const colorScale = d3.scaleOrdinal()
    .domain(demographics)
    .range(colors);

  // Load CSV data
  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await d3.csv('/data.csv');
        
        if (!result || result.length === 0) {
          throw new Error('No data loaded');
        }

        // Transform data with validation
        const transformedData = result.map(d => {
          const row = {
            year: new Date(d.year),
            black: +d.black || 0,
            hispanic: +d.hispanic || 0,
            asian: +d.asian || 0,
            other: +d.other || 0,
          };
          return row;
        }).filter(d => d.year instanceof Date && !isNaN(d.year));

        if (transformedData.length === 0) {
          throw new Error('No valid data after transformation');
        }

        setData(transformedData);
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
    if (!data || !data.length || !svgRef.current) return;

    try {
      const margin = { top: 50, right: 150, bottom: 50, left: 80 };
      const width = 800 - margin.left - margin.right;
      const height = 400 - margin.top - margin.bottom;

      // Clear previous content
      d3.select(svgRef.current).selectAll('*').remove();
      
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
      
      const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // Calculate y-domain across all demographics
      const allValues = data.flatMap(d => 
        demographics.map(demo => d[demo])
      );
      
      const yMin = 0; // Starting from 0 for better visualization
      const yMax = Math.max(...allValues);

      // Set scales
      const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

      const yScale = d3.scaleLinear()
        .domain([yMin, yMax * 1.1]) // Add 10% padding to top
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

      // Create line generator
      const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);

      // Draw lines for each demographic
      demographics.forEach(demo => {
        const demoData = data.map(d => ({
          year: d.year,
          value: d[demo]
        }));

        g.append('path')
          .datum(demoData)
          .attr('fill', 'none')
          .attr('stroke', colorScale(demo))
          .attr('stroke-width', 2)
          .attr('d', line);

        // Add dots for data points
        g.selectAll(`.dot-${demo}`)
          .data(demoData)
          .enter()
          .append('circle')
          .attr('class', `dot-${demo}`)
          .attr('cx', d => xScale(d.year))
          .attr('cy', d => yScale(d.value))
          .attr('r', 3)
          .attr('fill', colorScale(demo));
      });

      // Add axes
      g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
          .ticks(10)
          .tickFormat(d3.timeFormat('%Y')))
        .selectAll('text')
        .style('font-size', '12px');

      g.append('g')
        .call(d3.axisLeft(yScale)
          .tickFormat(d3.format(',d'))) // Format numbers with commas
        .selectAll('text')
        .style('font-size', '12px');

      // Add axis labels
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -(height / 2))
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .text('Number of Degrees');

      // Add legend
      const legend = svg.append('g')
        .attr('font-size', '12px')
        .attr('transform', `translate(${width + margin.left + 20},${margin.top})`);

      demographics.forEach((demo, i) => {
        const legendRow = legend.append('g')
          .attr('transform', `translate(0,${i * 25})`);
        
        legendRow.append('rect')
          .attr('width', 12)
          .attr('height', 12)
          .attr('fill', colorScale(demo));

        legendRow.append('text')
          .attr('x', 24)
          .attr('y', 9)
          .text(demo.charAt(0).toUpperCase() + demo.slice(1)); // Capitalize first letter
      });

    } catch (err) {
      console.error('Error rendering chart:', err);
      setError(`Failed to render chart: ${err.message}`);
    }
  }, [data]);

  return (
    <div>
      {error ? (
        <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>
      ) : !data ? (
        <div>Loading data...</div>
      ) : (
        <svg ref={svgRef} />
      )}
    </div>
  );
}

export default D3TimeSeriesChart;