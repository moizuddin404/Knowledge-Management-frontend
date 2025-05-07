import React, { useContext, useEffect, useState } from "react";
import { useRef } from "react";
import "../css/KnowledgeCard.css";
import { Autocomplete, Button, CircularProgress, IconButton, Popper, TextField, Tooltip } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Close, Favorite, FavoriteBorder } from "@mui/icons-material";
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import MoveToInboxRoundedIcon from '@mui/icons-material/MoveToInboxRounded';
import knowledgeCardApi from "../services/KnowledgeCardService";
import MyEditor from "./RichTextEditor"
import { AuthContext } from "../context/AuthContext";
import { toast } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import DeleteDialog from "./DeleteDialog";
import ShareDialog from "./ShareCardDialog";
import CopyLinkDialog from "./CopyLinkDialog";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import NoUrlModal from "./NoUrlModal";
import axios from "axios";
import Chatbot from "./Chat";
import "../css/scrollbar.css";

const KnowledgeCard = ({ cardData, removeCardFromUI, currentTab, userId }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Summary');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isKcMenuOpen, setIsKcMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(cardData.note || 'No Note Yet...');
  const [summaryContent, setSummaryContent] = useState(cardData.summary || 'No Summary Yet...');
  const [tags, setTags] = useState(cardData.tags || []);
  const [qaContent, setQaContent] = useState(cardData.qna || []);
  const [showGenerateButton, setShowGenerateButton] = useState(true);
  const [visibleAnswers, setVisibleAnswers] = useState([]);
  const [isfavourite, setIsfavourite] = useState(cardData.favourite || false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  // const [currentTag, setCurrentTag] = useState("AAA");
  const [isPublic, setIsPublic] = useState(cardData?.public)
  const [isLiked, setIsLiked] = useState(cardData?.liked_by_me);
  const [likes, setLikes] = useState(cardData.likes);

  // category states 
  const [categoryEditorOpen, setCategoryEditorOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editingCategories, setEditingCategories] = useState(cardData.category || []);
  const [allCategories, setAllCategories] = useState(["AI", "Design", "Productivity", "React", "Web Development", "UX"]);
  const [categories, setCategories] = useState(cardData.category || []);


  const [downloading, setDownloading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [kmContent, setKmContent] = useState(cardData.knowledge_map || []);
  const [loadingKm, setLoadingKm] = useState(false);
  const [showGenerateMapButton, setShowGenerateMapButton] = useState(true);

  const [showChat, setShowChat] = useState(false);

  const { user } = useContext(AuthContext);
  const isOwner = userId === cardData.user_id;
  const [isBookmarked, setIsBookmarked] = useState(cardData?.bookmarked_by?.includes((user?.userId)));
  const handleTabChange = (tab) => {
    if (!isEditing) {
      setActiveTab(tab);
      setIsMenuOpen(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setIsMenuOpen(false);
  };

  const handlePublicToggle = async () => {
    const response = await knowledgeCardApi.handlePublic(cardData);
    console.log("Public Response", response);
    if (response.status === 200) {
      setIsPublic(!isPublic);
      toast.success(response.message || `Card is now ${!isPublic ? "Public" : "Private"}`);
    } else if (response.status === 400) {
      toast.warning(response.message || "Unexpected response.");
    }

    console.log("Public Response", response)
  }

  const handleGoToSource = () => {
    setIsMenuOpen(false);
    if (cardData.source_url) {
      window.open(cardData.source_url, "_blank", "noopener,noreferrer");
    } else {
      setOpenModal(true);
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

  const onLikeClick = async (e) => {
    e.stopPropagation();
    const userId = user?.userId;
    setIsLiked(prev => !prev);
    const response = await knowledgeCardApi.handleLike(cardData, userId);
    setLikes(prev => prev + (isLiked ? -1 : 1));
    console.log("Like response", response);
  };

  const onBookmarkClick = async (e) => {
    e.stopPropagation();
    const userId = user?.userId;
  
    const response = await knowledgeCardApi.handleBookmark(cardData, userId);
  
    if (response && response.status === 200) {
      const newStatus = !isBookmarked;
      setIsBookmarked(newStatus);
  
      // Remove the card from UI if it's unbookmarked and we're in the Bookmarked tab
      if (!newStatus && currentTab === 1 && removeCardFromUI) {
        removeCardFromUI(cardData.card_id || cardData._id);
      }
    }
  
    console.log("Like response", response);
  };

  const onArchiveClick = async () => {
    const response = await knowledgeCardApi.handleArchive(cardData);
    console.log("Archive Response", response);
    toast.success(`${response.message}`);
    removeCardFromUI(cardData.card_id);
  };

  // Handle the click event for the "Copy card to home" button
  const handleCopy = async () => {
    const response = await knowledgeCardApi.handleCopy(cardData, userId);
    if (response.status === 200) {
      toast.success("Card Copied to Home");
    } else {
      toast.error("Card already copied to Home");
    }
    console.log("Like response", response);
  }


  // Handle the click event for the "Download" button
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

  // Handle the click event for the "Save" button in edit mode
  const onEditSaveClick = async (cardData, summaryContent, noteContent) => {
    try {
      handleEditToggle();
      const response = await knowledgeCardApi.handleEdit(cardData, summaryContent, noteContent);
      console.log(response);
    } catch (error) {
      console.error("Edit error", error);
    }

  }

// expanding knowledge card
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    // Reset states when closing
    if (isExpanded) {
      setActiveTab('Note');
      setIsMenuOpen(false);
      setIsEditing(false);
    }
  };

  const toggleKcMenu = () => {
    setIsKcMenuOpen(!isKcMenuOpen);
  }

  // const formattedDate = new Date(cardData.created_at).toLocaleDateString('en-GB', {
  //   day: '2-digit',
  //   month: 'short',
  //   year: 'numeric',
  // });

  const stripHtml = (html) => {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const tagInputRef = useRef(null);

  // Opening Add tag input box
  const openAddTag = () => {
    setIsAddTagOpen(true);
    setTimeout(() => {
      tagInputRef.current?.focus();
    }, 0);
  };


  // Add tag in Knowledge card
  const handleAddTag = async () => {
    const userId = user?.userId;
    try {
      const response = await knowledgeCardApi.handleAddTag(cardData, newTag, userId);
      console.log("Add Tag Response", response.tags);
      if (response.status_code === 200) {
        
        toast.success(response.message || "Tag added successfully!");
        setTags((prevTags) => [...prevTags, newTag]);
        setNewTag("");
        setIsAddTagOpen(false);
  
      } else if (response.status_code === 400) {
        
        toast.error(response.message || "Tag already exists!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to add tag");
    }
  };
  
  // Remove tag functionality
  const handleRemoveTag = async (tagToRemove) => {
    const userId = user?.userId;
    try {
      const response = await knowledgeCardApi.handleRemoveTag(cardData, tagToRemove, userId);
  
      if (response.status_code === 200) {
        toast.success(response.message || "Tag removed successfully!");
        setTags((prevTags) => prevTags.filter((tag) => tag !== tagToRemove));
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove tag");
    }
  };  


  // generating questions and answers
  const handleGenerate = async () => {
    setLoading(true);
    const generatedQA = await knowledgeCardApi.handleQuestionAnswers(cardData);
    setQaContent(generatedQA);
    setLoading(false);
    setShowGenerateButton(false);
  };

  // generating knowledge map
  const handleGenerateMap = async () => {
    setLoadingKm(true);
    const generatedKm = await knowledgeCardApi.handleKnowledgeMap(cardData);
    console.log("Generated Knowledge Map:", generatedKm); 

    setKmContent(generatedKm);
    setLoadingKm(false);
    setShowGenerateMapButton(false);
  };

  const handleCategoryChipClick = (event) => {
    event.stopPropagation();
    setEditingCategories(categories); // sync current state
    setAnchorEl(event.currentTarget);
    setCategoryEditorOpen((prev) => !prev);
  };


  const saveCategories = async (newCategories) => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    try {
      console.log("Saving categories:", newCategories);
      const response = await axios.put(
        `${backendUrl}/knowledge-card/${cardData.card_id}/update-category`,
        {
          categories: newCategories, // array 
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
  
      console.log('Updated categories:', response.data);
      toast.success("Categories updated!");
      setCategories(newCategories);
      setCategoryEditorOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update categories.");
    }
  };

  const deleteCategory = async (cardId, category) => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.post(`${backendUrl}/knowledge-card/${cardId}/remove-category`, {
        categories: [category],
      });
    } catch (err) {
      console.error("Error removing category", err);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const response = await axios.get(`${backendUrl}/knowledge-card/categories`);
        const categoryNames = response.data.categories.map(cat => cat.name);
        setAllCategories(categoryNames);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      }
    };
  
    fetchCategories();
  }, []);


  // ===================== Actual component rendering ========================================
  return (
    <>
      <div
          className="relative flex flex-col items-center shadow-sm shadow-gray-400 cursor-pointer transition-transform transform hover:scale-105 rounded-md bg-white overflow-hidden"
          onClick={toggleExpand}
        >
          {/* Content Top Section */}
          <div className="flex flex-col items-start mt-2 mx-5 mr-4">
          <div className="flex items-center justify-between w-full">
            {/* Thumbnail */}
            <div className="flex">
              <div
                className="w-13 h-13 border bg-cover bg-center rounded-full flex justify-center items-center text-xl"
                style={{
                  background: cardData.thumbnail?.startsWith('http')
                    ? `url(${cardData.thumbnail})`
                    : '#fff',
                  border: '1px solid #e1e1e1',
                }}
              >
                {!cardData.thumbnail?.startsWith('http') && cardData.thumbnail}
              </div>
            </div>

          {/* top right icons  */}
          <div className="flex">
            {/* Go to source */}
            <div className="flex flex-col items-end">
            <Tooltip title="Go to Source" arrow>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoToSource();
                      }}
                    >
                      <OpenInNewRoundedIcon style={{ color: 'black' }} />
                    </IconButton>
                  </Tooltip>            
            </div>
            <NoUrlModal open={openModal} handleClose={() => setOpenModal(false)} />


            {/* More menu */}
            { isOwner && (
            <div className="flex flex-col items-end">
            <Tooltip title="Card Menu" arrow>
                <IconButton
                   onClick={(e) => {
                   e.stopPropagation();
                   toggleKcMenu();
                   }}
                   >
                  <MoreVertIcon style={{ color: 'black' }} />
                </IconButton>
            </Tooltip>
            <div
                    className={`absolute top-13 right-6 bg-[#f1f1f1] text-black shadow-lg rounded-md overflow-hidden text-sm z-50 transition-transform duration-200 ease-in-out ${
                      isKcMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'
                    }`}
                  >
                    <button
                      className="block w-full px-4 py-2 hover:bg-emerald-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onArchiveClick();
                        toggleKcMenu();
                      }}
                    >
                      {cardData.archive ? "Unarchive" :   <span><MoveToInboxRoundedIcon fontSize="small" className="mr-1"/>Archive</span>}
                    </button>

                    {/* Delete Dialog */}
                    <DeleteDialog cardData={cardData} removeCardFromUI={removeCardFromUI} toggleKcMenu={toggleKcMenu} />
                  </div>                          
          </div>
          )}
          </div>
        </div>

            {/* Title */}
            <div className="font-black text-md text-emerald-950 leading-snug mt-3 min-h-[3rem]">
              {cardData.title}
            </div>

            {/* Category Chips */}
            {(!categories || categories.length === 0) && isOwner && (
              <div
                className="inline-block text-xs text-emerald-600 border border-emerald-200 px-2 py-1 rounded-full cursor-pointer hover:bg-emerald-50 transition"
                onClick={handleCategoryChipClick}
              >
                + Add Category
              </div>
            )}
            {categories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {categories.slice(0, 3).map((cat, index) => {
                  const catStr = String(cat); // Force string
                  const shouldTruncate =
                    !(categories.length === 1 && catStr.length < 25) && catStr.length > 9;
                  const displayText = shouldTruncate ? `${catStr.slice(0, 9)}...` : catStr;

                  return (
                    <div
                      key={index}
                      className="text-xs bg-emerald-100 text-emerald-900 px-2 py-1 rounded-full cursor-pointer"
                      onClick={(e)=> {
                        if (!isOwner) {
                          e.stopPropagation();
                          return;
                        };
                        handleCategoryChipClick(e)}
                      }
                      title={catStr}
                    >
                      {displayText}
                    </div>
                  );
                })}
                {categories.length > 3 && (
                  <div
                    className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full"
                    onClick={handleCategoryChipClick}
                  >
                    +{categories.length - 3}
                  </div>
                )}
              </div>
            )}

            {categoryEditorOpen && (
              <div
                className="fixed inset-0 bg-transparent z-[1048]"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* category Popper */}
            <Popper
              open={categoryEditorOpen}
              anchorEl={anchorEl}
              placement="top-start"
              modifiers={[
                {
                  name: 'zIndex',
                  enabled: true,
                  phase: 'write',
                  fn({ state }) {
                    state.styles.popper.zIndex = 9999;
                  },
                },
              ]}
            >
              <div
                className="bg-white shadow-md p-4 rounded-md w-64 z-50 border border-gray-200"
                onClick={(e) => e.stopPropagation()} 
              >
                <Autocomplete
                  multiple
                  freeSolo
                  options={allCategories}
                  value={editingCategories}
                  onChange={async (event, newValue, reason) => {
                    const removed = editingCategories.filter(cat => !newValue.includes(cat));
                    
                    for (const cat of removed) {
                      await deleteCategory(cardData.card_id, cat); // ⬅️ use your actual cardId here
                    }
                  
                    setEditingCategories(newValue);
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#10B981',
                      },
                      '&:hover fieldset': {
                        borderColor: '#10B981',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#10B981',
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Edit Categories"
                      size="small"
                      onClick={(e) => e.stopPropagation()}
                      inputProps={{
                        ...params.inputProps,
                        maxLength: 16,
                      }}
                    />
                  )}
                />
                <div className="flex justify-end mt-2 gap-2">
                  <Button
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      setCategoryEditorOpen(false);
                    }}
                    className="!bg-red-500 !text-white hover:!bg-red-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="small"
                    onClick={async (e) => {
                      e.stopPropagation();
                      await saveCategories(editingCategories);
                      setCategoryEditorOpen(false);
                    }}
                    className="!bg-[#1f7281] !text-white hover:!bg-emerald-800"
                  >
                    Done
                  </Button>
                </div>
              </div>
            </Popper>


            {/* Summary */}
            <div className="border-t border-gray-200 pt-1 text-gray-500 text-sm mt-2 min-h-[6rem] max-h-[3rem]">
              {stripHtml(cardData?.summary.slice(0, 140) + "...")}
            </div>
          </div>

          {/* Footer Section */}
          <div className="flex justify-between items-center w-full px-3 mt-2">
            {/* Left Icons */}
            <div className="flex space-x-2">
              {/* Like Button */}
              {cardData?.public && (
                <div className="z-10 flex items-center">
                  <Tooltip title={likes > 1 ? `${likes} Likes` : likes === 1 ? `1 Like` : `No Likes`} arrow>
                    <IconButton onClick={onLikeClick}>
                      {isLiked ? <ThumbUpRoundedIcon className="text-emerald-500" /> : <ThumbUpOutlinedIcon className="text-black"/>}
                    </IconButton>
                  </Tooltip>
                  <span className="text-sm text-gray-500">{likes > 0 ? likes : null}</span>
                </div>
              )}

              {/* Favourite Button */}
              {isOwner && (
                <div className="z-10">
                  <Tooltip title={isfavourite ? "Remove from favourites" : "Add to favourites"} arrow>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation();
                        onFavouriteClick(cardData);
                      }}
                    >
                      {isfavourite ? <Favorite className="text-red-500" /> : <FavoriteBorder className="text-black" />}
                    </IconButton>
                  </Tooltip>
                </div>
              )}

              {/* Download Button */}
              <div className="z-10">
                <Tooltip title="Download as PDF" arrow>
                  <IconButton
                    onClick={async (e) => {
                      e.stopPropagation();
                      setDownloading(true);
                      try {
                        await onExportClick(cardData, 'pdf');
                      } finally {
                        setDownloading(false);
                      }
                    }}
                  >
                    {/* Fixed width and height container */}
                    <div className="w-6 h-6 flex items-center justify-center">
                      {downloading ? (
                        <CircularProgress size={24} sx={{ color: '#10b981' }} />
                      ) : (
                        <DownloadRoundedIcon className="text-black" />
                      )}
                    </div>
                  </IconButton>
                </Tooltip>
              </div>
          </div>

            {/* Right Icons */}
            <div className="flex space-x-2">
              {/* Copy Link Icon */}
              <div >
                <Tooltip title="Copy Link" arrow>
                  <span>
                  <CopyLinkDialog cardData={cardData} />
                  </span>
                </Tooltip>
              </div>

              {/* Bookmark Button */}
              
               { !isOwner && ( <div className="z-10">
                  <Tooltip title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"} arrow>
                    <IconButton onClick={onBookmarkClick}>
                      {isBookmarked ? <BookmarkIcon className="text-emerald-400" /> : <BookmarkBorderIcon className="text-black" />}
                    </IconButton>
                  </Tooltip>
                </div>)}
            
            </div>
          </div>

          {/* (Optional) Date */}
          {/* 
          <div className="absolute bottom-2 text-gray-500 text-sm flex justify-center items-center ml-8">
            {formattedDate}
          </div> 
          */}
        </div>



      {isExpanded && (
        <div className="fixed inset-0 text-black bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="relative flex flex-col bg-white w-full max-w-7xl h-[90%] md:h-[85%] rounded-xl shadow-xl p-4 overflow-hidden">


            {/* Tab Buttons + Menu + Export */}
            <div className="w-full flex flex-col md:flex-row justify-between items-center bg-gray-100 rounded-md p-2 gap-2 mb-4">

              <div className="flex w-full md:w-1/3 gap-2">
                {['Summary', 'Note', 'Q&A', 'Knowledge Map'].map((tab) => (
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

              {/* Close -- Menu -- Export Controls */}
              <div className="relative flex items-center gap-2 mt-2 md:mt-0">
                <div className="flex items-center gap-2 text-black bg-gray-100 rounded-md px-2 text-xs">
                  <p>{cardData?.copied_from ? "Copied" : null}</p>
                </div>
                {console.log("Card Data", cardData)}

                {/* More Menu */}
                <Tooltip title='More' placement="top">
                  <IconButton
                    className="text-black"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>



                {isMenuOpen && (
                  <div className="absolute top-10 right-10 bg-white shadow-lg rounded-md py-2 z-50 flex flex-col text-sm min-w-[140px]">
                    {isOwner && (<button className="px-4 py-2 hover:bg-gray-100" onClick={handleEditToggle}>
                      {isEditing ? 'Stop Editing' : 'Edit'}
                    </button>)}
                    {isOwner && (<DeleteDialog cardData={cardData} removeCardFromUI={removeCardFromUI} toggleKcMenu={toggleKcMenu}/>)}
                    {isOwner && (<button className="px-4 py-2 hover:bg-gray-100" onClick={''}>
                      Add Category
                    </button>)}
                    {cardData?.source_url && <button className="px-4 py-2 hover:bg-gray-100" onClick={handleGoToSource}>
                      Go to Source
                    </button>}
                    {!isOwner && (<button className="px-4 py-2 hover:bg-gray-100" onClick={() => { setIsMenuOpen(false); handleCopy(); }}>
                      Copy to Home
                    </button>)}
                  </div>
                )}

                {/* Export Menu */}
                <div className="relative">
                  <Tooltip title="Export Card as" placement="top" arrow>
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
                    {/* <button
                      className="block w-full px-4 py-2 hover:bg-emerald-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        onExportClick(cardData, 'docx');
                        setIsDownloadMenuOpen(false);
                      }}
                    >
                      DOCX
                    </button> */}
                  </div>
                </div>

                {/* Public Access Button */}
                {
                  cardData.copied_from == null && isOwner && (isPublic
                    ? (
                      <Tooltip title='Make Card Private'>
                        <IconButton
                          className="text-black"
                          onClick={handlePublicToggle}
                        >
                          <PublicIcon />
                        </IconButton>
                      </Tooltip>
                    )
                    : (
                      <Tooltip title='Make Card Public'>
                        <IconButton
                          className="text-black"
                          onClick={handlePublicToggle}
                        >
                          <PublicOffIcon />
                        </IconButton>
                      </Tooltip>
                    )
                  )
                }

                {/* Close Button */}
                <Tooltip title='Close'>
                  <IconButton
                    className="text-black"
                    onClick={toggleExpand}
                  >
                    <CancelIcon />
                  </IconButton>
                </Tooltip>
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
                <div className="flex flex-col md:flex-row gap-4 p-4 bg-gray-50 rounded-md text-black font-sans max-h-[490px]">
                {/* Summary Area - 60% */}
                <div className={`${showChat ? "lg:w-3/5" : "w-full"} pr-2 overflow-y-auto scrollbar transition-all duration-300 scrollable-chat`}>
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
                      <div>
                        <button onClick={() => setShowChat(prev=> !prev)} className="bg-emerald-500 text-white rounded-md px-4 py-2 my-5 hover:bg-emerald-600">
                          💡 Custom Prompt
                        </button>
                      </div>
                      <div
                        className="pb-4 text-black"
                        dangerouslySetInnerHTML={{ __html: summaryContent }}
                      />
                      <hr />
                      <p className="mt-3 font-medium">Tags</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <button
                          className="border bg-emerald-400 rounded-xl px-3 hover:bg-white text-white hover:text-emerald-400 hover:border border-emerald-800 text-xs"
                          onClick={openAddTag}
                        >
                          Add Tag +
                        </button>
                        {isAddTagOpen && (
                          <>
                            <input
                              ref={tagInputRef}
                              type="text"
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={async (e) => {
                                if (e.key === "Enter" && newTag.trim() !== "") {
                                  e.preventDefault();
                                  await handleAddTag();
                                }
                              }}
                              className="border px-2 py-1 text-xs rounded"
                              placeholder="Enter tag"
                            />
                            <button
                              onClick={() => {
                                setNewTag("");
                                setIsAddTagOpen(false);
                              }}
                              className="text-xs text-red-500 border border-red-500 rounded px-2 ml-1 hover:bg-red-100"
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-300 rounded-full text-xs"
                          >
                            {tag}
                            <button
                              onClick={() => handleRemoveTag(tag)}
                              className="ml-1 text-red-500 hover:text-red-700"
                              title="Remove tag"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
          
                {/* Chat Area - 40% (Fixed) */}
                {showChat && (
                  <div className="w-full  lg:w-2/5 pl-2 border-l border-gray-300 flex flex-col">
                    <div className="flex justify-end mb-2">
                      <IconButton
                        onClick={() => setShowChat(false)}
                        className="text-black"
                      >
                        <Close />
                      </IconButton>
                    </div>
                    <div className="flex-1">
                      <Chatbot cardId={cardData.card_id}/>
                    </div>
                  </div>
                )}
              </div>
              )}
              {activeTab === 'Q&A' && (
                  <div className="p-4 bg-gray-50 rounded-md text-black font-sans">
                    <div className="flex flex-col gap-4 w-full">  
                    {qaContent.length === 0 && (
                        <button
                          className={`self-start px-2 py-2 rounded-md font-semibold ${
                            loading
                              ? 'bg-gray-400 text-white cursor-wait'
                              : 'bg-[#1f7281] text-white hover:bg-emerald-700'
                          }`}
                          onClick={handleGenerate}
                          disabled={loading}
                        >
                          {loading ? 'Generating...' : 'Generate Question Answers'}
                        </button>
                      )}
                      {/* Skeleton Loader */}
                      {loading && (
                        <div className="space-y-4 mt-4">
                          {[...Array(5)].map((_, idx) => (
                            <div key={idx} className="p-4 rounded-md border bg-white animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                              <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Render Q&A */}
                      {!loading && qaContent?.length > 0 && (
                        <div className="mt-4 space-y-4">
                          {qaContent.map((item, idx) => {
                            const isOpen = visibleAnswers.includes(idx);
                            return (
                              <div
                                key={idx}
                                className="bg-white rounded-md p-4 shadow-sm border"
                              >
                                <div
                                  className="flex justify-between items-center cursor-pointer"
                                  onClick={() =>
                                    setVisibleAnswers((prev) =>
                                      prev.includes(idx)
                                        ? prev.filter((i) => i !== idx)
                                        : [...prev, idx]
                                    )
                                  }
                                >
                                  <p className="font-semibold text-emerald-700">
                                    Q{idx + 1}: {item.question}
                                  </p>
                                  {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                                <AnimatePresence initial={false}>
                                  {isOpen && (
                                    <motion.div
                                      key="content"
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden mt-2"
                                    >
                                      <p className="text-gray-700">A: {item.answer}</p>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      )}
                      {!loading && !qaContent?.length && (
                        <p className="mt-4 text-gray-500 italic">No question-answers yet. Click the button to generate.</p>
                      )}
                    </div>
                  </div>
                )}
                {activeTab === 'Knowledge Map' && (
                  <div className="p-4 bg-gray-50 rounded-md text-black font-sans">
                    {kmContent.length === 0 && (
                        <button
                          className={`px-4 py-2 rounded-md font-semibold ${
                            loadingKm
                              ? 'bg-gray-400 text-white cursor-wait'
                              : 'bg-[#1f7281] text-white hover:bg-emerald-700'
                          }`}
                          onClick={handleGenerateMap}
                          disabled={loadingKm}
                        >
                          {loadingKm ? 'Generating knowledge Map for You...' : 'Generate Knowledge Map'}  
                        </button>
                      )}
                      {loadingKm && (
                        <div className="space-y-4 mt-4">
                          {[...Array(5)].map((_, idx) => (
                            <div key={idx} className="p-4 rounded-md border bg-white animate-pulse">
                              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
                              <div className="h-3 bg-gray-200 rounded w-full" />
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Render Map */}
                      {!loadingKm && kmContent && (
                    <div className="mt-4 space-y-6">
                      {Array.isArray(kmContent) && kmContent.map((section, sectionIdx) => (
                        <div key={sectionIdx} className="bg-gray-50 rounded-lg p-4 shadow border border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xl"></span>
                            <h2 className="text-lg font-semibold text-gray-800">{section.section}</h2>
                          </div>
                          <div className="space-y-3">
                            {section.items.map((item, itemIdx) => {
                              const idx = `${sectionIdx}-${itemIdx}`;
                              const isOpen = visibleAnswers.includes(idx);
                              return (
                                <div
                                  key={idx}
                                  className="bg-white rounded-md p-4 shadow-sm border"
                                >
                                  <div
                                    className="flex justify-between items-center cursor-pointer"
                                    onClick={() =>
                                      setVisibleAnswers((prev) =>
                                        prev.includes(idx)
                                          ? prev.filter((i) => i !== idx)
                                          : [...prev, idx]
                                      )
                                    }
                                  >
                                  <p className="font-semibold text-emerald-700">
                                    {item.topic} <span className="ml-2 text-sm text-gray-500">{item.difficulty}</span>
                                  </p>
                                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                  </div>
                                  <AnimatePresence initial={false}>
                                    {isOpen && (
                                      <motion.div
                                        key="content"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden mt-2"
                                      >
                                        <p className="text-gray-700">{item.description}</p>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    )}
                    {!loading && !kmContent?.knowledgeMap?.length && (
                    <p className="mt-4 text-gray-500 italic">No knowledge map available yet.</p>
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