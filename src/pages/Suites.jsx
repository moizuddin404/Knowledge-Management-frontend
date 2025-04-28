import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react';
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
  const { user } = useContext(AuthContext);

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

      if (!user || !user.userId) {
        console.error('User data not available');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/knowledge-card/public`, {
          params: { user_id: user.userId, skip: (pageNum - 1) * 4, limit: 4 },
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
    [backendUrl, user]
  );

  // Fetch Bookmarked Knowledge Cards
  const fetchBookmarkedKnowledgeCards = useCallback(
    async (pageNum = 1) => {
      setIsLoading(true);
      const userId = user.userId;
      try {
        const response = await axios.get(`${backendUrl}/knowledge-card/bookmarked`, {
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
        console.error('Error fetching bookmarked knowledge cards:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [backendUrl]
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
    if (value === 0) {
      fetchPublicKnowledgeCards(1);
    } else if (value === 1) {
      fetchBookmarkedKnowledgeCards(1);
    }
  }, [value, fetchPublicKnowledgeCards, fetchBookmarkedKnowledgeCards]);

  useEffect(() => {
    if (page === 1) return;

    if (value === 0) {
      fetchPublicKnowledgeCards(page);
    } else if (value === 1) {
      fetchBookmarkedKnowledgeCards(page);
    }
  }, [page, value, fetchPublicKnowledgeCards, fetchBookmarkedKnowledgeCards]);

  const getFilteredCards = () => {
    const baseData = kcData;

    if (!searchQuery.trim()) return baseData;

    const lowerQuery = searchQuery.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/);

    return baseData.filter((card) => {
      const combinedWords = [
        ...(card?.title?.toLowerCase().split(/\s+/) || []),
        ...(card?.summary?.toLowerCase().split(/\s+/) || []),
        ...(card?.tags?.map((tag) => tag.toLowerCase()) || []),
      ];

      return queryWords.some((qWord) => combinedWords.includes(qWord));
    });
  };

  const filteredCards = useMemo(getFilteredCards, [searchQuery, kcData]);

  return (
    <>
      <Navbar searchQuery={inputValue} handleSearchChange={handleSearchChange} />
      <div className="flex flex-col md:flex-row items-center justify-between mx-12 my-10 lg:my-2 gap-4">
        <div className="w-full md:w-1/3 lg:hidden shadow-sm">
          <input
            type="text"
            placeholder="Search Your Cards..."
            value={inputValue}
            onChange={handleSearchChange}
            className="w-full border rounded border-gray-300 focus:outline-none focus:border-emerald-500 px-4 py-2 placeholder:text-emerald-800 placeholder:opacity-40 text-emerald-800"
          />
        </div>
      </div>
      <div className="flex justify-center">
        <Tabs
          value={value}
          onChange={handleTabChange}
          aria-label="icon tabs example"
          className="my-4 flex justify-center"
          slotProps={{
            indicator: {
              className: 'bg-emerald-400',
            },
          }}
        >
          <Tab icon={<AppsIcon className="text-emerald-500" />} aria-label="All" />
          <Tab icon={<BookmarkIcon className="text-emerald-500" />} aria-label="Bookmarked" />
        </Tabs>
      </div>

      <AllKnowledgeCards
        cardData={filteredCards}
        refreshCards={value === 0 ? fetchPublicKnowledgeCards : fetchBookmarkedKnowledgeCards}
        isLoading={isLoading}
        showSkeletonCard={showSkeletonCard}
        loadMore={() => setPage((prev) => prev + 1)}
        hasMore={hasMore}
        removeCardFromUI={handleRemoveCard}
        currentTab={value}
      />
      <BackToTop />
    </>
  );
};

export default Suites;
