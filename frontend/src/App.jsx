import { useEffect, useState } from "react";
import Board from "./components/Board";
import CreateTicket from "./components/CreateTicket";
import StatsStrip from "./components/StatsStrip";
import Filters from "./components/Filters";
import "./App.css";

const API = "https://bfhl-suhana-pathak.onrender.com/";

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({ priority: "", breached: false });
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTickets() {
    try {
      const params = new URLSearchParams();
      if (filters.priority) params.set("priority", filters.priority);
      if (filters.breached) params.set("breached", "true");
      const res = await fetch(`${API}/tickets?${params}`);
      const data = await res.json();
      setTickets(data);
    } catch {
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const res = await fetch(`${API}/tickets/stats`);
      const data = await res.json();
      setStats(data);
    } catch { }
  }

  useEffect(() => {
    loadTickets();
    loadStats();
  }, [filters]);

  async function moveTicket(id, newStatus) {
    const res = await fetch(`${API}/tickets/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const d = await res.json();
      alert(d.error);
      return;
    }
    loadTickets();
    loadStats();
  }

  async function deleteTicket(id) {
    await fetch(`${API}/tickets/${id}`, { method: "DELETE" });
    loadTickets();
    loadStats();
  }

  function onCreated() {
    setShowForm(false);
    loadTickets();
    loadStats();
  }

  return (
    <div className="app">
      <header className="topbar">
        <span className="logo">DeskFlow</span>
        <button className="btn-new" onClick={() => setShowForm(true)}>+ New Ticket</button>
      </header>

      {stats && <StatsStrip stats={stats} />}

      <Filters filters={filters} onChange={setFilters} />

      {loading && <p className="msg">Loading...</p>}
      {error && <p className="msg err">{error}</p>}

      {!loading && (
        <Board tickets={tickets} onMove={moveTicket} onDelete={deleteTicket} />
      )}

      {showForm && (
        <div className="overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <CreateTicket onCreated={onCreated} onClose={() => setShowForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}