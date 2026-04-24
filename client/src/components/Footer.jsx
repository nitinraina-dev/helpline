import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-white font-bold text-lg">XRISE</span>
            <span className="text-xs font-medium text-blue-400 bg-blue-900/40 px-2 py-0.5 rounded-md">
              Help Desk
            </span>
          </div>
          <p className="text-sm leading-relaxed">
            Fast, reliable support for every customer query. Submit a ticket and
            track it in real time.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/" className="hover:text-white transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/submit-ticket" className="hover:text-white transition">
                Submit a Ticket
              </Link>
            </li>
            <li>
              <Link to="/check-status" className="hover:text-white transition">
                Track Your Ticket
              </Link>
            </li>
            <li>
              <Link to="/login" className="hover:text-white transition">
                Agent Login
              </Link>
            </li>
          </ul>
        </div>

        {/* Support info */}
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Support</h3>
          <ul className="space-y-2 text-sm">
            <li>Available 24/7</li>
            <li>Tickets reviewed by real agents</li>
            <li>Live status tracking</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        © {new Date().getFullYear()} XRISE Help Desk. All rights reserved.
      </div>
    </footer>
  );
}
