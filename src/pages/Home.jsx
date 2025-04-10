import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/Home.css";
import AllKnowledgeCards from "../components/AllKC";
import AddKnowledgeCard from "../components/AddKnowledgeCard";

const Home = () => {
  const [kcData, setKcData] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  
  
  // Function to fetch knowledge cards
  const fetchKnowledgeCards = useCallback(() => {
  const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/knowledge-card/`, { params: { token } })
      .then((response) => {
        setKcData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching knowledge cards:", error);
      });
  }, [backendUrl]);

  useEffect(() => {
    fetchKnowledgeCards();
  }, [fetchKnowledgeCards]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Favourite KC
  const fetchFavouriteKnowledgeCards = useCallback(() => {
    const token = localStorage.getItem("token");
  
    axios
      .get(`${backendUrl}/knowledge-card/favourite`, { params: { token } })
      .then((response) => {
        setKcData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching favourite knowledge cards:", error);
      });
  }, [backendUrl]);
  
  // Archived KC
  const fetchArchivedCards = useCallback(() => {
    const token = localStorage.getItem("token");
  
    axios
      .get(`${backendUrl}/knowledge-card/archive`, { params: { token } })
      .then((response) => {
        setKcData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching archived cards:", error);
      });
  }, [backendUrl]);

  useEffect(() => {
    if (filter === "All") {
      fetchKnowledgeCards();
    } else if (filter === "Favourites") {
      fetchFavouriteKnowledgeCards();
    } else if (filter === "Archived") {
      fetchArchivedCards();
    }
  }, [filter, fetchKnowledgeCards, fetchFavouriteKnowledgeCards, fetchArchivedCards]);

  const filteredCards = kcData.filter((card) => {
    return (
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }
  );

  return ( 
  <>
      <Navbar />
      <div className="flex flex-col md:flex-row items-center justify-between my-10 mx-5 md:mx-20 gap-4">
        <div className="w-full md:w-1/3 shadow-sm">
          <input
            type="text"
            placeholder="Search Your Cards..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border rounded border-gray-300 focus:outline-none focus:border-emerald-500 px-4 py-2 placeholder:text-emerald-800 placeholder:opacity-40 text-emerald-800"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
        <div className={`transition-all duration-200 ease-in-out transform ${
          filter === 'Favourites' ? "scale-105" :
          filter === 'Archived' ? "scale-105" :
          "scale-105"
        }`}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded border border-gray-300 bg-white text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="All">All</option>
              <option value="Favourites">Favourites</option>
              <option value="Archived">Archived</option>
            </select>
        </div>
        <div className="justify-end w-full md:w-auto">
          <AddKnowledgeCard onSave={fetchKnowledgeCards} />
        </div>
        </div>

      </div>
        <AllKnowledgeCards cardData={filteredCards} refreshCards={fetchKnowledgeCards} />
        </>    
  );
};

export default Home;
