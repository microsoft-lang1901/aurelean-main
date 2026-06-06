"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import type { Supplier } from "@/types/aurelean";

export function SupplierClient({ supplier }: { supplier: Supplier }) {
  const [saved, setSaved] = useState(supplier.saved);
  const [rfqDone, setRfqDone] = useState("");
  const [sampleDone, setSampleDone] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    material: supplier.material,
    quantity: supplier.moq.replace("m", " m"),
    targetDelivery: "Q3 2026",
    specifications: ""
  });

  function setValue(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function toggleSave() {
    const response = await fetch(`/api/suppliers/${supplier.id}/save`, { method: "POST" });
    const json = await response.json();
    if (json.ok) setSaved(json.data.saved);
  }

  async function submitRfq() {
    setBusy(true);
    setSampleDone("");
    const response = await fetch("/api/rfqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId: supplier.id, ...form })
    });
    const json = await response.json();
    setBusy(false);
    if (json.ok) setRfqDone(`${json.data.id} sent to ${supplier.name}.`);
    else setRfqDone(json.error ?? "Could not send RFQ.");
  }

  async function requestSample() {
    setRfqDone("");
    const response = await fetch(`/api/suppliers/${supplier.id}/sample`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const json = await response.json();
    if (json.ok) setSampleDone("Sample request recorded.");
    else setSampleDone(json.error ?? "Could not request sample.");
  }

  return (
    <section className="section">
      <div className="wrap grid-2" style={{ alignItems: "start" }}>
        <div>
          <div className="image-panel panel" style={{ background: "url('/assets/landing/interior-hero.png') center/cover" }} />
          <div style={{ marginTop: 30 }}>
            <div className="kicker">{supplier.city}, {supplier.country} · {supplier.countryCode}</div>
            <h1 className="h-xl" style={{ marginTop: 12 }}>{supplier.name}</h1>
            <div className="chip-row" style={{ marginTop: 16 }}>
              {supplier.certifications.map((cert) => <span className="chip" key={cert}>{cert}</span>)}
            </div>
            <div className="grid-3" style={{ marginTop: 28 }}>
              <Metric value={`${supplier.reliability}/100`} label="Reliability" />
              <Metric value={supplier.capabilityTier} label="Capability tier" />
              <Metric value="<36h" label="Avg. RFQ response" />
            </div>
            <h2 className="h-md" style={{ marginTop: 36 }}>Overview</h2>
            <p className="lead">{supplier.overview}</p>
            <h2 className="h-md" style={{ marginTop: 36 }}>Available material</h2>
            <div className="panel" style={{ padding: 18, marginTop: 12 }}>
              <strong>{supplier.material}</strong>
              <div className="spec-row">
                <span>MOQ {supplier.moq}</span>
                <span>Lead {supplier.leadTimeWeeks} wk</span>
                <span>Tier {supplier.tier}</span>
              </div>
            </div>
          </div>
        </div>
        <aside className="dk panel" style={{ padding: 26, position: "sticky", top: 90 }}>
          <h2 className="h-md">Request a quote</h2>
          <p className="lead">Structured RFQ delivered to {supplier.name} through AURELEAN.</p>
          <div className="field">
            <label htmlFor="rfq-material" style={{ color: "var(--on-dk-dim)" }}>Material</label>
            <input id="rfq-material" className="input" value={form.material} onChange={(e) => setValue("material", e.target.value)} />
          </div>
          <div className="two">
            <div className="field">
              <label htmlFor="rfq-quantity" style={{ color: "var(--on-dk-dim)" }}>Quantity</label>
              <input id="rfq-quantity" className="input" value={form.quantity} onChange={(e) => setValue("quantity", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="rfq-target-delivery" style={{ color: "var(--on-dk-dim)" }}>Target delivery</label>
              <input id="rfq-target-delivery" className="input" value={form.targetDelivery} onChange={(e) => setValue("targetDelivery", e.target.value)} />
            </div>
          </div>
          <div className="field">
            <label htmlFor="rfq-specifications" style={{ color: "var(--on-dk-dim)" }}>Specifications</label>
            <textarea id="rfq-specifications" className="textarea" value={form.specifications} onChange={(e) => setValue("specifications", e.target.value)} placeholder="Colourways, finish, certifications, sampling needs..." />
          </div>
          <button className="btn btn-gold" style={{ width: "100%", marginTop: 18 }} onClick={submitRfq} disabled={busy}>
            {busy ? "Sending..." : "Send RFQ"}
          </button>
          <div className="actions">
            <button className="btn btn-ghost-dk" onClick={toggleSave}>{saved ? "Saved" : "Save mill"}</button>
            <button className="btn btn-ghost-dk" onClick={requestSample}>Request sample</button>
          </div>
          {(rfqDone || sampleDone) && (
            <div className="notice" style={{ marginTop: 18 }}>
              <CheckCircle2 size={17} /> {rfqDone || sampleDone}
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="feature-card">
      <div className="stat-number" style={{ color: "var(--on-lt)" }}>{value}</div>
      <div className="kicker">{label}</div>
    </div>
  );
}
