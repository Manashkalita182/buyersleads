
import { useEffect, useState } from "react";

export default function Leads() {
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => setLeads(data));
  }, []);

  // ✅ Delete function added
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    if (res.ok) setLeads(leads.filter(l => l.id !== id));
    else alert("Failed to delete lead");
  };

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>All Leads</h1>
      <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.phone}</td>
              <td>{lead.message}</td>
              <td>
                <button
                  onClick={() => handleDelete(lead.id)}
                  style={{ padding: "4px 8px", backgroundColor: "red", color: "white" }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
