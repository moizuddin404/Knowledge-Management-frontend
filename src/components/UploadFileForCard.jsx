import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import CancelIcon from "@mui/icons-material/Cancel";
import { Button, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import 'react-toastify/dist/ReactToastify.css';

const UploadFileForCard = ({ onSave, handleStartSaving, handleSaved }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [file, setFile] = useState(null);
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSave = async () => {
        if (!file) return toast.error("Please select a file!");

        setIsOpen(false)
        setIsLoading(true);
        handleStartSaving();

        try {
            const token = localStorage.getItem("token");

            const formData = new FormData();
            formData.append("token", token);
            formData.append("file", file);
            formData.append("note", note);

            const response = await axios.post(`${backendUrl}/knowledge-card/upload-file`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 120000,
            });

            toast.success("Card uploaded from file!");
            handleSaved();
            onSave?.(response.data);
            setFile(null);
            setNote("");
            setIsOpen(false);
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Upload failed!");
        } finally {
            setIsLoading(false);
        }
    };

    const resetFields = () => {
        setFile(null);
        setNote("");
    };

    return (
        <>
            <Button
                variant="contained"
                startIcon={<CloudUploadIcon />}
                onClick={() => setIsOpen(true)}
                sx={{
                    backgroundColor: '#1f7281',
                    '&:hover': {
                    backgroundColor: '#065f46', // emerald-800
                    },
                    textTransform: 'none',
                    height: 40,
                    px: 2,
                    color: 'white',
                }}
                >
                Upload File
                </Button>

            {isOpen && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex items-center justify-center z-[999] px-4">
                    <div
                        className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Upload files</h2>
                                <p className="text-sm text-gray-500">Select and upload the file of your choice</p>
                            </div>
                            <IconButton onClick={() => setIsOpen(false)} className="!mt-[-0.5rem]">
                                <CancelIcon />
                            </IconButton>
                        </div>

                        {/* File Upload */}
                        <div
                            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition"
                            onClick={() => document.getElementById("fileInput").click()}
                        >
                            <input
                                type="file"
                                accept=".pdf,.docx"
                                id="fileInput"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                            <div className="flex flex-col items-center gap-2">
                                <UploadFileIcon className="text-5xl text-[#1f7281]" />
                                <p className="text-gray-700 font-medium">Choose a file to Upload</p>
                                <p className="text-sm text-gray-500">PDF, DOCX format, up to 50MB</p>
                                <button
                                    className="mt-3 px-4 py-2 bg-[#1f7281] text-white rounded-md hover:bg-[#16616f] active:scale-95 transition-transform duration-150"
                                >
                                    Browse File
                                </button>
                            </div>
                            {file && (
                                <p className="mt-3 text-sm text-green-600 font-medium">
                                    Selected: {file.name}
                                </p>
                            )}
                        </div>

                        {/* Note */}
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Add a note (optional)"
                            rows={1}
                            className="w-full resize-none overflow-hidden mt-4 p-2 text-sm text-gray-700 border rounded-md focus:outline-none focus:ring-1 focus:ring-[#1f7281] transition"
                            onInput={(e) => {
                                e.target.style.height = "auto";
                                e.target.style.height = e.target.scrollHeight + "px";
                            }}
                        />

                        {/* Buttons */}
                        <div className="mt-6 flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    resetFields();
                                    setIsOpen(false);
                                }}
                                disabled={isLoading}
                                className="w-24 h-10 bg-red-600 text-white rounded hover:bg-red-800 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading || !file}
                                className="w-24 h-10 bg-[#1f7281] text-white rounded hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {isLoading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default UploadFileForCard;
