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

      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
      const { user } = useContext(AuthContext);

      const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
      };

       // Public KC
        const fetchPublicKnowledgeCards = useCallback(() => {
          setIsLoading(true);        
          axios
          .get(`${backendUrl}/knowledge-card/public`, {params:{user_id: user.userId}})
          .then((response) => {
            setKcData(response.data);
          })
          .catch((error) => {
            console.error("Error fetching knowledge cards:", error);
          })
          .finally(()=> setIsLoading(false))
      }, [backendUrl]);
    
      useEffect(() => {
        fetchPublicKnowledgeCards();
      }, [fetchPublicKnowledgeCards]);

        // search filter
  const filteredCards = kcData.filter((card) => {
    const queryWords = searchQuery.toLowerCase().trim().split(/\s+/);
    return queryWords.every((word) => 
      card?.title?.toLowerCase().includes(word) ||
      card?.category?.toLowerCase().includes(word) ||
      card?.tags?.some((tag) =>
        tag.toLowerCase().includes(word)) ||
      card?.summary?.toLowerCase().includes(word)
    );
  }
  );
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
        <AllKnowledgeCards cardData={filteredCards} refreshCards={fetchPublicKnowledgeCards} isLoading={isLoading} showSkeletonCard={showSkeletonCard}/>
      <ToastContainer position='bottom-right'/>
    </>
  );
}

export default Suites
