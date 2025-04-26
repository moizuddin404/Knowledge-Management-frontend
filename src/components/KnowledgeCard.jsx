import React, { act, useContext, useEffect, useState } from "react";
import "../css/KnowledgeCard.css";
import { IconButton, Tooltip } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import PublicIcon from '@mui/icons-material/Public';
import PublicOffIcon from '@mui/icons-material/PublicOff';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import CancelIcon from "@mui/icons-material/Cancel";
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import knowledgeCardApi from "../services/KnowledgeCardService";
import MyEditor from "./RichTextEditor"
import { AuthContext } from "../context/AuthContext";
import { toast } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';
import DeleteDialog from "./DeleteDialog";
import ShareDialog from "./ShareCardDialog";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

const KnowledgeCard = ({ cardData, removeCardFromUI, currentTab }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Summary');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const [isKcMenuOpen, setIsKcMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [noteContent, setNoteContent] = useState(cardData.note || 'No Note Yet...');
  const [summaryContent, setSummaryContent] = useState(cardData.summary || 'No Summary Yet...');
  const [loadingQa, setLoadingQa] = useState(false);
  const [qaContent, setQaContent] = useState(cardData.qna || []);
  const [showGenerateButton, setShowGenerateButton] = useState(true);
  const [visibleAnswers, setVisibleAnswers] = useState([]);
  const [isfavourite, setIsfavourite] = useState(cardData.favourite || false);
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(cardData?.public)
  const [isLiked, setIsLiked] = useState(cardData?.liked_by_me);
  const [likes, setLikes] = useState(cardData.likes);
  const [isEditingCategory, setIsEditingCategory] = useState(false);
  const [categoryInput, setCategoryInput] = useState(cardData?.category || "");
  const [savedCategory, setSavedCategory] = useState(cardData?.category || "");
  const [displayedCategory, setDisplayedCategory] = useState(cardData?.category || "");

  const [loading, setLoading] = useState(false);
  const [kmContent, setKmContent] = useState(cardData.knowledge_map || []);
  const [loadingKm, setLoadingKm] = useState(false);
  const [showGenerateMapButton, setShowGenerateMapButton] = useState(true);

  const { user } = useContext(AuthContext);
  const isOwner = user?.userId === cardData.user_id;
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

  // const handleAddTag = () => {
  //   alert('Add Tag functionality to be implemented');
  //   setIsMenuOpen(false);
  // };

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

  const handleCopy = async () => {
    const userId = user?.userId;
    const response = await knowledgeCardApi.handleCopy(cardData, userId);
    if (response.status === 200) {
      toast.success("Card Copied to Home");
    } else {
      toast.error("Card already copied to Home");
    }
    console.log("Like response", response);
  }

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

  // const onDeleteClick = async (cardData) => {
  //   try {

  //     const response = await knowledgeCardApi.handleDelete(cardData);
  //     toast.success("Card Deleted");
  //     console.log(response);
  //     refreshCards();
  //   } catch (error) {
  //     console.error ("Delete error", error)
  //   }
  // }

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

  const openAddTag = () => {
    setIsAddTagOpen(!isAddTagOpen);
  }

  const saveCategory = async () => {
    if (!categoryInput.trim()) return;
  
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.put(`${backendUrl}/knowledge-card/${cardData.card_id}/update-category`, {
        category: categoryInput.trim(),
      });
  
      if (response.status === 200) {
        const updatedCategory = response.data;
  
        // Set trimmed category in a local state for display in the chip
        setDisplayedCategory(updatedCategory); // new local state
        setIsEditingCategory(false);
        console.log("Category updated successfully:", updatedCategory);
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  useEffect(() => {
    setCategoryInput(cardData?.category || "");
    setSavedCategory(cardData?.category || "");
  }, [cardData]);


  const handleGenerate = async () => {
    setLoading(true);
    const generatedQA = await knowledgeCardApi.handleQuestionAnswers(cardData);
    setQaContent(generatedQA);
    setLoading(false);
    setShowGenerateButton(false);
  };

  const handleGenerateMap = async () => {
    setLoadingKm(true);
    const generatedKm = await knowledgeCardApi.handleKnowledgeMap(cardData);
    console.log("Generated Knowledge Map:", generatedKm); 

    setKmContent(generatedKm);
    setLoadingKm(false);
    setShowGenerateMapButton(false);
  };

  const handleGenerateClick = async () => {
    setLoading(true); 
    const generatedQA = await knowledgeCardApi.handleQuestionAnswers(cardData);
    setQaContent(generatedQA);
    handleTabChange('Q&A');
    setLoading(false); 
  };

  return (
    <>
      <div
        className="relative flex flex-col items-center h-auto min-h-[17rem] max-w-[25rem] shadow-sm shadow-gray-400 cursor-pointer transition-transform transform hover:scale-105 rounded-md bg-white overflow-hidden"
        onClick={toggleExpand}
      >
        <div className="flex flex-col items-start justify-end w-[80%] mt-2 ml-5 self-start">

          {/* Thumbnail */}
          <div className="flex">
            <div
              className="w-10 h-10 border bg-cover bg-center rounded-full mt-2 flex justify-center items-center text-xl"
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

          {/* Title */}
          <div className="border-b border-gray-200 font-black text-md text-emerald-950 leading-snug mt-3 min-h-[3.5rem]">
            {cardData.title}
          </div>

          {/* Summary */}
          <div className=" text-gray-500 text-sm mt-2 min-h-[2.5rem] max-h-[3rem]">
            {stripHtml(cardData?.summary.slice(0, 155) + "...")}
          </div>
        </div>


        {/* Content container */}
        <div className="flex flex-col items-start justify-end w-full px-5 py-2 space-y-1">

               {/* Category Chip */}
              {savedCategory && (
                <Tooltip title="Category" arrow>
                  <div
                    className="absolute bottom-2 left-5 text-sm bg-gray-100 text-black rounded-md pt-0.5 px-2 cursor-pointer max-w-[160px] truncate"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingCategory((prev) => !prev);
                    }}
                  >
                    {displayedCategory
                      .split(" ")
                      .slice(0, 2)
                      .join(" ")}
                  </div>
                </Tooltip>
              )}

              {/* category Editable Box */}
              {isOwner && isEditingCategory && (
                <div className="absolute bottom-12 left-5 bg-white shadow-lg rounded-md p-3 z-50 w-64">
                  <input
                    type="text"
                    className="text-black border border-gray-300 rounded-md px-2 py-1 w-full"
                    value={categoryInput}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") { saveCategory(); setIsEditingCategory(false); }
                    }}
                    onBlur={saveCategory}
                    autoFocus
                  />
                  <div className="mt-2 text-sm text-gray-600">
                    Current: <span className="font-semibold">{displayedCategory}</span>
                  </div>
                </div>
              )}
        </div>
        {/* Date
        <div className="absolute bottom-2 text-gray-500 text-sm flex justify-center items-center ml-8">{formattedDate}</div> */}

        {/* Icons */}

        {/* Favourite Button */}
        {user && user.userId && cardData?.user_id && user.userId === cardData.user_id &&
          <div className="absolute top-3.5 right-8 z-10">
            <Tooltip title={isfavourite ? "Remove from favourites" : "Add to favourites"} arrow>
              <IconButton onClick={(e) => {
                e.stopPropagation();
                onFavouriteClick(cardData)
              }}>
                {isfavourite ? <Favorite className="text-red-500" /> : <FavoriteBorder />}
              </IconButton>
            </Tooltip>
          </div>
              }

        {/* Bookmark Button */}
        {
          cardData?.public && user?.userId !== cardData.user_id && (
            <div className="absolute top-3.5 right-3 z-10">
              <Tooltip title={isBookmarked ? "Remove Bookmark" : "Add Bookmark"} arrow>
                <IconButton onClick={onBookmarkClick}>
                  {isBookmarked ? <BookmarkIcon className="text-emerald-400" /> : <BookmarkBorderIcon />}
                </IconButton>
              </Tooltip>
            </div>
          )
        }


        {/* Card Menu Button */}
        {user && user.userId && cardData?.user_id && user.userId === cardData.user_id &&

          (<div className="absolute top-3.5 right-0 z-10">
            <Tooltip title="Card menu" arrow>
              <IconButton onClick={(e) => {
                e.stopPropagation();
                toggleKcMenu();
              }}>
                <MoreVertIcon style={{ color: 'black' }} />
              </IconButton>
            </Tooltip>
          </div>)
        }
        <div className={`absolute right-2 top-12 bg-[#f1f1f1] text-black shadow-lg rounded-md overflow-hidden text-sm z-50 transition-transform duration-200 ease-in-out ${isKcMenuOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
          <button
            className="block w-full px-4 py-2 hover:bg-emerald-200"
            onClick={(e) => {
              e.stopPropagation();
              onArchiveClick();
              toggleKcMenu();
            }}
          >
            {cardData.archive ? "Unarchive" : "Archive"}
          </button>
          <DeleteDialog cardData={cardData} removeCardFromUI={removeCardFromUI} toggleKcMenu={toggleKcMenu} />
          {/* add s=button for share */}
          <ShareDialog cardData={cardData} toggleKcMenu={toggleKcMenu} />
        </div>

        {/* Like Button */}
        {
          cardData?.public ?
            (
              <div className="absolute bottom-0 right-3 z-10">
                <Tooltip title={likes > 1
                  ? `${likes} Likes`
                  : likes === 1
                    ? `${likes} Like` : `No likes`} arrow>
                  <IconButton onClick={onLikeClick}>
                    {isLiked ? <ThumbUpRoundedIcon className="text-emerald-500" /> : <ThumbUpOutlinedIcon />}
                  </IconButton>
                </Tooltip>
              </div>

            ) : null
        }
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
                <div className="p-4 bg-gray-50 rounded-md text-black font-sans">
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
                        <button className=" border bg-emerald-400 rounded-xl px-3 hover:bg-white text-white hover:text-emerald-400 hover:border border-emerald-800 text-xs" onClick={openAddTag}>Add Tag +</button>
                        {cardData.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-300 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {isAddTagOpen &&
                          <input type="text" />
                        }
                      </div>
                    </>
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