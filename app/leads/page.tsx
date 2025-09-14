"use client";

import { useEffect, useState } from "react";

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [status, setStatus] = useState("");
  const [timeline, setTimeline] = useState("");
  const [page, setPage] = useState(1);

  const [meta, setMeta] = useState<any>(null);

  // CSV Import result
  const [importResult, setImportResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);

  // Fetch leads
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (city) params.append("city", city);
      if (propertyType) params.append("propertyType", propertyType);
      if (status) params.append("status", status);
      if (timeline) params.append("timeline", timeline);
      params.append("page", page.toString());

      fetch(`/api/leads?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => {
          setLeads(data.leads);
          setMeta(data);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, 400);

    return () => clearTimeout(timeout);
  }, [search, city, propertyType, status, timeline, page]);

  // ✅ Delete function
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    const res = await fetch(`/api/leads?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } else {
      alert("Failed to delete lead");
    }
  };

  // ✅ Export CSV
  const handleExport = () => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (city) params.append("city", city);
    if (propertyType) params.append("propertyType", propertyType);
    if (status) params.append("status", status);
    if (timeline) params.append("timeline", timeline);
    window.location.href = `/api/leads/export?${params.toString()}`;
  };

  // ✅ Import CSV
  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setImporting(true);
    const res = await fetch("/api/leads/import", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    setImportResult(data);
    setImporting(false);

    // Refresh leads after import
    setPage(1);
  };

  if (loading) return <p>Loading leads...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>All Leads</h1>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <input
          placeholder="Search name/email/phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={city} onChange={(e) => setCity(e.target.value)}>
          <option value="">City</option>
          <option>Chandigarh</option>
          <option>Mohali</option>
          <option>Zirakpur</option>
          <option>Panchkula</option>
          <option>Other</option>
        </select>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
          <option value="">Property Type</option>
          <option>Apartment</option>
          <option>Villa</option>
          <option>Plot</option>
          <option>Office</option>
          <option>Retail</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">Status</option>
          <option>New</option>
          <option>Qualified</option>
          <option>Contacted</option>
          <option>Visited</option>
          <option>Negotiation</option>
          <option>Converted</option>
          <option>Dropped</option>
        </select>
        <select value={timeline} onChange={(e) => setTimeline(e.target.value)}>
          <option value="">Timeline</option>
          <option value="0-3m">0-3 months</option>
          <option value="3-6m">3-6 months</option>
          <option value=">6m">&gt;6 months</option>
          <option>Exploring</option>
        </select>
      </div>

      {/* Import & Export */}
      <div style={{ marginBottom: "20px", display: "flex", gap: "10px" }}>
        <button
          onClick={handleExport}
          style={{ padding: "8px 16px", backgroundColor: "purple", color: "white" }}
        >
          Export CSV
        </button>
        <label style={{ padding: "8px 16px", backgroundColor: "teal", color: "white", cursor: "pointer" }}>
          {importing ? "Importing..." : "Import CSV"}
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            style={{ display: "none" }}
          />
        </label>
      </div>

      {/* Import Result */}
      {importResult && (
        <div style={{ marginBottom: "20px" }}>
          <p>Inserted: {importResult.inserted}</p>
          {importResult.errors && importResult.errors.length > 0 && (
            <table border={1} cellPadding={6}>
              <thead>
                <tr>
                  <th>Row</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {importResult.errors.map((err: any, idx: number) => (
                  <tr key={idx}>
                    <td>{err.row}</td>
                    <td>{err.error}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Table */}
      {leads.length === 0 ? (
        <p>No leads found.</p>
      ) : (
        <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>Property</th>
              <th>Status</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.fullName}</td>
                <td>{lead.email}</td>
                <td>{lead.phone}</td>
                <td>{lead.city}</td>
                <td>{lead.propertyType}</td>
                <td>{lead.status}</td>
                <td>{new Date(lead.updatedAt).toLocaleString()}</td>
                <td>
                  <a
                    href={`/leads/${lead.id}`}
                    style={{ marginRight: "8px", color: "green" }}
                  >
                    Edit
                  </a>
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
      )}

      {/* Pagination */}
      {meta && (
        <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>
          <span>
            Page {meta.page} of {meta.totalPages}
          </span>
          <button disabled={page >= meta.totalPages} onClick={() => setPage(page + 1)}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
