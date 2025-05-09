import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/Home.css";
import AllKnowledgeCards from "../components/AllKC";
import AddKnowledgeCard from "../components/AddKnowledgeCard";
import UploadFileForCard from "../components/UploadFileForCard";
import FilterListIcon from '@mui/icons-material/FilterList';
import BackToTop from "../components/BackToTop";
import debounce from 'lodash.debounce';
import knowledgeCardApi from "../services/KnowledgeCardService";
import Select from 'react-select';
import toast from "react-hot-toast";

const Home = () => {
  const [kcData, setKcData] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filter, setFilter] = useState("All");
  const [showSkeletonCard, setShowSkeletonCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [favPage, setFavPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allFetchedCards, setAllFetchedCards] = useState([]);
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  
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

    //  debounced handler
    const debouncedSetSearchQuery = useMemo(() =>
      debounce((value) => {
        setSearchQuery(value); 
        setIsSearching(false); 
        setShowSkeletonCard(false); 
      }, 500), []); 

  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);         
    setIsSearching(true);         
    setShowSkeletonCard(true);    
    debouncedSetSearchQuery(value); 
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

  
  const selectedCategoryNames = selectedCategories.map((c) => c.value);

const filteredCards = useMemo(() => {
  const baseData = filter === "All" ? allFetchedCards : kcData;

  if (!searchQuery.trim() && selectedCategoryNames.length === 0) return baseData;

  const lowerQuery = searchQuery.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/);

  return baseData.filter((card) => {
    const cardCategories = card?.category?.map((tag) => tag.toLowerCase()) || [];

    const matchesSearch = queryWords.some((qWord) =>
      [
        ...(card?.title?.toLowerCase().split(/\s+/) || []),
        ...cardCategories,
        ...(card?.summary?.toLowerCase().split(/\s+/) || []),
        ...(card?.tags?.map((tag) => tag.toLowerCase()) || [])
      ].includes(qWord)
    );

    const matchesCategory =
      selectedCategoryNames.length === 0 ||
      selectedCategoryNames.some((cat) =>
        cardCategories.includes(cat.toLowerCase())
      );

    return matchesSearch && matchesCategory;
  });
}, [searchQuery, filter, allFetchedCards, kcData, selectedCategoryNames]);
  

  const handleStartSaving = () => {
    setShowSkeletonCard(true);
  };

  const handleSaved = () => {
    setShowSkeletonCard(false);
  };

  const handleSavedFail = () => {
    setShowSkeletonCard(false);
    toast.error("Card cannot be added!");
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

//useEffect for userId
  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userId = await knowledgeCardApi.getUserId(token);
          setUserId(userId);
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }
    };
    fetchUserId();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${backendUrl}/knowledge-card/${userId}/categories`);
      setCategories(response.data.categories || []);
      console.log("Fetched categories:", response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };
  
  useEffect(() => {
    fetchCategories();
  }, [backendUrl]);

  const handleNewCategoryAdded = () => {
    fetchCategories(); // refresh filter list when a new category is added
  };

  const categoryOptions = categories.map((c) => ({
    value: c.name,
    label: c.name
  }));

  return ( 
  <>
      <Navbar searchQuery={inputValue} handleSearchChange={handleSearchChange}/>

      <div className="flex flex-col gap-6 px-4 sm:px-8 md:px-12 py-8">
      {/* Mobile Search Input */}
      <div className="block md:hidden w-full">
        <input
          type="text"
          placeholder="Search Your Cards..."
          value={inputValue}
          onChange={handleSearchChange}
          className="w-full border rounded border-gray-300 focus:outline-none focus:border-emerald-500 px-4 py-2 placeholder:text-emerald-800 placeholder:opacity-40 text-emerald-800 shadow-sm"
        />
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full">

         {/* Add/Upload Buttons */}
         <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          <AddKnowledgeCard
            onSave={(newCard) => {
              setAllFetchedCards((prevCards) => [newCard, ...prevCards]);
              setShowSkeletonCard(false);
            }}
            handleStartSaving={handleStartSaving}
            handleSaved={handleSaved}
            handleSavedFail={handleSavedFail}
          />
          <UploadFileForCard
            onSave={(newCard) => {
              setAllFetchedCards((prevCards) => [newCard, ...prevCards]);
              setShowSkeletonCard(false);
            }}
            handleStartSaving={handleStartSaving}
            handleSaved={handleSaved}
            handleSavedFail={handleSavedFail}
          />
        </div>

        {/* Filter Selects */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
          {/* Filter by Type */}
          <div className="relative w-full sm:w-52">
            {/* Filter icon on the left */}
            <FilterListIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-800 pointer-events-none" />

            {/* Custom down arrow on the right */}
            <svg
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="appearance-none w-full pl-10 pr-8 py-2 rounded border border-gray-300 bg-white text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="All">All</option>
              <option value="Favourites">Favourites</option>
              <option value="Archived">Archived</option>
            </select>
          </div>

          {/* Category Select */}
          <div className="w-full sm:w-64">
            <Select
              isMulti
              options={categoryOptions}
              value={selectedCategories}
              onChange={(selected) => setSelectedCategories(selected)}
              closeMenuOnSelect={false}
              className="w-full"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '41px',
                  height: '41px',
                  width: '100%',
                  fontSize: '0.875rem',
                  padding: '0 8px',
                  borderColor: state.isFocused ? '#10B981' : '#ccc', // emerald-500
                  boxShadow: state.isFocused ? '0 0 0 2px rgba(16, 185, 129, 0.4)' : 'none', // Emerald ring
                  '&:hover': {
                    borderColor: '#10B981',
                  },
                  overflow: 'auto',
                  scrollbarWidth: 'none',
                }),
                multiValue: (base) => ({
                  ...base,
                  backgroundColor: '#d1fae5',
                  color: '#065f46',
                  margin: '2px',
                }),
                multiValueContainer: (base) => ({
                  ...base,
                  display: 'flex',
                  flexWrap: 'nowrap',
                  overflowX: 'auto',
                  maxHeight: '36px',
                  padding: '0',
                }),
                menuList: (base) => ({
                  ...base,
                  maxHeight: '200px',
                  overflowY: 'auto',
                  scrollbarColor: '#10B981 #fff',
                }),
                option: (base) => ({
                  ...base,
                  color: 'black',
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: '#d1fae5',
                    color: '#065f46',
                  },
                }),
              }}
              placeholder="Filter by category"
            />
          </div>
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
          isSearching={isSearching}
          showSkeletonCard={showSkeletonCard}
          loadMore={filter === "All" ? () => setPage((prev) => prev + 1) : filter === "Favourites"? ()=> setFavPage((prev) => prev + 1) : filter === "Archived"? ()=> setArchivedPage((prev) => prev + 1) :null}
          hasMore={filter === "All" ? hasMore : filter === "Favourites"? hasMore : filter === "Archived"? hasMore : false}
          removeCardFromUI={handleRemoveCard}
          userId={userId}
          handleNewCategoryAdded={handleNewCategoryAdded}
        />
        <BackToTop />
        </>    
  );
};

export default Home;
