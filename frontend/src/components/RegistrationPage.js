import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useSocialAuth } from '../hooks/useSocialAuth';


const RegistrationPage = () => {

    const navigate = useNavigate();

    // States
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Error and status
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { handleGoogleResponse, handleFacebookLogin } = useSocialAuth({
        navigate,
        setError,
        setLoading
    });

    // Handle register form submit
    const { handleRegister } = useLocalAuth({ navigate, setError, setLoading });

    const handleSubmit = (e) => {
        e.preventDefault();
        handleRegister({ username, email, password });
    };
    

    return (
        <div>
            <h2>Registration</h2>
            <form onSubmit={handleSubmit}>
                
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange= {(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

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
                    {loading ? 'Sending...' : 'Registration'}
                </button>

                <div>
                    <div id="googleSignInDiv"></div>
                    <button type="button" onClick={handleFacebookLogin}>Continue with Facebook</button>
                </div>

                {error && <p>{error}</p>}

            </form>

            <p>
                Already have an account?
                <Link to="/login" >Sign in here</Link>
            </p>

        </div>
    );
};

export default RegistrationPage;