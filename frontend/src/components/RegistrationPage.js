import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';


const RegistrationPage = () => {

    const navigate = useNavigate();

    // States
    const [name, setName] = useState('');
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

            // 1. Registration
            const registerResponse = await fetch('/users/register', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ name, email, password }),
            });

            if (!registerResponse.ok) {
                const errorDate = await registerResponse.json();
                throw new Error(errorDate.error || 'Registration unsuccessful');
            }

            // 2. Automatic login
            const loginResponse = await fetch('/users/login', {
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

    return (
        <div>
            <h2>Registration</h2>
            <form onSubmit={handleSubmit}>
                
                <div>
                    <label>Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange= {(e) => setName(e.target.value)}
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