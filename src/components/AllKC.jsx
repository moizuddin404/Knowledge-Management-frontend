import AddKnowledgeCard from "./AddKnowledgeCard";
import KnowledgeCard from "./KnowledgeCard";

const AllKnowledgeCards = ({ cardData, refreshCards}) => {
  if (!cardData || cardData.length === 0) {
    return (
      <div style={{display: "flex", justifyContent: "center", alignItems: "flex-start"}}>
      {/* <AddKnowledgeCard /> */}
      <div className="no-cards">
        <h3>Oops...No cards</h3>
        <img src='no-cards-2.png' alt="No cards found" />
      </div>
      </div>
  );
  }

  return (
    <div className="flex flex-wrap justify-start gap-6 mt-8 px-4 mx-12">
      {cardData.sort((a,b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      }).map((card) => (
        <KnowledgeCard
          key={card.card_id}
          cardData={card}
          refreshCards={refreshCards}
        />
      ))}
    </div>
  );
};

export default AllKnowledgeCards;
