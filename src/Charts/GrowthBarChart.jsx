import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const GrowthBarChart = ({ data }) => {
  const svgRef = useRef();

  // Define demographics and colors
  const demographics = ['Black', 'Hispanic', 'Asian', 'Other'];
  const colors = ['#82ca9d', '#ffc658', '#ff8042', '#3d426b'];

  // Create color scale
  const colorScale = d3.scaleOrdinal()
    .domain(demographics)
    .range(colors);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);

    const chartGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Set scales
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .nice()
      .range([height, 0]);

    // Add axes
    chartGroup.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text')
      .style('font-size', '15px'); // Increase font size for x-axis

    chartGroup.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px'); // Increase font size for y-axis

    // Add horizontal gridlines
    chartGroup.append('g')
      .attr('class', 'grid')
      .selectAll('line')
      .data(yScale.ticks())
      .enter()
      .append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', '#e0e0e0')
      .attr('stroke-dasharray', '4');

    // Add bars
    chartGroup.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.name))
      .attr('y', d => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', d => height - yScale(d.value))
      .attr('fill', d => colorScale(d.name));

    // Add labels
    chartGroup.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.name) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.value) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.value);
  }, [data]);

  return <svg ref={svgRef}></svg>;
};

export default GrowthBarChart;