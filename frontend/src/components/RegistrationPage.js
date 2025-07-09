import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const RegistrationPage = () => {

    const navigate = useNavigate();

    // States
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Error and status
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Google SDK init
    useEffect(() => {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                callback: handleGoogleResponse
            });
            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInDiv"),
                { theme: "outline", size: "large" }
            );
        }
    }, []);

    // Facebook SDK init
    useEffect(() => {
        window.fbAsyncInit = function() {
            window.FB.init({
                appId: process.env.REACT_APP_FACEBOOK_APP_ID,
                cookie: true,
                xfbml: true,
                version: 'v18.0'
            });
        };
    }, []);

    // JWT decode helper for Google
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return {};
        }
    };

    // Handle register form submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {

            // 1. Registration
            const registerResponse = await fetch('/auth/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username, email, password }),
            });

            if (!registerResponse.ok) {
                const errorDate = await registerResponse.json();
                throw new Error(errorDate.error || 'Registration unsuccessful');
            }

            // 2. Automatic login
            const loginResponse = await fetch('/auth/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password }),
            });

            if (!loginResponse.ok) {
                const loginError = await loginResponse.json();
                throw new Error(loginError.error || 'Login unsuccessful');
            }

            // 3. Navigate further
            navigate('/');

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Google login
    const handleGoogleResponse = async (response) => {
        setError('');
        setLoading(true);

        try {
            const payload = parseJwt(response.credential);

            const result = await fetch('/auth/google', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    googleId: payload.sub,
                    username: payload.name,
                    email: payload.email
                })
            });

            if (!result.ok) {
                const data = await result.json();
                throw new Error(data.error || 'Google login failed');   
            }

            navigate('/');

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle Facebook login
    const handleFacebookLogin = () => {
        setError('');
        setLoading(true);

        if (!window.FB) {
            setError('Facebook SDK not loaded.');
            setLoading(false);
            return;
        }

        window.FB.login(function(loginRes) {
            if (loginRes.status !== 'connected') {
                setError('Facebook login cancelled or failed.');
                setLoading(false);
                return;
            }

            window.FB.api('/me', { fields: 'id,name' }, async function(profile) {
                if (!profile || profile.error) {
                    setError('Failed to fetch Facebook profile.');
                    setLoading(false);
                    return;
                }

                try {
                    const result = await fetch('/auth/facebook', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            facebookId: profile.id,
                            username: profile.name
                        })
                    });

                    if (!result.ok) {
                        const data = await result.json();
                        throw new Error(data.error || 'Facebook login failed');
                    }

                    navigate('/');
                } catch (err) {
                    console.error(err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            });

        }, { scope: 'public_profile' });
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