import AddKnowledgeCard from "./AddKnowledgeCard";
import KnowledgeCard from "./KnowledgeCard";
import SkeletonCard from "./SkeletonCard";
import { useRef, useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AllKnowledgeCards = ({ cardData, refreshCards, isLoading=false, showSkeletonCard=false, loadMore, hasMore, removeCardFromUI }) => {
  const observer = useRef();

  const lastCardRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      }, {
        rootMargin: "50px"
      });

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore]
  );

  const { user } = useContext(AuthContext);

  if (isLoading && (!cardData || cardData.length === 0)) {
    return (
      <div className="px-8 md:px-12 mt-8">
        <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (!isLoading && (!cardData || cardData.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-20 text-center">
        <img src="no-cards-2.png" alt="No Cards" className="w-64 opacity-60 mb-4" />
        <p className="text-emerald-700 text-lg font-medium">No knowledge cards found</p>
      </div>
    );
  }

  return (
    <div className="px-8 md:px-12 mt-8">
      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
        {showSkeletonCard && <SkeletonCard />}
        {cardData
          .map((card, index) => {
            const isLast = index === cardData.length - 1;
            return (
              user &&(
              <div ref={isLast ? lastCardRef : null} key={card.card_id} className="h-auto">
                <KnowledgeCard key={card.card_id} cardData={card} refreshCards={refreshCards} removeCardFromUI={removeCardFromUI}/>
              </div>)
              
            );
          })}
          {isLoading && hasMore && !showSkeletonCard && <><SkeletonCard /></>}
      </div>
    </div>
  );
};

export default AllKnowledgeCards;