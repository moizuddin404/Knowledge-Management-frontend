import axios from "axios";

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

const handleDownload = async (cardData, fileFormat) => {
  try {
    const res = await axios.get(
      `${backendUrl}/knowledge-card/${cardData.card_id}/download`,
      {
        params: { file_format: fileFormat },
        responseType: "blob",
      }
    );
    return res.data;
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

const handleArchive = async (cardData) => {
  try {
    const res = await axios.put(
      `${backendUrl}/knowledge-card/${cardData.id}/archive`
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

export default {
  handlefavourite,
  handleDownload,
  handleArchive,
  handleDelete,
  handleEdit,
};
