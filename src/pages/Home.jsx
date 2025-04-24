import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/Home.css";
import AllKnowledgeCards from "../components/AllKC";
import AddKnowledgeCard from "../components/AddKnowledgeCard";
import UploadFileForCard from "../components/UploadFileForCard";
import FilterListIcon from '@mui/icons-material/FilterList';
import BackToTop from "../components/BackToTop";

const Home = () => {
  const [kcData, setKcData] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showSkeletonCard, setShowSkeletonCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [favPage, setFavPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allFetchedCards, setAllFetchedCards] = useState([]);

  
  // Function to fetch knowledge cards
  const fetchKnowledgeCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${backendUrl}/knowledge-card/`, {
      params: { token, skip: (pageNum - 1)*4, limit: 4 },
    });

    const newCards = response.data;
    if (pageNum === 1) {
      setAllFetchedCards(newCards);
    } else {
      setAllFetchedCards((prev) => [...prev, ...newCards]);
    }

    if (newCards.length === 0) {
      setHasMore(false);
    }
  } catch (error) {
    console.error("Error fetching knowledge cards:", error);
  } finally {
    setIsLoading(false);
  }
  }, [backendUrl]);

  //useeffect for all KC 
  useEffect(() => {
    if (filter === "All") {
      fetchKnowledgeCards(page);
    }
  }, [page, fetchKnowledgeCards]);

  //search function on type setting value
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Favourite KC
  const fetchFavouriteKnowledgeCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.get(`${backendUrl}/knowledge-card/favourite`, {
        params: { token, skip: (pageNum - 1) * 4, limit: 4 },
      });
  
      const newCards = response.data;
      if (pageNum === 1) {
        setKcData(newCards);
      } else {
        setKcData((prev) => [...prev, ...newCards]);
      }
  
      if (newCards.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching favourite knowledge cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  // Archived KC
  const fetchArchivedCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.get(`${backendUrl}/knowledge-card/archive`, {
        params: { token, skip: (pageNum - 1) * 4, limit: 4 },
      });
  
      const newCards = response.data;
      if (pageNum === 1) {
        setKcData(newCards);
      } else {
        setKcData((prev) => [...prev, ...newCards]);
      }
  
      if (newCards.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching favourite knowledge cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);
  

  // dropdown filter
  useEffect(() => {
    setPage(1);
    setFavPage(1);
    setHasMore(true);

    if (filter === "All") {
      setAllFetchedCards([]);
      setKcData([]);
      fetchKnowledgeCards(1);
    } else if (filter === "Favourites") {
      setKcData([]);
      fetchFavouriteKnowledgeCards(1);
    } else if (filter === "Archived") {
      fetchArchivedCards();
    }
  }, [filter, fetchKnowledgeCards, fetchFavouriteKnowledgeCards, fetchArchivedCards]);

  const getFilteredCards = () => {
    const baseData = filter === "All" ? allFetchedCards : kcData;
  
    if (!searchQuery.trim()) return baseData;
  
    const lowerQuery = searchQuery.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/);

    return baseData.filter((card) => {
      const combinedWords = [
        ...(card?.title?.toLowerCase().split(/\s+/) || []),
        ...(card?.category?.toLowerCase().split(/\s+/) || []),
        ...(card?.summary?.toLowerCase().split(/\s+/) || []),
        ...(card?.tags?.map(tag => tag.toLowerCase()) || [])
      ];
    
      return queryWords.some(qWord => combinedWords.includes(qWord));
    });
  };
  
  const filteredCards = getFilteredCards();

  const handleStartSaving = () => {
    setShowSkeletonCard(true);
  };

  const handleSaved = () => {
    setShowSkeletonCard(false);
  };

  const removeCardFromFavs = (cardId) => {
    setKcData((prev) => prev.filter((card) => card.card_id !== cardId));
  };
  
  const removeCardFromArchived = (cardId) => {
    setKcData((prev) => prev.filter((card) => card.card_id !== cardId));
  };

  const handleRemoveCard = useCallback((cardId) => {
    switch (filter) {
      case "Favourites":
        removeCardFromFavs(cardId);
        break;
      case "Archived":
        removeCardFromArchived(cardId);
        break;
      default:
        setAllFetchedCards((prev) => prev.filter((card) => card.card_id !== cardId));
    }
  }, [filter]);

  //useeffect for favourites
    useEffect(() => {
      if (filter === "Favourites") {
        fetchFavouriteKnowledgeCards(favPage);
      }
    }, [favPage, fetchFavouriteKnowledgeCards, filter]);

  //useEffect for Archives
    useEffect(() => {
      if (filter === "Archives") {
        fetchArchivedCards(archivedPage);
      }
    }, [archivedPage, fetchArchivedCards, filter]);

  return ( 
  <>
      <Navbar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>

      <div className="flex flex-col md:flex-row items-center justify-between mx-12 my-10 gap-4">
        <div className="w-full md:w-1/3 lg:hidden shadow-sm">
          <input
            type="text"
            placeholder="Search Your Cards..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border rounded border-gray-300 focus:outline-none focus:border-emerald-500 px-4 py-2 placeholder:text-emerald-800 placeholder:opacity-40 text-emerald-800"
          />
        </div>

        <div className="flex flex-col md:flex-row items-center gap-4 ml-auto w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            {/* Filter icon inside select */}
            <FilterListIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-800 pointer-events-none" />
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className=" w-full md:w-auto pl-10 pr-4 py-2 rounded border border-gray-300 bg-white text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="All">All</option>
              <option value="Favourites">Favourites</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          <div className="w-full md:w-auto flex flex-wrap items-center justify-between lg: gap-x-4">
            <AddKnowledgeCard 
              onSave={(newCard) => {
                setAllFetchedCards((prevCards) => [newCard, ...prevCards]);
                setShowSkeletonCard(false);
              }}
              handleStartSaving={handleStartSaving}
              handleSaved={handleSaved}
            />

            <UploadFileForCard
              onSave={(newCard) => {
                setAllFetchedCards((prevCards) => [newCard, ...prevCards]);
                setShowSkeletonCard(false);
              }}
              handleStartSaving={handleStartSaving}
              handleSaved={handleSaved}
            />
          </div>
        </div>

      </div>
      {/* <div className='flex justify-end mx-12 lg:pt-6 text-emerald-700 lg:text-3xl'>
          <p>Home</p>
        </div> */}
        <AllKnowledgeCards
          cardData={filteredCards}
          refreshCards={fetchKnowledgeCards}
          isLoading={isLoading}
          showSkeletonCard={showSkeletonCard}
          loadMore={filter === "All" ? () => setPage((prev) => prev + 1) : filter === "Favourites"? ()=> setFavPage((prev) => prev + 1) : filter === "Archived"? ()=> setArchivedPage((prev) => prev + 1) :null}
          hasMore={filter === "All" ? hasMore : filter === "Favourites"? hasMore : filter === "Archived"? hasMore : false}
          removeCardFromUI={handleRemoveCard}
        />
        <BackToTop />
        </>    
  );
};

export default Home;
