import { type ReactNode } from 'react'
import { useAuth } from './hooks/useAuth';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
    const {
        currentUser,
        loading
    } = useAuth();
    if (loading) {
        return <div className="flex items-center justify-center h-screen">
            Loading...
        </div>;
    }
    if (!currentUser) {
        return <Navigate to="/login" />;
    }
    return children;
};

export default ProtectedRoute