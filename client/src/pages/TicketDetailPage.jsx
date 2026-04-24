import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const [ticket, setTicket] = useState(null);
  const [timeline, setTimeline] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reply, setReply] = useState("");
  const [status, setStatus] = useState("");

  const [assigneeId, setAssigneeId] = useState("");
  const [agentSearch, setAgentSearch] = useState("");
  const [agentResults, setAgentResults] = useState([]);
  const [selectedAgent, setSelectedAgent] =
    useState(null);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/tickets/${id}`);

      setTicket(res.data.data.ticket);
      setTimeline(res.data.data.timeline);
      setStatus(res.data.data.ticket.status);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to load ticket"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const handleReply = async () => {
    if (!reply.trim()) return;

    const message = reply.trim();
    const prevTimeline = timeline;
    const prevReply = reply;

    // Optimistic: append to timeline immediately
    setTimeline((prev) => [
      ...prev,
      {
        _id: `optimistic-${Date.now()}`,
        type: "reply",
        message,
        actor: user.email,
        createdAt: new Date().toISOString(),
      },
    ]);
    setReply("");

    try {
      await api.post(`/tickets/${id}/reply`, { message });
      toast.success("Reply sent");
      fetchTicket();
    } catch (err) {
      setTimeline(prevTimeline);
      setReply(prevReply);
      toast.error("Failed to send reply");
    }
  };

  const handleStatus = async () => {
    const prevStatus = ticket.status;
    const newStatus = status;

    // Optimistic: update badge immediately
    setTicket((prev) => ({ ...prev, status: newStatus }));

    try {
      await api.patch(`/tickets/${id}/status`, { status: newStatus });
      toast.success("Status updated");
      fetchTicket();
    } catch (err) {
      setTicket((prev) => ({ ...prev, status: prevStatus }));
      setStatus(prevStatus);
      toast.error("Failed to update status");
    }
  };

  const handleReassign = async () => {
    if (!assigneeId.trim()) return;

    try {
      await api.patch(`/tickets/${id}/reassign`, {
        assigneeId
      });

      toast.success("Ticket reassigned");

      setAgentSearch("");
      setAgentResults([]);
      setSelectedAgent(null);
      setAssigneeId("");

      fetchTicket();
    } catch (err) {
      toast.error("Failed to reassign");
    }
  };

  const searchAgents = async (value) => {
    setAgentSearch(value);

    if (!value.trim()) {
      setAgentResults([]);
      return;
    }

    try {
      const res = await api.get(
        `/users/agents?search=${value}`
      );

      setAgentResults(res.data.data);
    } catch (err) {
      setAgentResults([]);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Ticket Header */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2">
          {ticket.subject}
        </h1>

        <p className="text-gray-500 mb-4">
          {ticket.ticketId}
        </p>

        <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
          <div>
            <span className="px-2 py-1 rounded bg-green-100 text-xs">
              {ticket.status}
            </span>
          </div>

          <div>
            <span className="px-2 py-1 rounded bg-slate-100 text-xs">
              {ticket.priority}
            </span>
          </div>

          <p>Email: {ticket.email}</p>

          <p>
            Assigned To:{" "}
            {ticket.assignedTo?.email ||
              "Unassigned"}
          </p>
        </div>

        <p className="text-gray-700">
          {ticket.body}
        </p>
      </div>

      {/* Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Reply */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-3">
            Add Reply
          </h2>

          <textarea
            rows="4"
            value={reply}
            onChange={(e) =>
              setReply(e.target.value)
            }
            className="w-full border rounded p-3"
            placeholder="Write reply..."
          />

          <button
            onClick={handleReply}
            className="mt-3 bg-black text-white px-4 py-2 rounded"
          >
            Send Reply
          </button>
        </div>

        {/* Status */}
        <div className="bg-white rounded-xl shadow p-5">
          <h2 className="font-semibold mb-3">
            Update Status
          </h2>

          <select
            value={status}
            onChange={(e) =>
              setStatus(e.target.value)
            }
            className="w-full border rounded p-3"
          >
            <option value="open">Open</option>
            <option value="in_progress">
              In Progress
            </option>
            <option value="closed">
              Closed
            </option>
          </select>

          <button
            onClick={handleStatus}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded"
          >
            Save Status
          </button>
        </div>
      </div>

      {/* Admin Reassign */}
      {user?.role === "admin" && (
        <div className="bg-white rounded-xl shadow p-5 mb-6">
          <h2 className="font-semibold mb-3">
            Reassign Ticket
          </h2>

          <input
            placeholder="Search by email..."
            value={agentSearch}
            onChange={(e) =>
              searchAgents(e.target.value)
            }
            className="border rounded p-3 w-full"
          />

          {agentResults.length > 0 && (
            <div className="border rounded mt-2 max-h-52 overflow-y-auto">
              {agentResults.map((agent) => (
                <button
                  key={agent._id}
                  type="button"
                  onClick={() => {
                    setSelectedAgent(agent);
                    setAssigneeId(agent._id);
                    setAgentResults([]);
                    setAgentSearch(
                      agent.email
                    );
                  }}
                  className="block w-full text-left px-4 py-3 hover:bg-slate-50 border-b"
                >
                  <div className="font-medium">
                    {agent.name}
                  </div>

                  <div className="text-sm text-gray-500">
                    {agent.email}
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedAgent && (
            <div className="mt-3 bg-slate-50 rounded p-3">
              <p className="font-medium">
                {selectedAgent.name}
              </p>

              <p className="text-sm text-gray-500">
                {selectedAgent.email}
              </p>
            </div>
          )}

          <button
            onClick={handleReassign}
            className="mt-4 bg-purple-600 text-white px-4 py-2 rounded"
          >
            Reassign
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-semibold mb-4">
          Timeline
        </h2>

        <div className="space-y-4">
          {timeline.map((item) => (
            <div
              key={item._id}
              className="border-l-2 pl-4"
            >
              <p className="font-medium capitalize">
                {item.type.replaceAll(
                  "_",
                  " "
                )}
              </p>

              <p className="text-gray-600">
                {item.message}
              </p>

              <p className="text-xs text-gray-400 mt-1">
                {item.actor}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}