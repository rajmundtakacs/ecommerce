import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useSocialAuth } from '../hooks/useSocialAuth';


const LoginPage = () => {

    // States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Error and status
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const returnTo = searchParams.get('returnTo') || '/';

    const { handleGoogleResponse, handleFacebookLogin } = useSocialAuth({
        navigate,
        setError,
        setLoading,
        returnTo
    });

    
    const { handleLogin } = useLocalAuth({ navigate, setError, setLoading });

    

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        setError('');
        setLoading(true);

        
      
        try {
          await handleLogin({ email, password });
      
          navigate(returnTo, { replace: true });
        } catch {
          // error already handled in hook
        } finally {
          setLoading(false);
        }
      };
      

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                
                <div>
                    <label>Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange= {(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange= {(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? 'Sending...' : 'Login'}
                </button>

                <div>
                    <div id="googleSignInDiv"></div>
                    <button type="button" onClick={handleFacebookLogin}>Continue with Facebook</button>
                </div>

                

                {error && <p>{error}</p>}

                <p>
                Doesn't have an account?
                <Link to="/register" >Register here</Link>
                </p>

            </form>

            

        </div>
    );
};

export default LoginPage;