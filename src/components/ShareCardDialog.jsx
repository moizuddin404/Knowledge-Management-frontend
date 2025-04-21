import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import knowledgeCardApi from '../services/KnowledgeCardService';
import ReactDOM from 'react-dom';

function ShareDialog({ cardData, toggleKcMenu }) {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState('');

  // Function to open the share dialog
  const openShareDialog = (e) => {
    e.stopPropagation();
    // Close the more menu
    toggleKcMenu();
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeModal}></div>
        <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw] z-[10000] relative">
          <h2 className="text-xl font-semibold mb-4">Share Card</h2>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-10 h-10 border-4 border-t-4 border-blue-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="mb-6">
              <p className="mb-2">Share link:</p>
              <input
                type="text"
                value={link}
                readOnly
                className="w-full p-3 border rounded mb-2 bg-gray-50 font-mono text-sm"
                onClick={(e) => e.target.select()}
              />
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
            >
              Close
            </button>
            <button
              onClick={copyLink}
              disabled={!link || loading}
              className={`px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
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

  return (
    <>
      {/* Share button */}
      <button
        className="block w-full px-4 py-2 text-left hover:bg-emerald-200"
        onClick={openShareDialog}
      >
        Share
      </button>
      
      {/* Modal rendered using portal */}
      <Modal />
    </>
  );
}

export default ShareDialog;