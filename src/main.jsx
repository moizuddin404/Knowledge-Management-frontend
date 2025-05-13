import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#10B981', // Emerald green
    },
    secondary: {
      main: '#047857', // Darker emerald
    },
  },
});

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

ReactDOM.createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider clientId={clientId}>
    <ThemeProvider theme={theme}>
    
      <App />
    
    </ThemeProvider>
  </GoogleOAuthProvider>
);
