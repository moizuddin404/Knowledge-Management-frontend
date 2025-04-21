import React, { useCallback, useContext, useEffect, useState } from 'react'
import Navbar from '../components/Navbar';
import SkeletonCard from '../components/SkeletonCard'
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

import AllKnowledgeCards from '../components/AllKC';
import { ToastContainer } from 'react-toastify';

const Suites = () =>
     {
      const [searchQuery, setSearchQuery] = useState("");
      const [isLoading, setIsLoading] = useState(true);
      const [kcData, setKcData] = useState([]);
      const [showSkeletonCard] = useState(false);
       const [hasMore, setHasMore] = useState(true);
       const [page, setPage] = useState(1);

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const { user } = useContext(AuthContext);

      const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
      };

       // Public KC
       const fetchPublicKnowledgeCards = useCallback(async (pageNum = 1) => {
        setIsLoading(true);
        
        // Check if user exists and has userId before making the request
        if (!user || !user.userId) {
          console.error("User data not available");
          setIsLoading(false);
          return;
        }
        
        try {
        const response = await axios.get(`${backendUrl}/knowledge-card/public`, {
          params:{user_id: user.userId, skip: (pageNum - 1) * 4, limit: 4},
        });

        const newCards = response.data;
        if ( pageNum === 1 ) {
          setKcData(newCards);
        } else {
          setKcData((prev) => [...prev, ...newCards]);
        }
        if (newCards.length === 0) {
          setHasMore(false);
        }
       } catch (error) {
        console.error("Error fetching knowledge cards:", error);
      } finally {
        setIsLoading(false);
      }
      }, [backendUrl, user]);
      
      useEffect(() => {
        setPage(1);
        setHasMore(true);
        setKcData([]);
      }, [fetchPublicKnowledgeCards]);

      useEffect(() => {
        fetchPublicKnowledgeCards(page);
      }, [page, fetchPublicKnowledgeCards]);

        // search filter
        const getFilteredCards = () => {
          const baseData = kcData;
        
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
  return (
    <>
      <Navbar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>
      <div className="flex flex-col md:flex-row items-center justify-between mx-12 my-15 gap-4">
        <div className="w-full md:w-1/3 lg:hidden shadow-sm">
          <input
            type="text"
            placeholder="Search Your Cards..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border rounded border-gray-300 focus:outline-none focus:border-emerald-500 px-4 py-2 placeholder:text-emerald-800 placeholder:opacity-40 text-emerald-800"
          />
        </div>
        </div>
        {/* <div className='flex justify-end mx-12 lg:pt-6 text-emerald-700 lg:text-3xl'>
          <p>Public Space</p>
        </div> */}
        <AllKnowledgeCards 
          cardData={filteredCards} 
          refreshCards={fetchPublicKnowledgeCards} 
          isLoading={isLoading} 
          showSkeletonCard={showSkeletonCard}
          loadMore={()=>setPage((prev) => prev + 1)}
          hasMore={hasMore}
          />
      <ToastContainer position='bottom-right'/>
    </>
  );
}

export default Suites
