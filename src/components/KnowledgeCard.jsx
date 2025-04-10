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
              <div className=" absolute bottom-2 left-5 text-sm bg-gray-300 flex items-center justify-center text-black rounded-md w-auto pt-0.5 pl-1 pr-1">
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
        <div className="fixed inset-0 text-black bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="relative flex flex-col bg-white w-full max-w-7xl h-[90%] md:h-[85%] rounded-xl shadow-xl p-4 overflow-hidden">
            
            
            {/* Tab Buttons + Menu + Export */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center bg-gray-100 rounded-md p-2 gap-2 mb-4">
              
              <div className="flex w-full md:w-1/3 gap-2">
                {['Note', 'Summary'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`w-full px-4 py-2 rounded-md transition-all duration-150 text-sm
                      ${activeTab === tab
                        ? 'bg-white font-semibold shadow-inner'
                        : 'hover:bg-gray-200 text-black'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Close -- Menu == Export Controls */}
              <div className="relative flex items-center gap-2 mt-2 md:mt-0">

                {/* More Menu */}
                <IconButton
                  className="text-black"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <MoreVertIcon />
                </IconButton>



                {isMenuOpen && (
                  <div className="absolute top-10 right-10 bg-white shadow-lg rounded-md py-2 z-50 flex flex-col text-sm min-w-[140px]">
                    <button className="px-4 py-2 hover:bg-gray-100" onClick={handleEditToggle}>
                      {isEditing ? 'Stop Editing' : 'Edit'}
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-100" onClick={activeTab === 'Note' ? handleAddTag : handleAddLink}>
                      {activeTab === 'Note' ? 'Add Tag' : 'Add Tags'}
                    </button>
                    <button className="px-4 py-2 hover:bg-gray-100" onClick={handleGoToSource}>
                      Go to Source
                    </button>
                  </div>
                )}

                {/* Export Menu */}
                <div className="relative">
                  <Tooltip title="Export Card as" arrow>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDownloadMenuOpen(!isDownloadMenuOpen);
                      }}
                    >
                      <ArrowOutwardIcon style={{ color: 'black' }} />
                    </IconButton>
                  </Tooltip>

                  <div className={`absolute right-0 top-10 bg-white shadow-lg rounded-md overflow-hidden text-sm z-50 transition-transform duration-200 ease-in-out ${isDownloadMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
                    <button
                      className="block w-full px-4 py-2 hover:bg-emerald-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportClick(cardData, 'pdf');
                        setIsDownloadMenuOpen(false);
                      }}
                    >
                      PDF
                    </button>
                    <button
                      className="block w-full px-4 py-2 hover:bg-emerald-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportClick(cardData, 'docx');
                        setIsDownloadMenuOpen(false);
                      }}
                    >
                      DOCX
                    </button>
                  </div>
                </div>

                   {/* Close Button */}
                <IconButton 
                  className="text-black"
                  onClick={toggleExpand}
                >
                  <CancelIcon />
                </IconButton>

              </div>
            </div>

            {/* Main Tab Content */}
            <div className="flex-1 overflow-y-auto border-t border-b">
              {activeTab === 'Note' && (
                <div className="p-4 bg-gray-50 rounded-md text-black">
                  {isEditing ? (
                    <>
                      <MyEditor note={noteContent} setNote={handleContentChange} />
                      <button
                        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                        onClick={() => onEditSaveClick(cardData, summaryContent, noteContent)}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <div
                      className="text-black"
                      dangerouslySetInnerHTML={{ __html: noteContent }}
                    />
                  )}
                </div>
              )}

              {activeTab === 'Summary' && (
                <div className="p-4 bg-gray-50 rounded-md text-black">
                  {isEditing ? (
                    <>
                      <MyEditor note={summaryContent} setNote={handleContentChange} />
                      <button
                        className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                        onClick={() => onEditSaveClick(cardData, summaryContent, noteContent)}
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <>
                      <div
                        className="pb-4 text-black"
                        dangerouslySetInnerHTML={{ __html: summaryContent }}
                      />
                      <hr />
                      <p className="mt-3 font-medium">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {cardData.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-300 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </>
  );
}

export default KnowledgeCard;