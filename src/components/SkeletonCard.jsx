const SkeletonCard = () => (
    <div className="animate-pulse border border-emerald-100 rounded p-4 shadow bg-gray-100 w-74 h-74">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-300 rounded w-full mb-2 w-70 h-45"></div>
      <div className="flex justify-between mt-6">
        <div className="h-4 bg-gray-300 rounded w-20 mb-2 p-3"></div>
        <div className="flex">
            <div className="h-4 bg-gray-300 rounded-xl w-5 mb-2 p-3 mr-2"></div>
            <div className="h-4 bg-gray-300 rounded-xl w-5 mb-2 p-3"></div>
        </div>

        </div>
    </div>
  );
  
  export default SkeletonCard;