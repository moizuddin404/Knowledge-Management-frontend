import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';

function NoUrlModal({ open, handleClose }) {
  // Lock background scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40"></div>

      {/* Modal box */}
      <div
        className="bg-white rounded-xl p-6 w-80 max-w-[90vw] z-[10000] shadow-lg animate-scale-in flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-800">
          No Source URL Available
        </h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Sorry, this file is made using offline file
        </p>
        <button
          onClick={handleClose}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-800 text-white rounded transition"
        >
          Close
        </button>
      </div>
    </div>,
    document.body
  );
}

export default NoUrlModal;
