import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="max-w-5xl w-full grid md:grid-cols-2 gap-8 items-center">
        {/* Left Content */}
        <div>
          <p className="text-sm font-semibold text-blue-600 mb-3">
            XRISE HELP DESK
          </p>

          <h1 className="text-4xl md:text-5xl font-bold leading-tight text-slate-900">
            Fast Support For Every Customer Query
          </h1>

          <p className="text-slate-600 mt-5 text-lg leading-relaxed">
            Submit a new support request or track an
            existing ticket instantly. Our team reviews
            every issue and responds quickly.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/submit-ticket"
              className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition"
            >
              Create Ticket
            </Link>

            <Link
              to="/check-status"
              className="bg-white border px-6 py-3 rounded-xl font-medium hover:bg-slate-100 transition"
            >
              Track Ticket
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold">
                24/7
              </p>
              <p className="text-sm text-slate-500">
                Support Queue
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold">
                Fast
              </p>
              <p className="text-sm text-slate-500">
                Response Flow
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <p className="text-2xl font-bold">
                Live
              </p>
              <p className="text-sm text-slate-500">
                Status Tracking
              </p>
            </div>
          </div>
        </div>

        {/* Right Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6">
            Need Help Today?
          </h2>

          <div className="space-y-4">
            <div className="border rounded-xl p-4">
              <p className="font-semibold">
                Create a Ticket
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Describe your issue and receive a
                ticket ID instantly.
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="font-semibold">
                Track Progress
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Use your ticket ID and email to check
                updates anytime.
              </p>
            </div>

            <div className="border rounded-xl p-4">
              <p className="font-semibold">
                Receive Resolution
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Our agents review, respond, and close
                your request efficiently.
              </p>
            </div>
          </div>

          <Link
            to="/submit-ticket"
            className="block text-center mt-6 bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}