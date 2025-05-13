import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn"
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import Suites from "./pages/Suites";
import SharedKnowledgeCard from "./components/SharedKnowledgeCard";
import SharedCard from "./pages/SharedCard";
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <AuthProvider>
    <Router>
      {/* Toast Notification */}
      <Toaster position="top-center" reverseOrder={false}/>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" />} />
        <Route path="/sign-in" element={<SignIn />}/>
        
        {/* Public route - shared link visible without login */}
        <Route path="/knowledge-card/shared/:token" element={<SharedKnowledgeCard />} />

        {/* Protected Routes - login required */}
        <Route element={<ProtectedRoute/>}>
          <Route path="/home" element={<Home />} />
          <Route path="/suites" element={<Suites />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;
