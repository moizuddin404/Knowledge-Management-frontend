import React, { useState, useEffect } from "react";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import "../css/scrollbar.css";

const Chatbot = ({ cardId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const storageKey = `chatbot-messages-${cardId}`;

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

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, from: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

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
            className={`flex ${
              msg.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.from === "user"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-300 text-gray-900"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-4">
        <input
          type="text"
          className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type your message..."
        />
        <button
          onClick={sendMessage}
          className="p-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
        >
          <SendIcon fontSize="small" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
