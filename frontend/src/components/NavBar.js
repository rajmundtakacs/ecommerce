import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Navbar = ({ cartCount = 0 }) => {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? 'text-indigo-600 bg-indigo-50'
        : 'text-zinc-600 hover:text-indigo-600 hover:bg-zinc-50'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-lg font-semibold text-indigo-600">
            PERN Shop
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            <NavLink to="/products" className={linkClass}>Shop</NavLink>
            <NavLink to="/cart" className={linkClass}>
              Cart
              {cartCount > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/orders" className={linkClass}>Orders</NavLink>
            <NavLink to="/login" className={linkClass}>Login</NavLink>
            <NavLink to="/register" className={linkClass}>Register</NavLink>
          </nav>

          {/* Mobile button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-zinc-600 hover:bg-zinc-100"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/products" className={linkClass} onClick={() => setOpen(false)}>Shop</NavLink>
            <NavLink to="/cart" className={linkClass} onClick={() => setOpen(false)}>
              Cart
              {cartCount > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-600 text-white">
                  {cartCount}
                </span>
              )}
            </NavLink>
            <NavLink to="/orders" className={linkClass} onClick={() => setOpen(false)}>Orders</NavLink>
            <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>Login</NavLink>
            <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>Register</NavLink>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
