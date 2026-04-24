import { useState } from "react";
import api from "../api/client";
import toast from "react-hot-toast";

export default function SubmitTicketPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    body: "",
    priority: "low"
  });

  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [error, setError] = useState("");

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
      setTicketId("");

      const res = await api.post(
        "/public/tickets/submit",
        form
      );

      setTicketId(res.data.ticketId);

      setForm({
        name: "",
        email: "",
        subject: "",
        body: "",
        priority: "low"
      });
      toast.success(`Ticket created: ${res.data.ticketId}`);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit ticket"
      );
      toast.error("Failed to submit ticket");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center px-4 bg-slate-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow p-8 w-full max-w-xl space-y-4"
      >
        <h1 className="text-2xl font-bold">
          Submit Support Ticket
        </h1>

        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Your name"
          className="w-full border p-3 rounded"
        />

        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Your email"
          className="w-full border p-3 rounded"
        />

        <input
          name="subject"
          value={form.subject}
          onChange={handleChange}
          placeholder="Subject"
          className="w-full border p-3 rounded"
        />

        <textarea
          rows="4"
          name="body"
          value={form.body}
          onChange={handleChange}
          placeholder="Describe your issue"
          className="w-full border p-3 rounded"
        />

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        >
          <option value="low">Low</option>
          <option value="medium">
            Medium
          </option>
          <option value="high">High</option>
        </select>

        {error && (
          <p className="text-red-500 text-sm">
            {error}
          </p>
        )}

        {ticketId && (
          <div className="bg-green-50 text-green-700 p-3 rounded">
            Ticket created:{" "}
            <strong>{ticketId}</strong>
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-black text-white p-3 rounded"
        >
          {loading
            ? "Submitting..."
            : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}