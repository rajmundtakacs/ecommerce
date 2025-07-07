import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const LoginPage = () => {

    const navigate = useNavigate();

    // States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Error and status
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {

            // 1. Login
            const loginResponse = await fetch('/users/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ email, password }),
            });

            if (!loginResponse.ok) {
                const loginError = await loginResponse.json();
                throw new Error(loginError.error || 'Login unsuccessful');
            }

            // 2. Navigate further
            navigate('/');

        } catch (err) {
            console.error(err);
            setError(err.message);
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

                {error && <p>{error}</p>}

            </form>

            <p>
                Doesn't have an account?
                <Link to="/register" >Register here</Link>
            </p>

        </div>
    );
};

export default LoginPage;