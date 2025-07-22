import { Navigate, useLocation } from 'react-router-dom';
import { useCurrentUser } from '../hooks/useCurrentUser';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useCurrentUser();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    const redirectPath = `/login?returnTo=${location.pathname}`;
    return <Navigate to={redirectPath} replace />;
  }
  

  return children;
};

export default ProtectedRoute;
