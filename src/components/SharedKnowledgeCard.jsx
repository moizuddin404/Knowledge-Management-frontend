import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab, CircularProgress } from "@mui/material";
import { useParams } from "react-router-dom";
import knowledgeCardApi from "../services/KnowledgeCardService";
import LaunchIcon from '@mui/icons-material/Launch';
import { IconButton, Tooltip } from '@mui/material';


const SharedKnowledgeCard = () => {
  const { token } = useParams(); // token from URL
  const [tabIndex, setTabIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [summaryContent, setSummaryContent] = useState("");
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
        setSourceUrl(data.source_url || "No Source URL Yet...");
        setTags(data.tags || []);
      } catch (err) {
        setError("Failed to load shared card.");
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
        )}
      </div>
      {category && (
    <div className="mt-6 mb-4">
        <span className="inline-block bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full shadow-sm pb-1">
        {category}
        </span>
    </div>
    )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", bgcolor: "background.paper" }}>
      <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="scrollable" 
          scrollButtons="auto"
          allowScrollButtonsMobile
          TabIndicatorProps={{ style: { transition: 'none' } }}
          sx={{ overflowX: "hidden" }}
        >
          <Tab
      label="Note"
      sx={{
        minWidth: 120,
        maxWidth: 120,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}
    />
          <Tab
      label="Summary"
      sx={{
        minWidth: 120,
        maxWidth: 120,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
      }}
    />
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
