import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/GoogleButton.css";
import { useAuth } from "../hooks/useAuth";

const SignIn = () => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { login } = useAuth();

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

      navigate('/home');
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
    <div className="flex h-screen w-full bg-white">
      {/* Left Side: Sign-in Form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-6 relative">
        {/* Logo */}
        <div className="absolute top-20 left-1/2 md:left-1/2 transform -translate-x-1/2 md:-translate-x-1/2">
          <img
            src="Brieffy_Logo-withoutbg_zoom.png"
            alt="Brieffy Logo"
            className="h-12 md:h-16 lg:h-20"
          />
        </div>

        {/* Card */}
        <div className="bg-green-100/50 border-2 border-green-200 rounded-3xl shadow-lg p-6 w-full max-w-md mt-40 md:mt-32 lg:mt-36 transition-transform duration-300 hover:scale-105">
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#1a365d]">
              Welcome to Brieffy
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-emerald-600 mt-2">
              Your personal knowledge management system
            </p>
          </div>

          {/* Google Login */}
          <div className="google-button-container flex justify-center mt-6 sm:mr-6">
            <div className="w-52 sm:w-60 md:w-64 flex justify-center items-center">
              <GoogleLogin
                onSuccess={handleSuccess}
                onFailure={handleFailure}
                shape="pill"
                cookiePolicy="single_host_origin"
                isSignedIn={true}
                ux_mode="popup"
                scope="profile email"
                type="standard"
                width={"100%"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Illustration */}
      <div className="hidden md:flex md:w-1/2 h-full xl:w-2/3">
        <img
          src="signInCoverPhoto.jpg"
          alt="Mountains illustration"
          className="object-cover w-full h-full"
        />
      </div>
    </div>
  );
};

export default SignIn;
