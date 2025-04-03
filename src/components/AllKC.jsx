import AddKnowledgeCard from "./AddKnowledgeCard";
import KnowledgeCard from "./KnowledgeCard";

const AllKnowledgeCards = ({ cardData, refreshCards}) => {
  if (!cardData || cardData.length === 0) {
    return <p>No knowledge cards to display.</p>;
  }

  return (
    <div className="all-knowledge-cards">
      <AddKnowledgeCard onSave={refreshCards}/>
      {cardData.sort((a,b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      }).map((card) => (
        <KnowledgeCard
          key={card.card_id}
          thumbnail={card.thumbnail}
          title={card.title}
          initialNoteContent={card.note}
          initialSummaryContent={card.summary}
          tags={card.tags}
          source={card.source_url}
        />
      ))}
    </div>
  );
};

export default AllKnowledgeCards;
