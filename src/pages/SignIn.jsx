import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/SignIn.css";
import { useAuth } from "../hooks/useAuth";


const SignIn = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { login } = useAuth()

  const handleSuccess = async (response) => {
    try {
      const { credential } = response;
      const decoded = jwtDecode(credential);
      const userData = {
          name: decoded.name,
          email: decoded.email,
          picture: decoded.picture,
      };
      

      const res = await axios.post(`${backendUrl}/api/auth/google`, userData);
      if (res.data && res.data.token) {
          login(res.data.token);
      }

      // Redirecting to Home after Logging in 
      navigate('/home')
    } catch (error) {
      console.error("Login failed", error);
      alert("Login failed");
    }
  };

  const handleFailure = (error) => {
    console.error("Google Sign-In failed:", error);
    alert("Sign in failed");
  };

  return (
    <div className="signin-container">
      {/* Left side - Login form */}
      <div className="signin-form">
        <div className="signin-content">
          {/* Logo */}
          <div className="logo">
            <img src="Brieffy_Logo-withoutbg_zoom.png" alt="Brieffy Logo" />
          </div>
          <div className="card-container">
          {/* Sign-in content */}
          <div className="welcome-text">
            <h1>Welcome to Brieffy</h1>
            <p>Your personal knowledge management system</p>
          </div>
          
          {/* Google sign-in button */}
          <div className="google-button-container">
            {/* Actual GoogleLogin component (hidden but functional) */}
            <div>
      
      <GoogleLogin 
        onSuccess={handleSuccess} 
        onFailure={handleFailure} 
        shape="pill"
        cookiePolicy={"single_host_origin"} 
        isSignedIn = {true}
        ux_mode="popup"
        scope="profile email"
      />
    </div>
          </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Illustration */}
      <div className="signin-illustration">
        {/* This is where you'll place your mountain image */}
        <img src="signInCoverPhoto.jpg" alt="Mountains illustration" className="mountains-image" />
      </div>
    </div>
  );
};

export default SignIn;