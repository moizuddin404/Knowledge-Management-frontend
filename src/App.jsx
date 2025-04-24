import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import SignIn from "./pages/SignIn"
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthProvider";
import Suites from "./pages/Suites";
import SharedKnowledgeCard from "./components/SharedKnowledgeCard";
import SharedCard from "./pages/SharedCard";

const App = () => {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/sign-in" />} />
        <Route path="/sign-in" element={<SignIn />}/>
        
        {/* Public route - shared link visible without login */}
        <Route path="/knowledge-card/shared/:token" element={<SharedKnowledgeCard />} />

        {/* Protected Routes - login required */}
        <Route element={<ProtectedRoute/>}>
          <Route path="/home" element={<Home />} />
          <Route path="/suites" element={<Suites />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;
