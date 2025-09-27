import React, { useState } from 'react';
import { useNavigate, Link, NavLink } from 'react-router-dom';
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

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive
        ? 'text-brand-600 bg-brand-50'
        : 'text-zinc-600 hover:text-brand-600 hover:bg-zinc-50'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-lg font-semibold text-brand-600">
            PERN Shop
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-4">
            <NavLink to="/" className={linkClass}>
              Home
            </NavLink>
            <NavLink to="/products" className={linkClass}>
              Shop
            </NavLink>
            {user ? (
              <>
                <NavLink to="/cart" className={linkClass}>
                  Cart
                </NavLink>
                <NavLink to="/orders" className={linkClass}>
                  Orders
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-red-500 hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass}>
                  Login
                </NavLink>
                <NavLink to="/register" className={linkClass}>
                  Register
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;