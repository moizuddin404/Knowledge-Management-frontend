import axios from "axios";
import { jwtDecode } from "jwt-decode";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const handlefavourite = async (cardData) => {
  try {
    console.log(cardData.card_id);
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/favourite/`
    );
    return res.data;
  } catch (error) {
    console.error("Error updating favourite status:", error);
  }
};

const handleLike = async (cardData, userId) => {
  try {
    console.log(cardData.card_id);
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/like`,
      {},
      {
        params: {
          card_id: cardData.card_id,
          user_id: userId,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error updating Like status:", error);
    console.error("Server response:", error.response?.data);
  }
};

const handleCopy = async (cardData, userId) => {
  try {
    console.log(cardData.card_id);
    const res = await axios.post(
      `${backendUrl}/knowledge-card/${cardData.card_id}/copy-card`,
      {},
      {
        params: {
          card_id: cardData.card_id,
          user_id: userId,
        },
      }
    );
    return res;
  } catch (error) {
    console.error("Error Copying to Home:", error);
    console.error("Server response:", error.response?.data);
  }
};

const handleDownload = async (cardData, fileFormat) => {
  const res = await axios.get(
    `${backendUrl}/knowledge-card/${cardData.card_id}/download`,
    {
      params: { format: fileFormat }, // fix: backend uses `format`, not `file_format`
      responseType: "blob",
      validateStatus: () => true, // allow handling error status manually
    }
  );

  // Check for backend error responses
  const isJson = res.headers["content-type"]?.includes("application/json");
  if (res.status !== 200) {
    let errorMessage = "Download failed";
    if (isJson) {
      const reader = new FileReader();
      return new Promise((_, reject) => {
        reader.onload = () => {
          try {
            const json = JSON.parse(reader.result);
            reject(new Error(json.detail || errorMessage));
          } catch {
            reject(new Error(errorMessage));
          }
        };
        reader.readAsText(res.data);
      });
    }
    throw new Error(errorMessage);
  }

  return res.data;
};

const handleArchive = async (cardData) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/archive`
    );
    return res.data;
  } catch (error) {
    console.error("Error in moving to archive", error);
  }
};

const handleDelete = async (cardData) => {
  try {
    const res = await axios.delete(
      `${backendUrl}/knowledge-card/${cardData.card_id}/delete`,
      {
        params: {
          card_id: cardData.card_id,
          user_id: cardData.user_id,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.log("Couldn't delete card", error);
  }
};

const handleEdit = async (cardData, summaryContent, noteContent) => {
  try {
    const res = await axios.put(`${backendUrl}/knowledge-card/`, {
      card_id: cardData.card_id,
      user_id: cardData.user_id,
      summary: summaryContent,
      note: noteContent,
    });
    return res.data;
  } catch (error) {
    console.error("Error editing card:", error.response?.data || error.message);
  }
};

const handlePublic = async (cardData) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/public`
    );
    return res;
  } catch (error) {
    console.log("Operation failed", error);
  }
};

const handleSharedCard = async (token) => {
  try {
    const res = await axios.get(`${backendUrl}/knowledge-card/shared/${token}`);
    return res.data;
  } catch (error) {
    console.log("Operation failed", error);
  }
};

const handleShareLink = async (cardData) => {
  try {
    const res = await axios.post(
      `${backendUrl}/knowledge-card/${cardData.card_id}/generate-share-link`,
      {}, // Empty body
      {
        params: {
          user_id: cardData.user_id, // Sent as a query parameter
        },
      }
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Error sharing link:", error);
  }
};

const handleBookmark = async (cardData, userId) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/bookmark`,
      null,
      {
        params: { user_id: userId },
      }
    );
    console.log(cardData.card_id);
    // console.log(userId)
    return res;
  } catch (err) {
    console.error("Bookmark failed:", err);
  }
};

const handleQuestionAnswers = async (cardData) => {
  try {
    const res = await axios.post(
      `${backendUrl}/knowledge-card/${cardData.card_id}/generate-qna`,
      {},
      {
        params: {
          user_id: cardData.user_id,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error fetching question answers:", error);
  }
};

const handleKnowledgeMap = async (cardData) => {
  try {
    const res = await axios.get(
      `${backendUrl}/knowledge-card/${cardData.card_id}/knowledge-map`
    );
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.error("Error fetching question answers:", error);
  }
};

const handleAddTag = async (cardData, tag, userId) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.card_id}/add-tag`,
      { tag },
      {
        params: {
          user_id: userId,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error adding tag:", error);
    throw error;
  }
};

const handleRemoveTag = async (cardData, tag, userId) => {
  try {
    const res = await axios.delete(
      `${backendUrl}/knowledge-card/${cardData.card_id}/remove-tag`,
      {
        data: { tag },
        params: {
          user_id: userId,
        },
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error removing tag:", error);
    throw error;
  }
};

const getUserId = async (token) => {
  try {
    const decode = jwtDecode(token);
    return decode.userId;
  } catch (error) {
    console.error("Error fetching user ID:", error);
  }
};

export default {
  handlefavourite,
  handleLike,
  handleDownload,
  handleArchive,
  handleDelete,
  handleEdit,
  handleCopy,
  handlePublic,
  handleShareLink,
  handleSharedCard,
  handleBookmark,
  handleQuestionAnswers,
  handleKnowledgeMap,
  handleAddTag,
  handleRemoveTag,
  getUserId,
};
