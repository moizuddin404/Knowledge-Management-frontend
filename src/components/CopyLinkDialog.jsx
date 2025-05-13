import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import knowledgeCardApi from '../services/KnowledgeCardService';
import ReactDOM from 'react-dom';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import { IconButton } from '@mui/material';

function CopyLinkDialog({ cardData }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');

  // Function to open the share dialog
  const openShareDialog = (e) => {
    e.stopPropagation();
    // Show modal
    setShowModal(true);
    // Fetch the share link
    fetchShareLink();
  };

  // Function to fetch the share link
  const fetchShareLink = async () => {
    setLoading(true);
    try {
      const res = await knowledgeCardApi.handleShareLink(cardData);
      setLink(res.share_url);
    } catch (error) {
      toast.error("Failed to get share link");
      console.error("Error fetching share link:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to close the modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Function to copy the link
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
      console.error("Clipboard error:", error);
    }
  };

  // Create the modal component
  const Modal = () => {
    if (!showModal) return null;
  
    return ReactDOM.createPortal(
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        // Prevent click-throughs completely
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop – won't close modal on click */}
        <div className="fixed inset-0 bg-black/40"></div>
  
        {/* Modal box */}
        <div
          className="bg-white rounded-xl p-6 w-96 max-w-[90vw] z-[10000] shadow-lg animate-scale-in"
          onClick={(e) => e.stopPropagation()} // prevent bubbling inside modal
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Share Knowledge with everyone!</h2>
  
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="mb-6 text-md text-gray-700">{`Title: ${cardData.title}`}</p>
              <p className="mb-2 text-sm text-gray-700">Share link:</p>
              <input
                type="text"
                value={link}
                readOnly
                className="w-full p-3 text-black border rounded bg-gray-50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={(e) => e.target.select()}
              />
            </div>
          )}
  
          <div className="flex justify-end gap-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            >
              Close
            </button>
            <button
              onClick={copyLink}
              disabled={!link || loading}
              className={`px-4 py-2 bg-[#1f7281] text-white rounded hover:bg-[#065f46] transition ${
                (!link || loading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };
  
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  
    return () => {
      document.body.style.overflow = 'auto'; // reset just in case
    };
  }, [showModal]);
  
  return (
    <>
      {/* Share button */}
      <IconButton onClick={openShareDialog}>
        <LinkRoundedIcon className='rotate-135' style={{ color: "black" }} />
      </IconButton>
      
      {/* Modal rendered using portal */}
      <Modal />
    </>
  );
}

export default CopyLinkDialog;