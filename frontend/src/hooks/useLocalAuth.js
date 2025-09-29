export const useLocalAuth = ({ navigate, setUser, setError, setLoading }) => {

    // Handle register
    const handleRegister = async ({ username, email, password }) => {
        setError('');
        setLoading(true);

        try {
            // 1. Registration
            const registerResponse = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ username, email, password }),
            });

            if (!registerResponse.ok) {
                const errorData = await registerResponse.json();
                throw new Error(errorData.error || 'Registration unsuccessful');
            }

            // 2. Auto-login
            const loginResponse = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (!loginResponse.ok) {
                const loginError = await loginResponse.json();
                throw new Error(loginError.error || 'Login unsuccessful');
            }

            return true;

        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Handle login
    const handleLogin = async ({ email, password }) => {
        setError('');
        setLoading(true);

        try {
            const loginResponse = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include',
                body: JSON.stringify({ email, password }),
            });

            if (!loginResponse.ok) {
                const loginError = await loginResponse.json();
                throw new Error(loginError.error || 'Login unsuccessful');
            }

            return true;

        } catch (err) {
            console.error(err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            setLoading(true);
            setError('');

            await fetch(`${process.env.REACT_APP_API_URL}/auth/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
            setError('Logout failed, please try again.');
        } finally {
            setLoading(false);
        }
    };

    return { handleRegister, handleLogin, handleLogout };
};
