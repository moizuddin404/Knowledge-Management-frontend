import React, { useState, useEffect } from 'react';
import '../css/AddKnowledgeCard.css';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  EditorState,
  convertToRaw,
  ContentState
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const AddKnowledgeCard = ({ onSave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [link, setLink] = useState('');
  const [note, setNote] = useState('');
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [isLoading, setIsLoading] = useState(false);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setNote(html);
  }, [editorState]);

  useEffect(() => {
    if (note) {
      const blocksFromHtml = htmlToDraft(note);
      if (blocksFromHtml) {
        const { contentBlocks, entityMap } = blocksFromHtml;
        const contentState = ContentState.createFromBlockArray(contentBlocks, entityMap);
        const newEditorState = EditorState.createWithContent(contentState);
        setEditorState(newEditorState);
      }
    }
  }, [isOpen]); // Load only when opened

  const handleSave = async () => {
    if (!link) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        token: token,
        source_url: link,
        note: note || "",
      };

      const response = await axios.post(`${backendUrl}/knowledge-card/`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 60000,
      });

      if (onSave) {
        onSave(response.data);
      }

      toast.success("Card Added");

      setLink("");
      setNote("");
      setEditorState(EditorState.createEmpty());
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving knowledge card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <button
          className='w-24 h-10 bg-[#1f7281] text-white rounded hover:bg-emerald-700 transition'
          onClick={() => setIsOpen(!isOpen)}
        >
          Add Card
        </button>
      </div>

      {isOpen &&
        <div className='fixed top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center z-[999]' onClick={() => setIsOpen(false)}>
          <div className="w-[50%] h-[60%] p-6 border rounded-md bg-white shadow-md" onClick={(e) => e.stopPropagation()}>
            {isLoading && <div className="loading-overlay">Saving... Please wait</div>}

            {/* Link Input */}
            <div className="flex justify-center input-container mb-4">
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Enter Link: https://example.com/article"
                className="w-full p-3 rounded-md text-center bg-gray-400/10 text-black placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 border-2 border-gray-300"
              />
            </div>

            {/* Inline Rich Text Editor */}
            <div className="input-container text-black border-1 h-70 p-2.5 mb-4">
              <Editor
                editorState={editorState}
                onEditorStateChange={setEditorState}
                toolbarClassName="sticky top-0 z-10 bg-white border-b border-gray-200"
                wrapperClassName="w-full h-full"
                editorClassName="p-2 border border-gray-300 overflow-y-auto min-h-46 max-h-46"
              />
            </div>

            {/* Save Button */}
            <div className="mb-4 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isLoading || !link}
                className="relative bottom-3 w-20 h-10 bg-[#1f7281] text-white rounded hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      }
      {/* Toast Notification */}
      <ToastContainer />
    </>
  );
};

export default AddKnowledgeCard;
