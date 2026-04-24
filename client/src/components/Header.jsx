import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-slate-900">XRISE</span>
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
            Help Desk
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link to="/" className="hover:text-blue-600 transition">
            Home
          </Link>
          <Link to="/submit-ticket" className="hover:text-blue-600 transition">
            Submit Ticket
          </Link>
          <Link to="/check-status" className="hover:text-blue-600 transition">
            Track Ticket
          </Link>
          {user && (
            <Link to="/dashboard" className="hover:text-blue-600 transition">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-slate-500">
                {user.email || user.name}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:opacity-80 transition"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden text-slate-700"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3 text-sm font-medium text-slate-700">
          <Link to="/" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/submit-ticket" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>
            Submit Ticket
          </Link>
          <Link to="/check-status" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>
            Track Ticket
          </Link>
          {user && (
            <Link to="/dashboard" className="block hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              Dashboard
            </Link>
          )}
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <button onClick={handleLogout} className="text-slate-600 hover:text-red-500">
                Logout
              </button>
            ) : (
              <Link to="/login" className="text-blue-600 font-semibold" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
