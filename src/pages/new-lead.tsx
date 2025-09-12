import { useState } from "react";
import { v4 as uuid } from "uuid";

export default function NewLead() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Chandigarh");
  const [propertyType, setPropertyType] = useState("Apartment");
  const [bhk, setBhk] = useState("1");
  const [purpose, setPurpose] = useState("Buy");
  const [timeline, setTimeline] = useState("0-3m");
  const [source, setSource] = useState("Website");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Budget validation
    if (budgetMin && budgetMax && parseInt(budgetMax) < parseInt(budgetMin)) {
      alert("Budget Max must be greater than or equal to Budget Min");
      return;
    }
  
    const body = {
      fullName: fullName || "",
      email: email || null,
      phone: phone || "",
      city: city || "Chandigarh",
      propertyType: propertyType || "Apartment",
      bhk: propertyType === "Apartment" || propertyType === "Villa" ? bhk : null,
      purpose: purpose || "Buy",
      timeline: timeline || "0-3m",
      source: source || "Website",
      ownerId: uuid(),
      budgetMin: budgetMin ? parseInt(budgetMin) : null,
      budgetMax: budgetMax ? parseInt(budgetMax) : null,
      notes: notes || null,
      tags: tags.length ? tags : null,
    };
  
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!res.ok) {
        // Get raw text if server returns HTML or error page
        const text = await res.text();
        console.error("Server response:", text);
        alert("Error creating lead:\n" + text);
        return;
      }
  
      // If response is JSON, parse it
      const data = await res.json();
      console.log("Lead created:", data);
      alert("Lead created successfully!");
  
      // Reset form
      setFullName("");
      setEmail("");
      setPhone("");
      setCity("Chandigarh");
      setPropertyType("Apartment");
      setBhk("1");
      setPurpose("Buy");
      setTimeline("0-3m");
      setSource("Website");
      setBudgetMin("");
      setBudgetMax("");
      setNotes("");
      setTags([]);
    } catch (err: any) {
      console.error("Network error:", err);
      alert("Network error: " + err.message);
    }
  };
  
  return (
    <div style={{ maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1>New Lead</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required style={{ display: "block", marginBottom: 10, width: "100%" }} />
        <input placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }} />
        <input placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} required style={{ display: "block", marginBottom: 10, width: "100%" }} />

        <select value={city} onChange={e => setCity(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }}>
          <option>Chandigarh</option>
          <option>Mohali</option>
          <option>Zirakpur</option>
          <option>Panchkula</option>
          <option>Other</option>
        </select>

        <select value={propertyType} onChange={e => setPropertyType(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }}>
          <option>Apartment</option>
          <option>Villa</option>
          <option>Plot</option>
          <option>Office</option>
          <option>Retail</option>
        </select>

        {(propertyType === "Apartment" || propertyType === "Villa") && (
          <select value={bhk} onChange={e => setBhk(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }}>
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>Studio</option>
          </select>
        )}

        <select value={purpose} onChange={e => setPurpose(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }}>
          <option>Buy</option>
          <option>Rent</option>
        </select>

        <select value={timeline} onChange={e => setTimeline(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }}>
          <option>0-3m</option>
          <option>3-6m</option>
          <option>&gt;6m</option>
          <option>Exploring</option>
        </select>

        <select value={source} onChange={e => setSource(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }}>
          <option>Website</option>
          <option>Referral</option>
          <option>Walk-in</option>
          <option>Call</option>
          <option>Other</option>
        </select>

        <input type="number" placeholder="Budget Min (INR)" value={budgetMin} onChange={e => setBudgetMin(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }} />
        <input type="number" placeholder="Budget Max (INR)" value={budgetMax} onChange={e => setBudgetMax(e.target.value)} style={{ display: "block", marginBottom: 10, width: "100%" }} />

        <textarea placeholder="Notes" value={notes} onChange={e => setNotes(e.target.value)} maxLength={1000} style={{ display: "block", marginBottom: 10, width: "100%" }} />
        <input placeholder="Tags (comma separated)" value={tags.join(",")} onChange={e => setTags(e.target.value.split(",").map(t => t.trim()).filter(t => t))} style={{ display: "block", marginBottom: 10, width: "100%" }} />

        <button type="submit" style={{ padding: "8px 16px" }}>Submit</button>
      </form>
    </div>
  );
}


