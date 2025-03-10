import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import * as d3 from 'd3';
import '../Styles/DonutChart.css';

const DonutChart = ({ year }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const result = await d3.csv('/data.csv');
        console.log('CSV Data:', result); // Log CSV data to check if it's loaded correctly

        const filteredData = result
          .filter(d => d.year === year)
          .map(d => ({
            name: 'Black',
            value: +d.black,
          }))
          .concat(
            result
              .filter(d => d.year === year)
              .map(d => ({
                name: 'Hispanic',
                value: +d.hispanic,
              })),
            result
              .filter(d => d.year === year)
              .map(d => ({
                name: 'Asian',
                value: +d.asian,
              })),
            result
              .filter(d => d.year === year)
              .map(d => ({
                name: 'Other',
                value: +d.other,
              }))
          );
        console.log('Filtered Data:', filteredData); // Log filtered data to check if it's correct
        setData(filteredData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [year]);

  const COLORS = ['#82ca9d', '#ffc658', '#ff8042', '#3d426b'];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name,
    value,
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  };

  const renderLegend = (props) => {
    const { payload } = props;
    const total = data.reduce((sum, entry) => sum + entry.value, 0);

    return (
      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} style={{ margin: '0 10px', color: entry.color, display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 10, height: 10, backgroundColor: entry.color, borderRadius: '50%', marginRight: 5 }}></span>
            {`${entry.payload.name} (${((entry.payload.value / total) * 100).toFixed(2)}%)`}
          </div>
        ))}
      </div>
    );
  };

  const renderTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const total = data.reduce((sum, entry) => sum + entry.value, 0);
      const { name, value } = payload[0].payload;
      const percent = ((value / total) * 100).toFixed(2);

      return (
        <div className="custom-tooltip">
          <p>{`${name}: ${value} (${percent}%)`}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="chart-container">
      <h2>{year} Minority STEM Degree Distribution by Race</h2>
      <ResponsiveContainer width={400} height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            isAnimationActive={false} // Disable animation
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={renderTooltip} />
          <Legend content={renderLegend} layout="horizontal" align="center" verticalAlign="bottom" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DonutChart;