import React, { useState } from "react";
import "../css/KnowledgeCard.css";
import CancelIcon from '@mui/icons-material/Cancel';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const KnowledgeCard = ({thumbnail, title, initialNoteContent, initialSummaryContent, tags, source}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Note');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(initialNoteContent || 'No Note Yet...');
  const [summaryContent, setSummaryContent] = useState(initialSummaryContent || 'Error: No Summary Yet...');

  const handleTabChange = (tab) => {
    if(!isEditing) {
      setActiveTab(tab);
      setIsMenuOpen(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsMenuOpen(false);
  };

  const handleAddTag = () => {
    alert('Add Tag functionality to be implemented');
    setIsMenuOpen(false);
  };

  const handleAddLink = () => {
    alert('Add Link functionality to be implemented');
    setIsMenuOpen(false);
  };

  const handleGoToSource = () => {
    alert('Go to Source functionality to be implemented');
    setIsMenuOpen(false);
  };

  const handleContentChange = (e) => {
    if (activeTab === 'Note') {
      setNoteContent(e.target.value);
    } else if (activeTab === 'Summary') {
      setSummaryContent(e.target.value);
    }
  };

  // const handleGenerateSummary = async () => {
  //   try {
  //     const response = await fetch('/api/generate-summary', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ currentSummary: summaryContent })
  //     });
  //     const data = await response.json();
  //     setSummaryContent(data.newSummary);
  //   } catch (error) {
  //     console.error('Error generating summary:', error);
  //   }
  // };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Reset states when closing
    if (isExpanded) {
      setActiveTab('Note');
      setIsMenuOpen(false);
      setIsEditing(false);
    }
  };

  return (
<>
      <div 
        className="knowledge-card" 
        onClick={toggleExpand}
      >
        <div className="thumbnail-container">
          <img 
            src={thumbnail} 
            alt={title} 
            className="thumbnail-image"
          />
        </div>
        <div className="title-container">
          <div className="title">{title}</div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="expanded-card-overlay">
          <div className="meeting-notes-card">
            <button 
              className="close-icon" 
              onClick={toggleExpand}
            >
              <CancelIcon/>
            </button>
            {/* <button className="source-icon">
            <a href={source} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', marginRight: '5px' }}>
              <OpenInNewIcon />
            </a>
            </button> */}
            <div className="tabs-container">
            <div className="tabs">
              {['Note', 'Summary'].map(tab => (
                <button 
                  key={tab} 
                  className={`tab ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => handleTabChange(tab)}
                >
                  {tab}
                </button>
              ))}
               
              <div className="more-menu">
                <button 
                  className="more-icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MoreVertIcon/>
                </button>
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    {activeTab === 'Note' && (
                      <>
                        <button onClick={handleEditToggle}>
                          {isEditing ? 'Stop Editing' : 'Edit'}
                        </button>
                        <button onClick={handleAddTag}>Add Tag</button>
                        <button onClick={handleGoToSource}>Go to Source</button>
                      </>
                    )}
                    {activeTab === 'Summary' && (
                      <>
                        <button onClick={handleEditToggle}>
                          {isEditing ? 'Stop Editing' : 'Edit'}
                        </button>
                        <button onClick={handleAddLink}>Add Link</button>
                        <button onClick={handleGoToSource}>Go to Source</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
            
            <div className="tab-content">
              {activeTab === 'Note' && (
                <div className="note-tab">
                  {isEditing ? (
                    <>
                    <textarea
                      value={noteContent}
                      onChange={handleContentChange}
                      className="editable-content"
                    />
                      <button className="save-editing" onClick={handleEditToggle}>save</button>
                    </>
                    
                  ) : (
                    <p>{noteContent}</p>
                  )}
                </div>
              )}
              
              {activeTab === 'Summary' && (
                <div className="summary-tab">
                  {isEditing ? (
                    <>
                    <textarea
                      value={summaryContent}
                      onChange={handleContentChange}
                      className="editable-content"
                      />
                      <button className="save-editing" onClick={handleEditToggle}>save</button>
                      </>
                  ) : (<>
                    <p>{summaryContent}</p>
                  </>
                  )}
                  {!isEditing && (
                    <>
                    {/* <button 
                      className="generate-summary-btn"
                      onClick={handleGenerateSummary}
                    >
                      Generate Summary
                    </button> */}
                    <hr />
                    <p className="tags-head">TAGS</p>
                    {tags.map((tag, index) => (
                    <button key={index} className="tag">
                      {tag}
                    </button>
                  ))}
                  <div className="source-container"> 
                   <a href={source} target="_blank">
                      <button className="source-btn">Source</button>
                  </a>
                  </div>
                    </>
                  )}
                </div>
              )}
              
              {/* {activeTab === 'Mindmap' && (
                <div className="mindmap-tab">
                  <p>Mindmap content to be implemented</p>
                </div>
              )} */}
            </div>
          </div>
        </div>
      )}
      </>
  );
}

export default KnowledgeCard;