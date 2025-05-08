import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import knowledgeCardApi from "../services/KnowledgeCardService";
import LaunchIcon from '@mui/icons-material/Launch';
import { IconButton, Tooltip } from '@mui/material';

const QnAItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className=" p-4 bg-gray-50 rounded-md shadow-sm text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-row justify-between font-semibold text-black-700 mb-1 w-full gap-2"
      >
        <span className="text-left">Q: {item.question}</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && <p className="text-gray-800 mt-2">A: {item.answer}</p>}
    </div>
  );
};

const KnowledgeItem = ({ item }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left font-semibold text-black-700 flex justify-between"
      >
        <span>{item.topic}</span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="mt-2 text-sm text-gray-700">
          <p>{item.description}</p>
          <p className="text-xs text-gray-500 mt-1">{item.difficulty}</p>
        </div>
      )}
    </div>
  );
};

const SharedKnowledgeCard = () => {
  const { token } = useParams(); // token from URL
  const [tabIndex, setTabIndex] = useState(1);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [summaryContent, setSummaryContent] = useState("");
  const [qnaContent, setQnaContent] = useState("");
  const [kmContent, setKmContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const data = await knowledgeCardApi.handleSharedCard(token);
        setTitle(data.title || "No Title Yet...");
        setCategory(data.category || "No Category Yet...");
        setNoteContent(data.note || "No Note Yet...");
        setSummaryContent(data.summary || "No Summary Yet...");
        setQnaContent(Array.isArray(data.qna) ? data.qna : []);
        setKmContent(Array.isArray(data.knowledge_map) ? data.knowledge_map : []);
        setSourceUrl(data.source_url);
        setTags(data.tags || []);
      } catch (err) {
        setError("Failed to load shared card.");
        console.error("Error fetching shared card data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [token]);

  if (loading) return <div className="p-4 text-center"><CircularProgress /></div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg border border-gray-200 text-black">
      {/* Title and Source Link */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        {sourceUrl && (
          <Tooltip title="Go to Source">
            <IconButton
              onClick={() => window.open(sourceUrl, "_blank", "noopener,noreferrer")}
              color="primary"
              size="small"
            >
              <LaunchIcon />
            </IconButton>
          </Tooltip>
        )
        }
      </div>
      {Array.isArray(category) && category.length > 0 && (
        <div className="mt-6 mb-4 flex flex-wrap gap-2">
          {category.map((cat, idx) => (
            <span
              key={idx}
              className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm"
            >
              {cat}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabIndicatorProps={{
            style: { backgroundColor: "#10B981", transition: "none" }, // emerald-500
          }}
          sx={{
            "& .MuiTab-root": {
              color: "#6B7280", // gray-500 (inactive tab)
              "&.Mui-selected": {
                color: "#10B981", // emerald-500 (active tab)
              },
            },
            overflowX: "hidden",
          }}
        >
          <Tab label="Note" />
          <Tab label="Summary" />
          {qnaContent.length > 0 && <Tab label="Q&A" />}
          {kmContent.length > 0 && <Tab label="Knowledge Map" />}
        </Tabs>
      </Box>

      {/* Tab Content */}
      {/* Tab Content with Typography styles */}
      <div className="mt-4 text-gray-800 leading-relaxed prose max-w-none font-sans">
        {tabIndex === 0 && (
          <div dangerouslySetInnerHTML={{ __html: noteContent }} />
        )}
        {tabIndex === 1 && (
          <div dangerouslySetInnerHTML={{ __html: summaryContent }} />
        )}
        {tabIndex === 2 && qnaContent.length > 0 && (
          <div className="space-y-4">
            {qnaContent.map((item, index) => (
              <QnAItem key={index} item={item} />
            ))}
          </div>
        )}

        {tabIndex === 3 && Array.isArray(kmContent) && kmContent.length > 0 && (
          <div className="space-y-6">
            {kmContent.map((section, i) => (
              <div key={i}>
                <h2 className="text-lg font-semibold mb-2">{section.section}</h2>
                <div className="space-y-3">
                  {section.items.map((item, j) => (
                    <KnowledgeItem key={j} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {tags?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-gray-300 rounded-full text-xs text-gray-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

    </div>
  );
};

export default SharedKnowledgeCard;
