const SkeletonCard = () => (
  <div className="animate-pulse border border-emerald-100 rounded-lg p-4 shadow bg-gray-100 h-[19rem] w-[20rem]">
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

export default SkeletonCard;
