import React, { useState } from "react";
import "./Styles/App.css";
import D3TimeSeriesChart from "./Charts/D3TimeSeriesChart";
import DemographicDonut11 from "./Donuts/11Donut";
import DemographicDonut12 from "./Donuts/12Donut";
import DemographicDonut13 from "./Donuts/13Donut";
import DemographicDonut14 from "./Donuts/14Donut";
import DemographicDonut15 from "./Donuts/15Donut";
import DemographicDonut16 from "./Donuts/16Donut";
import DemographicDonut17 from "./Donuts/17Donut";
import DemographicDonut18 from "./Donuts/18Donut";
import DemographicDonut19 from "./Donuts/19Donut";
import DemographicDonut20 from "./Donuts/20Donut";
import GrowthBarChart from "./Charts/GrowthBarChart";
import HispanicCollegeAgeChart from "./Charts/HIspanicCollegeAgeChart";
import HSIChart from "./Charts/HISChart";

const charts = [
  DemographicDonut11,
  DemographicDonut12,
  DemographicDonut13,
  DemographicDonut14,
  DemographicDonut15,
  DemographicDonut16,
  DemographicDonut17,
  DemographicDonut18,
  DemographicDonut19,
  DemographicDonut20,
];

const growthData = [
  { name: "Black", value: 12844 },
  { name: "Hispanic", value: 52499 },
  { name: "Asian", value: 38594 },
  { name: "Other", value: 21001 },
];

function App() {
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const CurrentChart = charts[currentChartIndex];

  return (
    <div className="App">
      <div
        id="header"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>How can we foster diversity in the STEM Field?</h1>
      </div>
      <h1>What minority has shown the most growth in STEM Degrees?</h1>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div className="chart">
            <h2>STEM Degrees Awarded from 2011-2021 by Race</h2>
            <D3TimeSeriesChart />
          </div>
          <div className="chart">
            <CurrentChart />
            <input
              type="range"
              min="0"
              max={charts.length - 1}
              value={currentChartIndex}
              onChange={(e) => setCurrentChartIndex(Number(e.target.value))}
              style={{
                width: "400px",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "10px",
              }} // Adjust margin to move the slider closer
            />
          </div>
        </div>
        <div className="chart">
          <h2>Growth of Minority Demographics Over the Decade</h2>
          <GrowthBarChart data={growthData} />
        </div>
      </div>
      <h1>We see that hispanics have had the most growth, why is this?</h1>
      <h2> 1. Is it just that there's more college aged hispanics?</h2>
      <div className="chart" style={{ width: "800px" }}>
        <h2>College-Aged Hispanic Students from 2011-2021</h2>
        <HispanicCollegeAgeChart />
        <p>
          While there is a slight growth in this metric, it is not nearly as
          steep as the growth in STEM degrees awarded (9% vs 106%). This
          suggests that there are other factors at play.
        </p>
      </div>

      <h2> 2. Has there been a rise in HSIs?</h2>
      <div className="info">
        <p>
          HSI stands for hispanic serving institution. These are colleges or
          universities whose full-time undergraduate population is at least 25%
          hispanic
        </p>
      </div>
      <div className="chart" style={{ width: "800px" }}>
        <h2>HSIs from 2011-2021</h2>
        <HSIChart />
        <p>
          There had been a significant growth in HSIs (approx. 60%). This means
          there are more colleges that are more suitable and accessible to
          hispanic students.
        </p>
      </div>
      <div className="info">
        <p>
          Though there is no specific data on HSIs and their STEM Programs, the
          NSF has dedicated increasing funding towards HSIs over the period.
          With this increased funding, STEM programs and research at HSIs have
          been improved, which can lead to more hispanic students pursuing STEM
          degrees.
        </p>
      </div>

      <h2>
        {" "}
        3. Are there more scholarships/grants encouraging hispanic students to
        pursue STEM?
      </h2>
      <div className="info">
        <p>
          Scholarships and grants are a great way to help students pay for
          college. The more scholarships/grants available to hispanics, the more
          likely they are to pursue a college degree.
        </p>
      </div>

      <h2>4. Are STEM programs more accessible to hispanic stuents?</h2>
      <div className="info">
        <p>
          Regional initiatives are programs that are designed to help students
          in a specific region. These programs can help students get the
          resources they need to succeed in college. (Google Maps here)
        </p>
      </div>

      <h1>How can we help other minorities?</h1>
      <div className="info">
        <p>
          Obviously the efforts to help hispanics have been successful, but what
          about other minorities? We can take the lessons learned from the
          hispanic initiatives and apply them to other minority groups.
        </p>
        <ul>
          <li>Have a sort of HSI classification for other demographics</li>
          <li>
            Look at regional initiatives and apply the most successful ones
            nationally
          </li>
        </ul>
      </div>
    </div>
  );
}

export default App;
