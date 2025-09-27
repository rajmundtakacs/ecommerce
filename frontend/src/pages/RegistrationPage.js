import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useSocialAuth } from '../hooks/useSocialAuth';

const RegistrationPage = () => {
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');

  // Status
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const { handleGoogleResponse, handleFacebookLogin } = useSocialAuth({
    navigate,
    setError,
    setLoading,
  });

  const { handleRegister } = useLocalAuth({ navigate, setError, setLoading });
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await handleRegister({ username, email, password });
      const searchParams = new URLSearchParams(location.search);
      const returnTo = searchParams.get('returnTo') || '/';
      navigate(returnTo, { replace: true });
    } catch {
      // hook kezeli az error-t
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white shadow-sm p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Create account</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Join us to start shopping in seconds.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-zinc-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                placeholder="yourname"
                autoComplete="username"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 w-full rounded-xl border-zinc-300 focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 text-white px-4 py-2.5 font-medium hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Creating…' : 'Create account'}
            </button>

            {/* Social */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-2 text-xs uppercase tracking-wide text-zinc-500">
                  or continue with
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div id="googleSignInDiv" className="w-full" />
              <button
                type="button"
                onClick={handleFacebookLogin}
                className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 font-medium text-zinc-700 hover:bg-zinc-50 transition"
              >
                Continue with Facebook
              </button>
            </div>

            <p className="text-sm text-zinc-600 text-center">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default RegistrationPage;
