import React, { useState } from "react";
import "../css/KnowledgeCard.css";
import CancelIcon from "@mui/icons-material/Cancel";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Favorite, FavoriteBorder} from "@mui/icons-material";
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import LinkIcon from '@mui/icons-material/Link';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from "@mui/material";
import knowledgeCardApi from "../services/KnowledgeCardService";
import MyEditor from "./RichTextEditor";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const KnowledgeCard = ({cardData, refreshCards}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Summary');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(cardData.note || 'No Note Yet...');
  const [summaryContent, setSummaryContent] = useState(cardData.summary || 'No Summary Yet...');
  const [isfavourite, setIsfavourite] = useState(cardData.favourite || false);


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
    setIsMenuOpen(false);
    if (cardData.source_url) {
      window.open(cardData.source_url, "_blank", "noopener,noreferrer");
    } else {
      alert("No source URL available.");
    }
  };

  const handleContentChange = (newContent) => {
    if (activeTab === 'Note') {
      setNoteContent(newContent);
    } else if (activeTab === 'Summary') {
      setSummaryContent(newContent);
    }
  };

  const onFavouriteClick = async () => {
    setIsfavourite(!isfavourite);
    const response = await knowledgeCardApi.handlefavourite(cardData);
    console.log("Favourite response", response);
  };

  const onArchiveClick = async () => {
    const response = await knowledgeCardApi.handleArchive(cardData);
    console.log("Archive Response", response);
  };

  const onExportClick = async (cardData, fileFormat) => {
    try {
      const response = await knowledgeCardApi.handleDownload(cardData, fileFormat);
  
      const mimeType = fileFormat === "pdf" ? "application/pdf" : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      const blob = new Blob([response], { type: mimeType });
  
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `knowledge_card_${cardData.card_id}.${fileFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed", error);
    }
  };

  const onDeleteClick = async (cardData) => {
    try {
      const response = await knowledgeCardApi.handleDelete(cardData);
      toast.success("Card Deleted");
      console.log(response);
      refreshCards();
    } catch (error) {
      console.error ("Delete error", error)
    }
  }

  const onEditSaveClick = async (cardData, summaryContent, noteContent) => {
    try {
      handleEditToggle();
      const response = await knowledgeCardApi.handleEdit(cardData, summaryContent, noteContent);
      console.log(response);
    } catch (error) {
      console.error("Edit error", error);
    }

  }
  

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Reset states when closing
    if (isExpanded) {
      setActiveTab('Note');
      setIsMenuOpen(false);
      setIsEditing(false);
    }
  };

  const formattedDate = new Date(cardData.created_at).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
  <>
      <div 
        className="relative flex flex-col items-center h-74 w-74 shadow-sm shadow-gray-400 cursor-pointer transition-transform transform hover:scale-105 rounded-md bg-white overflow-hidden"
        onClick={toggleExpand}
      >
        <div className="flex flex-col items-start justify-end w-[80%] mt-2 ml-5 self-start">

        {/* Title */}
        <div className="font-black text-sm text-emerald-950 leading-snug min-h-[3rem] flex items-start justify-start pt-2 pr-2">
            {cardData.title}
          </div>

          {/* Date */}
          <div className="text-gray-500 text-sm flex justify-start">{formattedDate}</div>

        </div>

        {/* Thumbnail */}
        <div 
          className="w-[90%] h-50 bg-cover bg-[0px_-20px] rounded-md mt-2"
          style={{ backgroundImage: `url(${cardData.thumbnail})` }}
        ></div>

        {/* Content container */}
        <div className="flex flex-col items-start justify-end w-full px-5 py-2 space-y-1">
          
        {/* Category Tag */}
          {cardData?.category && (
            <Tooltip title="Category" arrow>
              <div className=" absolute bottom-2 left-5 bg-gray-300 flex items-center justify-center text-black rounded-md w-auto pt-0.5 pl-1 pr-1">
                {cardData.category}
              </div>
            </Tooltip>
          )}
        </div>

        {/* Icons */}
        
        {/* Favourite Button */}
        <div className="absolute top-3 right-3 z-10">
          <Tooltip title={isfavourite ? "Remove from favourites" : "Add to favourites"} arrow>
            <IconButton onClick={(e) => {
              e.stopPropagation();
              onFavouriteClick(cardData)
            }}>
              {isfavourite ? <Favorite style={{ color: '#b01e28' }} /> : <FavoriteBorder />}
            </IconButton>
          </Tooltip>
        </div>

        {/* Archive Card Button */}
        <div>
          <Tooltip title="Archive" arrow>
            <IconButton onClick={(e)=>{
              e.stopPropagation();
              onArchiveClick(cardData);
            }}>
              {/* <RemoveCircleIcon /> */}
            </IconButton>
          </Tooltip>
        </div>

        {/* Delete card Button */}
        <div className="absolute bottom-1 right-3 z-10">
          <Tooltip title="Delete Card" arrow>
            <IconButton onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(cardData);
            }}>
               <DeleteIcon style={{ color: 'black' }} />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      
      {isExpanded && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" >
          <div className="flex flex-col relative bg-white w-[80%] h-[80%] rounded-lg shadow-lg p-4"> 
            <button 
              className="absolute top-8 right-6 text-black" 
              onClick={toggleExpand}
            >
              <CancelIcon/>
            </button>
            {/* <button className="source-icon">
            <a href={source} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit', marginRight: '5px' }}>
              <OpenInNewIcon />
            </a>
            </button> */}
            <div className="self-center flex justify-center items-center w-[20%] bg-gray-300 rounded-md p-2 mt-2 mb-4">
            <div className="flex gap-2 w-full">
              {['Note', 'Summary'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabChange(tab)}
                  className={`w-full text-black px-3 py-1 rounded-md transition-all duration-100
                    ${activeTab === tab ? 'bg-white font-semibold shadow-inner' : 'hover:bg-[#fafafa]'}`}
                >
                  {tab}
                </button>
              ))}
               
              <div className="absolute top-6 right-12">
                <IconButton 
                  className="more-icon"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MoreVertIcon sx={{color: "black"}}/>
                </IconButton>

                {isMenuOpen && (
                  <div className="dropdown-menu z-auto">
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
                        <button onClick={handleAddLink}>Add Tags</button>
                        <button onClick={handleGoToSource}>Go to Source</button>
                      </>
                    )}
                  </div>
                )}
                
                {/* Export Card Button */}
                <div className="absolute top-0 right-8 z-10">
                  <Tooltip title="Export Card as" arrow>
                    <IconButton onClick={(e) => {
                      e.stopPropagation();
                      setIsDownloadMenuOpen(!isDownloadMenuOpen);
                    }}>
                      <ArrowOutwardIcon style={{ color: 'black' }} />
                    </IconButton>
                  </Tooltip>
                  {/* Dropdown */}
                  <div className={`absolute bg-gray-200 text-black text-sm rounded-md shadow-md z-10 flex flex-col w-14 transition-all duration-300 ease-in-out origin-top ${isDownloadMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                    <button className="py-1 hover:bg-emerald-300 rounded-t-xl" onClick={(e)=>{e.stopPropagation(); onExportClick(cardData, 'pdf'); setIsDownloadMenuOpen(!isDownloadMenuOpen)}}>pdf</button>
                    <button className="py-1 hover:bg-emerald-300 rounded-b-xl" onClick={(e)=>{e.stopPropagation(); onExportClick(cardData, 'docx'); setIsDownloadMenuOpen(!isDownloadMenuOpen)}}>docx</button>
                  </div>
                </div>
                {/* Source Button
                <div className="absolute top-0 right-8">
                  <Tooltip title="Go to Source" arrow>
                    <IconButton onClick={
                      handleGoToSource}>
                      <LinkIcon sx={{color: "black"}}/>
                    </IconButton>
                  </Tooltip>
                </div> */}
              </div>
            </div>
            </div>
            
            <div className="tab-content h-[100%] border-t border-b ">
              {activeTab === 'Note' && (
                <div className="note-tab bg-gray-400/10 rounded-lg p-10 text-black">
                  {isEditing ? (
                    <>
                    {/* <textarea
                      value={noteContent}
                      onChange={handleContentChange}
                      className="editable-content"
                    /> */}

                    <MyEditor
                      note={noteContent}
                      setNote={handleContentChange}
                    />
                      <button className="save-editing" onClick={() => onEditSaveClick(cardData, summaryContent, noteContent)}>save</button>
                    </>
                    
                  ) : (
                    <div
                      className="note-content text-black"
                      dangerouslySetInnerHTML={{ __html: noteContent }}
                    />
                  )}
                </div>
              )}
              
              {activeTab === 'Summary' && (
                <div className="summary-tab bg-gray-400/10 rounded-lg p-10 text-black">
                  {isEditing ? (
                    <>
                    {/* <textarea
                      value={summaryContent}
                      onChange={handleContentChange}
                      className="editable-content text-black"
                      /> */}
                      <MyEditor 
                      note={summaryContent}
                      setNote={handleContentChange}
                      />
                      <button className="save-editing" onClick={() => onEditSaveClick(cardData, summaryContent, noteContent)}>save</button>
                      </>
                  ) : (<>
                    <div
                      className="summary-content pb-10 text-black"
                      dangerouslySetInnerHTML={{ __html: summaryContent }}
                    />
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
                    <p className="tags-head mt-2.5">TAGS</p>
                    {cardData.tags.map((tag, index) => (
                    <button key={index} className="tag bg-gray-300 rounded-md">
                      {tag}
                    </button>
                  ))}
                
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