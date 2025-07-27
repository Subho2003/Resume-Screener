import React, { useState, useEffect } from "react";

function Data() {

    const [data, setData] = useState({
        name: "",
        age: 0,
        date: "",
        programming: "",
    });

    useEffect(() => {
      fetch("http://127.0.0.1:5000/data")
          .then((res) => {
              console.log("Response status:", res.status);
              if (!res.ok) {
                  throw new Error("Network response was not ok");
              }
              return res.json();
          })
          .then((data) => {
              console.log("Fetched data:", data); // Check what data you're receiving
              setData({
                  name: data.Name || "N/A",
                  age: data.Age || 0,
                  date: data.Date || "N/A",
                  programming: data.programming || "N/A",
              });
          })
          .catch((err) => {
              console.error("Error fetching data:", err);
          });
  }, []);  

    return (
        <div>
            <header>
                <h1><b>Fetching API data using flask</b></h1>
                <p>Name: {data.name}</p>
                <p>Age: {data.age}</p>
                <p>Date: {data.date}</p>
                <p>Programming: {data.programming}</p>
                <br />
            </header>
        </div>
    );
}

export default Data;