import React, { useCallback, useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import SkeletonCard from '../components/SkeletonCard';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import AllKnowledgeCards from '../components/AllKC';
import { ToastContainer } from 'react-toastify';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import AppsIcon from '@mui/icons-material/Apps';
import BackToTop from '../components/BackToTop';
import debounce from 'lodash.debounce';
import knowledgeCardApi from '../services/KnowledgeCardService';
import Select from 'react-select';

const Suites = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [kcData, setKcData] = useState([]);
  const [showSkeletonCard, setShowSkeletonCard] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [value, setValue] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
  // const { user } = useContext(AuthContext);
  const [userId, setUserId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Memoized debounced handler
  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value);
        setIsSearching(false);
        setShowSkeletonCard(false);
      }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsSearching(true);
    setShowSkeletonCard(true);
    debouncedSetSearchQuery(value);
  };

  // Fetch Public Knowledge Cards
  const fetchPublicKnowledgeCards = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);

      // if (!user || !user.userId) {
      //   console.error('User data not available');
      //   setIsLoading(false);
      //   return;
      // }

      try {
        const response = await axios.get(`${backendUrl}/knowledge-card/public`, {
          params: { user_id: userId, skip: (pageNum - 1) * 4, limit: 4 },
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
        console.error('Error fetching knowledge cards:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [backendUrl, userId]
  );

  // Fetch Bookmarked Knowledge Cards
  const fetchBookmarkedKnowledgeCards = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${backendUrl}/knowledge-card/bookmarked`, {
          params: { user_id: userId, skip: (pageNum - 1) * 4, limit: 4 },
        });
        const newCards = response.data;
        if (pageNum === 1) {
          setKcData(newCards);
        } else {
          setKcData((prev) => {
          const existingIds = new Set(prev.map((card) => card._id));
          const filteredNewCards = newCards.filter((card) => !existingIds.has(card._id));
          return [...prev, ...filteredNewCards];
        });
        }

        if (newCards.length === 0) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching bookmarked knowledge cards:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [backendUrl, userId]
  );

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    setPage(1); // Reset pagination
    setHasMore(true);
    setKcData([]); // Clear previous data
  };

  const handleRemoveCard = (cardId) => {
    setKcData((prevCards) => prevCards.filter((card) => card._id !== cardId));
  };

  useEffect(() => {
    if (!userId) return;
    
    if (value === 0) {
      fetchPublicKnowledgeCards(1);
    } else if (value === 1) {
      fetchBookmarkedKnowledgeCards(1);
    }
  }, [userId, value, fetchPublicKnowledgeCards, fetchBookmarkedKnowledgeCards]);

  useEffect(() => {
    if (page === 1) return;

    if (value === 0) {
      fetchPublicKnowledgeCards(page);
    } else if (value === 1) {
      fetchBookmarkedKnowledgeCards(page);
    }
  }, [page, value, fetchPublicKnowledgeCards, fetchBookmarkedKnowledgeCards]);

  
  const selectedCategoryNames = selectedCategories.map((c) => c.value);
  const filteredCards = useMemo(() => {
    const baseData = kcData;
  
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
  }, [searchQuery, kcData, selectedCategoryNames]);


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

    useEffect(() => {
      const fetchCategories = async () => {
        try {
          const response = await axios.get(`${backendUrl}/knowledge-card/categories`);
          setCategories(response.data.categories || []);
        } catch (error) {
          console.error("Error fetching categories:", error);
        }
      };
    
      fetchCategories();
    }, [backendUrl]);
  
    const categoryOptions = categories.map((c) => ({
      value: c.name,
      label: c.name.toUpperCase()
    }));
  return (
    <>
      <Navbar searchQuery={inputValue} handleSearchChange={handleSearchChange} />
      <div className="flex flex-col md:flex-row items-center justify-between mx-12 my-10 lg:my-2 gap-4">
        <div className="w-full lg:hidden shadow-sm">
          <input
            type="text"
            placeholder="Search Your Cards..."
            value={inputValue}
            onChange={handleSearchChange}
            className="w-full border rounded border-gray-300 focus:outline-none focus:border-emerald-500 px-4 py-2 placeholder:text-emerald-800 placeholder:opacity-40 text-emerald-800"
          />
        </div>
      </div>
      {/* Tabs and Category Filter */}
      <div className="flex flex-col md:flex-row justify-between mx-12 sm:items-start items-center gap-4 mb-6">
        <Tabs
          value={value}
          onChange={handleTabChange}
          aria-label="icon tabs example"
          className="w-full lg:w-auto flex justify-center"
          slotProps={{
            indicator: {
              className: 'bg-emerald-400',
            },
          }}
        >
          <Tab icon={<AppsIcon className="text-emerald-500" />} aria-label="All" />
          <Tab icon={<BookmarkIcon className="text-emerald-500" />} aria-label="Bookmarked" />
        </Tabs>

        {/* Category Select */}
        <div className="w-full sm:w-80">
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

      <AllKnowledgeCards
        cardData={filteredCards}
        refreshCards={value === 0 ? fetchPublicKnowledgeCards : fetchBookmarkedKnowledgeCards}
        isLoading={isLoading}
        isSearching={isSearching}
        showSkeletonCard={showSkeletonCard}
        loadMore={() => setPage((prev) => prev + 1)}
        hasMore={hasMore}
        removeCardFromUI={handleRemoveCard}
        currentTab={value}
        userId={userId}
      />
      <BackToTop />
    </>
  );
};

export default Suites;
