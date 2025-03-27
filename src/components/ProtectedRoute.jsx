import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // or a spinner if you have one
    }

    return user ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default ProtectedRoute;
