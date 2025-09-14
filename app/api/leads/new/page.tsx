"use client";

import { useState } from "react";
import { z } from "zod";

// ✅ Define Zod schema (assignment rules)
const leadSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
    phone: z.string().regex(/^\d{10,15}$/, "Phone must be 10–15 digits"),
    city: z.enum(["Chandigarh", "Mohali", "Zirakpur", "Panchkula", "Other"]),
    propertyType: z.enum(["Apartment", "Villa", "Plot", "Office", "Retail"]),
    bhk: z.enum(["1", "2", "3", "4", "Studio"]).optional(),
    purpose: z.enum(["Buy", "Rent"]),
    budgetMin: z.coerce.number().optional(),
    budgetMax: z.coerce.number().optional(),
    timeline: z.enum(["0-3m", "3-6m", ">6m", "Exploring"]),
    source: z.enum(["Website", "Referral", "Walk-in", "Call", "Other"]),
    notes: z.string().max(1000, "Notes too long").optional(),
    tags: z.string().array().optional(),
    status: z.enum([
      "New",
      "Qualified",
      "Contacted",
      "Visited",
      "Negotiation",
      "Converted",
      "Dropped",
    ]).default("New"),
    ownerId: z.string().uuid(),
  })
  // ✅ Budget validation
  .refine((data) => !data.budgetMin || !data.budgetMax || data.budgetMax >= data.budgetMin, {
    message: "Max budget must be greater than or equal to Min budget",
    path: ["budgetMax"],
  })
  // ✅ BHK validation
  .refine(
    (data) =>
      !["Apartment", "Villa"].includes(data.propertyType) || !!data.bhk,
    {
      message: "BHK is required for Apartment or Villa",
      path: ["bhk"],
    }
  );

export default function NewLeadPage() {
  const [form, setForm] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Add demo ownerId (later from auth session)
    const payload = { ...form, ownerId: "11111111-1111-1111-1111-111111111111" };

    // ✅ Validate with Zod
    const parsed = leadSchema.safeParse(payload);
    if (!parsed.success) {
      setError(parsed.error.errors.map((err) => err.message).join(", "));
      return;
    }

    // ✅ Convert tags to array
    const dataToSend = {
      ...parsed.data,
      tags: form.tags ? form.tags.split(",").map((t: string) => t.trim()) : [],
    };

    // ✅ Send to API
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dataToSend),
    });

    if (res.ok) {
      setSuccess(true);
      setForm({});
    } else {
      setError("Failed to create lead");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>Create New Lead</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>Lead created successfully!</p>}

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: "10px" }}>
        <input name="fullName" placeholder="Full Name" value={form.fullName || ""} onChange={handleChange} required />
        <input name="email" placeholder="Email" value={form.email || ""} onChange={handleChange} />
        <input name="phone" placeholder="Phone" value={form.phone || ""} onChange={handleChange} required />

        <select name="city" value={form.city || ""} onChange={handleChange} required>
          <option value="">-- Select City --</option>
          <option>Chandigarh</option>
          <option>Mohali</option>
          <option>Zirakpur</option>
          <option>Panchkula</option>
          <option>Other</option>
        </select>

        <select name="propertyType" value={form.propertyType || ""} onChange={handleChange} required>
          <option value="">-- Property Type --</option>
          <option>Apartment</option>
          <option>Villa</option>
          <option>Plot</option>
          <option>Office</option>
          <option>Retail</option>
        </select>

        <select name="bhk" value={form.bhk || ""} onChange={handleChange}>
          <option value="">-- BHK (only for Apartment/Villa) --</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
          <option>Studio</option>
        </select>

        <select name="purpose" value={form.purpose || ""} onChange={handleChange} required>
          <option value="">-- Purpose --</option>
          <option>Buy</option>
          <option>Rent</option>
        </select>

        <input name="budgetMin" placeholder="Budget Min (INR)" value={form.budgetMin || ""} onChange={handleChange} />
        <input name="budgetMax" placeholder="Budget Max (INR)" value={form.budgetMax || ""} onChange={handleChange} />

        <select name="timeline" value={form.timeline || ""} onChange={handleChange} required>
          <option value="">-- Timeline --</option>
          <option value="0-3m">0-3 months</option>
          <option value="3-6m">3-6 months</option>
          <option value=">6m">&gt;6 months</option>
          <option value="Exploring">Exploring</option>
        </select>

        <select name="source" value={form.source || ""} onChange={handleChange} required>
          <option value="">-- Source --</option>
          <option>Website</option>
          <option>Referral</option>
          <option>Walk-in</option>
          <option>Call</option>
          <option>Other</option>
        </select>

        <textarea name="notes" placeholder="Notes" value={form.notes || ""} onChange={handleChange} />

        {/* ✅ Tags input */}
        <input
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags || ""}
          onChange={handleChange}
        />

        <button type="submit" style={{ padding: "10px", backgroundColor: "blue", color: "white" }}>
          Save Lead
        </button>
      </form>
    </div>
  );
}
