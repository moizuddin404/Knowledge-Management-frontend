import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/Home.css";
import AllKnowledgeCards from "../components/AllKC";

const Home = () => {
  const [kcData, setKcData] = useState([]);

  // Function to fetch knowledge cards
  const fetchKnowledgeCards = () => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:8000/knowledge-card/", { params: { token } })
      .then((response) => {
        setKcData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching knowledge cards:", error);
      });
  };

  useEffect(() => {
    fetchKnowledgeCards();
  }, []);

  return (
    <div className="home-container">
      <Navbar />
      <div className="all-cards-section">
        <AllKnowledgeCards cardData={kcData} refreshCards={fetchKnowledgeCards} />
      </div>
    </div>
  );
};

export default Home;
