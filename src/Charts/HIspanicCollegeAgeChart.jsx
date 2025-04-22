import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const HispanicCollegeAgeChart = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await d3.csv("data2.csv", (d) => ({
          year: new Date(d.year, 0, 1), // Convert year to Date object
          amount: +d.amount, // Convert amount to number
        }));
        console.log("Loaded data:", result); // Log loaded data
        setData(result);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Set scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.year))
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([5000000, 7000000]) // Set y-axis domain from 5 million to 7 million
      .range([height, 0]);

    // Add axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(d3.timeYear.every(1)));

    const yAxis = svg
      .append("g")
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format("~s"))); // Format y-axis labels

    yAxis
      .selectAll("g.tick")
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("stroke", "#e0e0e0")
      .attr("stroke-dasharray", "3,3");

    // Add line
    const line = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.amount))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#ffc658")
      .attr("stroke-width", 2)
      .attr("d", line);

    // Add dots
    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.amount))
      .attr("r", 3)
      .attr("fill", "#ffc658");
  }, [data]);

  return <svg ref={svgRef} />;
};

export default HispanicCollegeAgeChart;
