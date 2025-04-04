import React, { useState } from 'react';
import '../css/AddKnowledgeCard.css';
import axios from 'axios';

const AddKnowledgeCard = ({onSave}) => {
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const handleSave = async () => {
    if (!link) return;
    
    setIsLoading(true);
  
    try {
      const token = localStorage.getItem("token"); // Retrieve token from local storage
      
      const payload = {
        token: token,
        source_url: link,
        note: note || "", // Ensure note is sent, even if it's empty
      };
  
        const response = await axios.post(`${backendUrl}/knowledge-card/`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      })

      if (onSave) {
        onSave(response.data)
      }
      setLink("");
      setNote("");
    } catch (error) {
      console.error("Error saving knowledge card:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    
    <div className="add-knowledge-card" >
        {isLoading && <div className="loading-overlay">Saving... Please wait</div>}
      <div className="input-container">
        <input
          type="text"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="Enter Link: https://example.com/article"
          className="link-input"
        />
      </div>
      
      <div className="input-container">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add Note here|"
          className="note-input"
        />
      </div>
      
      
        <button
          onClick={handleSave}
          disabled={isLoading || !link}
          className="save-button"
        >
          {isLoading ? 'Saving' : 'Save'}
        </button>
     
    </div>
  );
};

export default AddKnowledgeCard;