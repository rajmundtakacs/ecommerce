import { Navigate, useLocation } from 'react-router-dom';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useSocialAuth } from '../hooks/useSocialAuth';

const ProtectedRoute = ({ children }) => {
  const { user: localUser } = useLocalAuth();
  const { user: socialUser } = useSocialAuth();
  const location = useLocation();

  const user = localUser || socialUser;

  if (!user) {
    return <Navigate to={`/login?returnTo=${location.pathname}`} replace />;
  }

  return children;
};

export default ProtectedRoute;
