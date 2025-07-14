import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLocalAuth } from '../hooks/useLocalAuth';

const HomePage = () => {

  const navigate = useNavigate();

  // Error and status
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { handleLogout } = useLocalAuth({navigate, setError, setLoading});

  return (
    <div>
      <h1>This is the homepage</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  )
};

export default HomePage;