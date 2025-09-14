"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditLeadPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Fetch lead + history
  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((res) => res.json())
      .then((data) => setLead(data));

    fetch(`/api/leads/${id}/history`)
      .then((res) => res.json())
      .then((data) => setHistory(data));
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setLead({ ...lead, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });

    if (res.ok) {
      router.push("/leads");
    } else {
      const err = await res.json();
      setError(err.error || "Failed to update");
    }

    setSaving(false);
  };

  if (!lead) return <p>Loading...</p>;

  return (
    <div
      style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}
    >
      <h1>Edit Lead</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Edit Form */}
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        <input
          name="fullName"
          value={lead.fullName || ""}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          value={lead.email || ""}
          onChange={handleChange}
        />
        <input
          name="phone"
          value={lead.phone || ""}
          onChange={handleChange}
          required
        />

        <select
          name="city"
          value={lead.city || ""}
          onChange={handleChange}
          required
        >
          <option>Chandigarh</option>
          <option>Mohali</option>
          <option>Zirakpur</option>
          <option>Panchkula</option>
          <option>Other</option>
        </select>

        <select
          name="propertyType"
          value={lead.propertyType || ""}
          onChange={handleChange}
          required
        >
          <option>Apartment</option>
          <option>Villa</option>
          <option>Plot</option>
          <option>Office</option>
          <option>Retail</option>
        </select>

        <textarea
          name="notes"
          value={lead.notes || ""}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={saving}
          style={{ padding: "10px", backgroundColor: "blue", color: "white" }}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>

      {/* Audit Trail */}
      <h2 style={{ marginTop: "30px" }}>Last 5 Changes</h2>
      {history.length === 0 && <p>No history yet.</p>}
      <ul style={{ paddingLeft: "20px" }}>
        {history.map((h) => (
          <li key={h.id}>
            <strong>{new Date(h.changedAt).toLocaleString()}</strong> —{" "}
            {Object.entries(h.diff).map(([field, val]: any) => (
              <div key={field}>
                <em>{field}</em>: {val.old ?? "null"} → {val.new ?? "null"}
              </div>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
