import React, { useState, useEffect, useRef } from "react";
import { Send, AddCircleOutlineRounded } from "@mui/icons-material";
import axios from "axios";
import "../css/scrollbar.css";
import { Tooltip } from "@mui/material";

const Chatbot = ({ cardId, noteContent, setNoteContent, addToNote }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const storageKey = `chatbot-messages-${cardId}`;
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Load messages from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setMessages(JSON.parse(saved));
    }
  }, [cardId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages));
  }, [messages, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, from: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"; // reset height
      }

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const response = await axios.post(`${backendUrl}/knowledge-card/chatbot/`, {
        card_id: cardId,
        message: input,
      });

      const botMessage = { text: response.data, from: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="flex flex-col h-[420px] max-w-3xl mx-auto p-2 pb-0">
      <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-100 rounded-lg shadow-inner scrollable-chat">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className="flex items-start max-w-[75%]">
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.from === "user"
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-300 text-gray-900"
                }`}
              >
                {msg.text}
              </div>

              {/* Show Save button only for bot messages */}
              {msg.from === "bot" && (
              <Tooltip title="Add to your notes" placement="top">
                <button
                  onClick={async () => {
                    const updatedNote =
                      noteContent === "No Note Yet..."
                        ? msg.text
                        : `${noteContent}\n\n${msg.text}`;
                    setNoteContent(updatedNote);
                    await addToNote(); // Save to backend
                  }}
                  className="ml-2 mt-1 self-end text-sm text-emerald-600 hover:text-emerald-800"
                >
                  <AddCircleOutlineRounded />
                </button>
              </Tooltip>
            )}
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      <div className="flex items-start gap-2 mt-4">
        <textarea
          ref={textareaRef}
          rows={1}
          className="flex-1 px-4 py-2 border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 overflow-hidden"
          style={{ maxHeight: '8rem' }} // Limit the max height
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            e.target.style.height = 'auto'; // Reset height
            e.target.style.height = `${e.target.scrollHeight}px`; // Adjust to content
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault(); // Prevent newline
              sendMessage();
            }
          }}
          maxLength={250}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 self-end"
        >
          <Send fontSize="small" />
        </button>
      </div>

      <div className="text-sm text-gray-500 ml-2 mt-1">{input.length}/250 characters</div>

    </div>
  );
};

export default Chatbot;
