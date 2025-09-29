import { useEffect } from 'react';

export const useSocialAuth = ({ navigate, setError, setLoading, returnTo }) => {

    // Parse JWT (Google)
    const parseJwt = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return {};
        }
    };

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
    
        if (window.FB) {
            window.fbAsyncInit();
        }
    }, []);
    

    // Handle Google login
    const handleGoogleResponse = async (response) => {
        setError('');
        setLoading(true);

        try {
            const payload = parseJwt(response.credential);

            const result = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
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

            navigate(returnTo, { replace: true });

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
                    const result = await fetch(`${process.env.REACT_APP_API_URL}/auth/facebook`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            facebookId: profile.id,
                            username: profile.name
                        })
                    });

                    if (!result.ok) {
                        const data = await result.json();
                        throw new Error(data.error || 'Facebook login failed');
                    }

                    navigate(returnTo, { replace: true });
                    
                } catch (err) {
                    console.error(err);
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            });

        }, { scope: 'public_profile' });
    };

    return { handleGoogleResponse, handleFacebookLogin };
};


