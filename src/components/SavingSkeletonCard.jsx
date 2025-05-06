import { useState, useEffect } from 'react';
import { CheckCircle, Clock } from "lucide-react";
import { CircularProgress } from '@mui/material';

const SavingSkeletonCard = () => {
  // Initialize progress with all steps as false
  const [progress, setProgress] = useState({
    summary: false,
    categories: false,
    tags: false,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (!progress.summary) {
        setProgress((prev) => ({ ...prev, summary: true }));
      } else if (!progress.categories) {
        setProgress((prev) => ({ ...prev, categories: true }));
      } else if (!progress.tags) {
        setProgress((prev) => ({ ...prev, tags: true }));
      }
    }, 3000);

    
    if (progress.tags) {
      clearInterval(timer);
    }

    return () => clearInterval(timer);
  }, [progress]);

  // Function to display the correct icon based on progress
  const getStatusIcon = (done) =>
    done ? <CheckCircle className="text-green-500 w-4 h-4" /> : <Clock className="text-yellow-500 w-4 h-4" />;

  return (
    <div className="relative animate-pulse border border-emerald-100 rounded-lg p-4 shadow bg-gray-100 h-[19rem] w-[20rem]">
      {/* Overlaid progress steps */}
      <div className="absolute top-[40%] left-[30%] text-black bg-none  px-3 py-2 z-10">
        <div className="flex items-center gap-2 text-sm mb-1">
          {getStatusIcon(progress.summary)} <span>Summary</span>
        </div>
        <div className="flex items-center gap-2 text-sm mb-1">
          {getStatusIcon(progress.categories)} <span>Category</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {getStatusIcon(progress.tags)} <span>Tags</span>
        </div>
        <div flex items-center gap-2>
            <CircularProgress
              size={24}
              className={`absolute top-23 left-15 transform -translate-x-1/2 -translate-y-1/2`}
              style={{ color: progress.tags ? 'green' : 'yellow' }} />
        </div>
      </div>

      {/* Card structure */}
      <div className="flex justify-between">
        <div className="h-12 bg-gray-300 rounded-full w-12 mb-4"></div>
        <div className="flex gap-2 mt-2">
          <div className="h-4 bg-gray-300 rounded-full w-5 p-3"></div>
          <div className="h-4 bg-gray-300 rounded-full w-5 p-3"></div>
        </div>
      </div>
      <div className="bg-gray-300 rounded w-full h-44 mb-4"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex gap-2">
          <div className="h-4 bg-gray-300 rounded-full w-5 p-3"></div>
          <div className="h-4 bg-gray-300 rounded-full w-5 p-3"></div>
        </div>
        <div className="flex gap-2">
          <div className="h-4 bg-gray-300 rounded-full w-5 p-3"></div>
          <div className="h-4 bg-gray-300 rounded-full w-5 p-3"></div>
        </div>
      </div>
    </div>
  );
};

export default SavingSkeletonCard;
