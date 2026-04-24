import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    assignee: "",
    search: ""
  });

  const [agents, setAgents] = useState([]);

  const [searchInput, setSearchInput] = useState("");
  const searchDebounceRef = useRef(null);

  // Create Agent Modal
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [agentForm, setAgentForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  useEffect(() => {
    if (user?.role !== "admin") return;
    api.get("/users/agents").then((res) => setAgents(res.data.data)).catch(() => {});
  }, [user]);

  const fetchTickets = async (signal) => {
    try {
      setLoading(true);
      setError("");

      const params = {
        page,
        limit: 10,
        ...filters
      };

      const res = await api.get("/tickets/dashboard", {
        params,
        signal
      });

      setTickets(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      setError(
        err.response?.data?.message ||
          "Failed to fetch tickets"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchTickets(controller.signal);
    return () => controller.abort();
  }, [page, filters]);

  const handleFilter = (e) => {
    const { name, value } = e.target;

    if (name === "search") {
      setSearchInput(value);
      clearTimeout(searchDebounceRef.current);
      searchDebounceRef.current = setTimeout(() => {
        setPage(1);
        setFilters((prev) => ({ ...prev, search: value }));
      }, 300);
    } else {
      setPage(1);
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleAgentChange = (e) => {
    setAgentForm({
      ...agentForm,
      [e.target.name]: e.target.value
    });
  };

  const createAgent = async (e) => {
    e.preventDefault();

    try {
      setCreating(true);

      await api.post("/users/agents", agentForm);

      toast.success("Agent created");

      setAgentForm({
        name: "",
        email: "",
        password: ""
      });

      setShowModal(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Failed to create agent"
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">
            Ticket Dashboard
          </h1>

          <p className="text-gray-500">
            {user?.email} ({user?.role})
          </p>
        </div>

        <div className="flex gap-3">
          {user?.role === "admin" && (
            <button
              onClick={() => setShowModal(true)}
              className="bg-black text-white px-4 py-2 rounded-lg"
            >
              + New Agent
            </button>
          )}

          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={`bg-white rounded-xl shadow p-4 grid gap-3 mb-6 ${user?.role === "admin" ? "md:grid-cols-2 lg:grid-cols-4" : "md:grid-cols-3"}`}>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilter}
          className="border p-3 rounded"
        >
          <option value="">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">
            In Progress
          </option>
          <option value="closed">Closed</option>
        </select>

        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilter}
          className="border p-3 rounded"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {user?.role === "admin" && (
          <select
            name="assignee"
            value={filters.assignee}
            onChange={handleFilter}
            className="border p-3 rounded"
          >
            <option value="">All Agents</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name} ({agent.email})
              </option>
            ))}
          </select>
        )}

        <input
          name="search"
          placeholder="Search subject/body..."
          value={searchInput}
          onChange={handleFilter}
          className="border p-3 rounded"
        />
      </div>

      {/* States */}
      {loading && (
        <div className="bg-white p-6 rounded-xl shadow">
          Loading tickets...
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl">
          {error}
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="bg-white p-6 rounded-xl shadow">
          No tickets found.
        </div>
      )}

      {/* Ticket List */}
      {!loading && !error && tickets.length > 0 && (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/tickets/${ticket._id}`}
              className="block bg-white rounded-xl shadow p-5 hover:shadow-md transition"
            >
              <div className="flex justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="font-semibold text-lg">
                    {ticket.subject}
                  </h2>

                  <p className="text-gray-500 text-sm">
                    {ticket.ticketId}
                  </p>
                </div>

                <div className="text-sm space-y-1">
                  <p>Status: {ticket.status}</p>
                  <p>
                    Priority: {ticket.priority}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Prev
        </button>

        <span className="px-4 py-2">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="px-4 py-2 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>

      {/* Create Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <form
            onSubmit={createAgent}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">
                Create Agent
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
                className="text-gray-500"
              >
                ✕
              </button>
            </div>

            <input
              name="name"
              placeholder="Full name"
              value={agentForm.name}
              onChange={handleAgentChange}
              className="w-full border p-3 rounded"
              required
            />

            <input
              name="email"
              placeholder="Email"
              value={agentForm.email}
              onChange={handleAgentChange}
              className="w-full border p-3 rounded"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={agentForm.password}
              onChange={handleAgentChange}
              className="w-full border p-3 rounded"
              required
            />

            <button
              disabled={creating}
              className="w-full bg-black text-white p-3 rounded"
            >
              {creating
                ? "Creating..."
                : "Create Agent"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}