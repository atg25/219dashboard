import React, { useEffect, useState } from "react";
import Papa from "papaparse";
import TimeSeriesChart from "./TimeSeriesChart";

function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("data.csv")
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const parsedData = results.data
              .map((row) => {
                if (!row.date) {
                  console.error("Missing date in row:", row);
                  return null;
                }
                const timestamp = new Date(row.date).getTime();
                if (isNaN(timestamp)) {
                  console.error("Invalid date:", row.date);
                  return null;
                }
                return {
                  ...row,
                  date: timestamp,
                };
              })
              .filter((row) => row !== null)
              .sort((a, b) => a.date - b.date);

            console.log("Parsed data:", parsedData);
            setData(parsedData);
          },
          error: (err) => {
            console.error("Error parsing CSV:", err);
          },
        });
      })
      .catch((err) => console.error("Error fetching CSV:", err));
  }, []);

  return (
    <div>
      <h1>Time series dashboard</h1>
      {data.length > 0 ? (
        <TimeSeriesChart data={data} />
      ) : (
        <p>Loading data...</p>
      )}
    </div>
  );
}

export default Dashboard;
