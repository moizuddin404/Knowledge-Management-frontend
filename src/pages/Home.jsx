import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/Home.css";
import { useEffect } from "react";
import AllKnowledgeCards from "../components/AllKC";

const Home = () => {
  const [kcData, setKcData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    // console.log(token);
    axios.get("http://localhost:8000/knowledge-card/", {
      params: {token: token}
    })
    .then(response => {
      console.log("Response: ",response.data);
      console.log("Response: ",kcData);
      setKcData(response.data);
    })
    .catch(error => {
      console.error('Error fetching knowledge card:', error);
    })
    .finally(()=> console.log("Completed"));
  
  }, []);
  return (
    <div className="home-container">
      <Navbar />
      <div className="kc-container">
        <div className="all-cards-section">
            <AllKnowledgeCards cardData={kcData} />
        </div>
        </div>
    </div>
  );
};

export default Home;