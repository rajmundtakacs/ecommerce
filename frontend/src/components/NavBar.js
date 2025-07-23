import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLocalAuth } from '../hooks/useLocalAuth';


const Navbar = ({ user }) => {

    const navigate = useNavigate();

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { handleLogout } = useLocalAuth({
        navigate,
        setError,
        setLoading,  
      });

    return (
        <nav>
            <Link to="/">-Home</Link>
            <Link to="/products">-Shop</Link>
            {user ? (
                <>
                <Link to ="/cart">-Cart</Link>
                <Link to ="/orders">-Orders-</Link>
                <button onClick={handleLogout}>Logout</button>
                </>
            ) : (
                <>
                <Link to ="/login">-Login-</Link>
                <Link to ="/register">-Register-</Link>
                </>
            )}
        </nav>
    );
};

export default Navbar;