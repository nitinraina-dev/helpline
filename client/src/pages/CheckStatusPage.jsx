import { useState } from "react";
import api from "../api/client";
import toast from "react-hot-toast";

export default function CheckStatusPage() {
  const [form, setForm] = useState({
    ticketId: "",
    email: ""
  });

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setData(null);

      const res = await api.post(
        "/public/tickets/status",
        form
      );

      setData(res.data.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Ticket not found"
      );
      toast.error("Ticket not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-8 w-full max-w-lg space-y-4"
      >
        <h1 className="text-2xl font-bold">
          Check Ticket Status
        </h1>

        <input
          name="ticketId"
          value={form.ticketId}
          onChange={handleChange}
          placeholder="Ticket ID"
          className="w-full border p-3 rounded"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Your email"
          className="w-full border p-3 rounded"
        />

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        <button
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading
            ? "Checking..."
            : "Check Status"}
        </button>

        {data && (
          <div className="bg-slate-50 rounded p-4 mt-4 space-y-2">
            <p>
              <strong>Status:</strong>{" "}
              {data.status}
            </p>

            <p>
              <strong>Priority:</strong>{" "}
              {data.priority}
            </p>

            <p>
              <strong>Latest Reply:</strong>{" "}
              {data.latestReply || "No reply yet"}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}