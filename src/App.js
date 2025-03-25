import React, { useState, useEffect } from "react";
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
// New chart components
import ComparisonChart from "./Charts/ComparisonChart";
import CorrelationChart from "./Charts/CorrelationChart";
import GeographicMap from "./Charts/GeographicMap";

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
  { name: "Hispanic", value: 52499, percentage: 106 },
  { name: "Asian", value: 38594, percentage: 78 },
  { name: "Black", value: 12844, percentage: 26 },
  { name: "Other", value: 21001, percentage: 42 },
];

const keyMetrics = {
  totalGrowth: 124938,
  topPerformer: "Hispanic",
  growthPercentage: "106%",
  hsiGrowth: "60%"
};

function App() {
  const [currentChartIndex, setCurrentChartIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('overview');
  const CurrentChart = charts[currentChartIndex];

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
    setActiveSection(sectionId);
  };
  
  // Function to handle tab switching in the interactive section
  const switchTab = (tabId) => {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-button').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });
    
    // Add active class to selected tab and content
    document.getElementById(`${tabId}-tab`)?.classList.add('active');
    document.getElementById(`${tabId}-content`)?.classList.add('active');
  };
  
  // Initialize tab interaction when the component mounts
  useEffect(() => {
    // Ensure the first tab is active by default
    const initializeTabs = () => {
      const tabContainer = document.querySelector('.tab-container');
      if (tabContainer) {
        const firstTabId = 'comparison';
        switchTab(firstTabId);
      }
    };
    
    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      initializeTabs();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="App">
      <nav className="navigation">
        <ul>
          <li className={activeSection === 'introduction' ? 'active' : ''}>
            <button onClick={() => scrollToSection('introduction')}>Introduction</button>
          </li>
          <li className={activeSection === 'overview' ? 'active' : ''}>
            <button onClick={() => scrollToSection('overview')}>Overview</button>
          </li>
          <li className={activeSection === 'growth' ? 'active' : ''}>
            <button onClick={() => scrollToSection('growth')}>Growth Analysis</button>
          </li>
          <li className={activeSection === 'interactive' ? 'active' : ''}>
            <button onClick={() => scrollToSection('interactive')}>Interactive Comparisons</button>
          </li>
          <li className={activeSection === 'hispanic' ? 'active' : ''}>
            <button onClick={() => scrollToSection('hispanic')}>Hispanic Focus</button>
          </li>
          <li className={activeSection === 'recommendations' ? 'active' : ''}>
            <button onClick={() => scrollToSection('recommendations')}>Recommendations</button>
          </li>
          <li className={activeSection === 'conclusion' ? 'active' : ''}>
            <button onClick={() => scrollToSection('conclusion')}>Conclusion</button>
          </li>
        </ul>
      </nav>

      <header className="App-header">
        <h1>Fostering Diversity in STEM Programs: A Decade of Progress</h1>
      </header>

      <main>
        <section id="introduction" className="card narrative-section">
          <h2>Understanding the Changing Landscape of STEM Education</h2>
          <div className="key-questions">
            <h3>Key Questions We'll Explore</h3>
            <div className="questions-grid">
              <div className="question-card">
                <div className="question-number">01</div>
                <h4>How has minority representation in STEM programs changed over the past decade?</h4>
                <p>We'll examine time-series data showing degree attainment across demographics from 2011-2021.</p>
              </div>
              <div className="question-card">
                <div className="question-number">02</div>
                <h4>Which demographic groups have experienced the most significant growth?</h4>
                <p>We'll analyze comparative data to identify leaders and understand variations in progress.</p>
              </div>
              <div className="question-card">
                <div className="question-number">03</div>
                <h4>What factors have contributed to the success of Hispanic students in STEM?</h4>
                <p>We'll investigate Hispanic-Serving Institutions and other potential drivers of growth.</p>
              </div>
              <div className="question-card">
                <div className="question-number">04</div>
                <h4>How can successful strategies be adapted to benefit other underrepresented groups?</h4>
                <p>We'll translate insights into actionable recommendations for institutions and policymakers.</p>
              </div>
            </div>
            <div className="narrative-navigation">
              <p>Start exploring below or use the navigation menu to jump to specific sections.</p>
              <button className="nav-button" onClick={() => scrollToSection('overview')}>Begin Exploration ↓</button>
            </div>
          </div>
        </section>
        
        <section id="overview" className="card">
          <div className="executive-summary">
            <h2>Executive Summary</h2>
            <p>From 2011 to 2021, minority representation in STEM programs has shown significant growth, 
               with Hispanic students leading the advancement. This analysis explores the factors behind 
               this progress and identifies opportunities to extend these successes to other demographics.</p>
          </div>

          <div className="key-metrics-dashboard">
            <div className="metric">
              <h3>Total Growth</h3>
              <p>{keyMetrics.totalGrowth.toLocaleString()}</p>
              <span>New STEM Degrees</span>
            </div>
            <div className="metric">
              <h3>Leading Growth</h3>
              <p>{keyMetrics.topPerformer}</p>
              <span>{keyMetrics.growthPercentage} Increase</span>
            </div>
            <div className="metric">
              <h3>HSI Growth</h3>
              <p>{keyMetrics.hsiGrowth}</p>
              <span>More Hispanic-Serving Institutions</span>
            </div>
          </div>
        </section>

        <section id="growth" className="card">
          <h2>Minority Growth in STEM Degrees (2011-2021)</h2>
          <div className="chart-container">
            <div className="chart-wrapper">
              <div className="chart" aria-label="Time series chart showing STEM degree trends">
                <h3>STEM Degrees Awarded by Race (2011-2021)</h3>
                <D3TimeSeriesChart />
                <div className="chart-legend">
                  <p>* Hover over data points for detailed statistics</p>
                </div>
              </div>
            </div>
            
            <div className="chart-wrapper">
              <div className="chart" aria-label="Demographic breakdown by year">
                <CurrentChart />
                <div className="slider-container">
                  <label htmlFor="year-slider">Year: {2011 + currentChartIndex}</label>
                  <input
                    id="year-slider"
                    type="range"
                    min="0"
                    max={charts.length - 1}
                    value={currentChartIndex}
                    onChange={(e) => setCurrentChartIndex(Number(e.target.value))}
                    className="slider"
                  />
                </div>
              </div>
            </div>

            <div className="chart-wrapper">
              <div className="chart" aria-label="Growth comparison chart">
                <h3>Total Growth by Demographic (2011-2021)</h3>
                <GrowthBarChart data={growthData} />
                <div className="chart-legend">
                  <p>* Bar height represents total growth, labels show percentage increase</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="interactive" className="card">
          <h2>Interactive Data Exploration</h2>
          <div className="section-prompt">
            <p>Customize the visualizations below to explore different aspects of the data and discover relationships between variables.</p>
          </div>

          <div className="tab-container">
            <div className="tabs">
              <button className="tab-button active" id="comparison-tab" onClick={() => switchTab('comparison')}>Demographic Comparison</button>
              <button className="tab-button" id="correlation-tab" onClick={() => switchTab('correlation')}>Factor Correlation</button>
              <button className="tab-button" id="map-tab" onClick={() => switchTab('map')}>Geographic Distribution</button>
            </div>
            
            <div className="tab-content">
              <div className="tab-pane active" id="comparison-content">
                <div className="chart-wrapper wide">
                  <ComparisonChart />
                </div>
              </div>
              
              <div className="tab-pane" id="correlation-content">
                <div className="chart-wrapper wide">
                  <CorrelationChart />
                </div>
              </div>
              
              <div className="tab-pane" id="map-content">
                <div className="chart-wrapper wide">
                  <GeographicMap />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="hispanic" className="card">
          <h2>Understanding Hispanic Student Success in STEM</h2>
          <div className="analysis-grid">
            <div className="analysis-item">
              <h3>Population Growth vs. STEM Growth</h3>
              <div className="chart">
                <h4>College-Aged Hispanic Population Trend</h4>
                <HispanicCollegeAgeChart />
                <div className="insight-box">
                  <h5>Key Insight</h5>
                  <p>Population growth (9%) accounts for only a small portion of the 106% increase in STEM degrees,
                     suggesting institutional and policy changes as primary drivers.</p>
                </div>
              </div>
            </div>

            <div className="analysis-item">
              <h3>Impact of Hispanic-Serving Institutions (HSIs)</h3>
              <div className="chart">
                <h4>Growth of HSIs (2011-2021)</h4>
                <HSIChart />
                <div className="insight-box">
                  <h5>Key Findings</h5>
                  <ul>
                    <li>60% increase in HSIs over the decade</li>
                    <li>Increased NSF funding for STEM programs at HSIs</li>
                    <li>Enhanced accessibility and support systems</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="recommendations" className="card">
          <h2>Recommendations for Broader Impact</h2>
          <div className="section-prompt">
            <p>Based on our analysis, these actionable recommendations could help extend the success of Hispanic students to other underrepresented groups in STEM education.</p>
          </div>
          <div className="recommendations-grid">
            <div className="recommendation">
              <h3>Institutional Support</h3>
              <p>Expand the HSI model to other demographics, creating dedicated institutions 
                 with targeted support systems.</p>
              <div className="implementation-note">Implementation timeframe: 3-5 years</div>
            </div>
            <div className="recommendation">
              <h3>Funding Allocation</h3>
              <p>Increase funding for STEM programs at institutions serving underrepresented minorities.</p>
              <div className="implementation-note">Potential impact: High</div>
            </div>
            <div className="recommendation">
              <h3>Regional Programs</h3>
              <p>Implement successful regional initiatives nationwide, focusing on areas with 
                 high minority populations.</p>
              <div className="implementation-note">Complexity: Medium</div>
            </div>
            <div className="recommendation">
              <h3>Support Systems</h3>
              <p>Develop comprehensive support systems including mentorship, scholarships, 
                 and career guidance.</p>
            </div>
          </div>
        </section>

        <section id="conclusion" className="card narrative-section">
          <h2>The Path Forward: Building on a Decade of Progress</h2>
          <div className="conclusion-content">
            <div className="key-takeaways">
              <h3>Key Takeaways</h3>
              <ul className="takeaway-list">
                <li>Hispanic student representation in STEM has more than doubled over the past decade, demonstrating that significant change is possible</li>
                <li>Targeted institutional support and dedicated funding have proven effective in boosting minority participation</li>
                <li>Population growth alone does not explain the dramatic increases; policy and institutional changes matter</li>
                <li>The success seen in Hispanic students can inform efforts for other underrepresented groups</li>
              </ul>
            </div>
            
            <div className="societal-impact">
              <h3>Broader Societal Impact</h3>
              <p>The diversification of STEM fields over the past decade represents more than just numbers on a chart. As these graduates enter the workforce, they bring diverse perspectives that drive innovation, economic growth, and societal advancement. Research consistently shows that diverse teams produce more creative solutions and better outcomes across sectors.</p>
              <p>By continuing to build on the progress documented here, educational institutions and policymakers can help create a STEM workforce that truly reflects America's diverse population, ultimately strengthening our nation's competitive position and ensuring that the benefits of technological advancement are more equitably distributed.</p>
            </div>
            
            <div className="call-to-action">
              <h3>Moving From Data to Action</h3>
              <p>This data story demonstrates what's possible when targeted support systems and institutional commitment align. The challenge now is to extend these successes across demographics and institutions nationwide.</p>
              <p>By implementing the recommendations outlined in this analysis, stakeholders at all levels can contribute to creating a more inclusive and dynamic STEM education ecosystem that serves all students and strengthens America's future.</p>
              <button className="action-button" onClick={() => scrollToSection('introduction')}>Explore Again ↑</button>
            </div>
          </div>
        </section>
      </main>

      <footer className="App-footer">
        <p>Data Sources: IPEDS, US Census Bureau, HACU | Last Updated: March 2025</p>
      </footer>
    </div>
  );
}

export default App;