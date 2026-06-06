"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const sourcingOptions = ["Luxury textiles", "Furnishings", "Materials", "Manufacturing"];
const layerOptions = ["Trade", "Intelligence", "AURELEAN AI", "Infrastructure"];
const workEmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const consumerDomainPattern = /(gmail|yahoo|hotmail|outlook)\./i;

export function RequestAccessClient() {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    procurementOwner: "",
    securityContact: "",
    volume: "Under €1M",
    notes: "",
    sourcing: [] as string[],
    layers: [] as string[]
  });

  const title = useMemo(() => {
    if (done) return "Request received";
    return ["Tell us about you", "Your sourcing profile", "Where to begin"][step];
  }, [done, step]);

  function setValue(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function toggle(group: "sourcing" | "layers", value: string) {
    setForm((current) => {
      const selected = new Set(current[group]);
      if (selected.has(value)) selected.delete(value);
      else selected.add(value);
      return { ...current, [group]: Array.from(selected) };
    });
  }

  function validateStep(nextStep?: number) {
    setMessage("");
    if (step === 0) {
      if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim() || !form.company.trim()) {
        setMessage("First name, last name, work email, and company are required.");
        return false;
      }
      if (!/^[A-Za-z' -]+$/.test(form.firstName.trim()) || !/^[A-Za-z' -]+$/.test(form.lastName.trim())) {
        setMessage("Use letters only for names.");
        return false;
      }
      if (!workEmailPattern.test(form.email.trim())) {
        setMessage("Please enter a valid work email address.");
        return false;
      }
      if (consumerDomainPattern.test(form.email.trim())) {
        setMessage("Please use your company email address.");
        return false;
      }
      if (form.securityContact.trim()) {
        if (!workEmailPattern.test(form.securityContact.trim())) {
          setMessage("Security contact must be a valid email address.");
          return false;
        }
        if (consumerDomainPattern.test(form.securityContact.trim())) {
          setMessage("Security contact should be a company email address.");
          return false;
        }
      }
    }
    if (step === 1 && form.sourcing.length === 0) {
      setMessage("Select at least one sourcing category.");
      return false;
    }
    if (step === 2 && form.layers.length === 0) {
      setMessage("Select at least one platform layer.");
      return false;
    }
    if (typeof nextStep === "number") setStep(nextStep);
    return true;
  }

  async function submit() {
    if (!validateStep()) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const json = await response.json();
      if (!response.ok || !json.ok) {
        setMessage(json.error ?? "Something went wrong.");
        return;
      }
      setDone(true);
    } catch {
      setMessage("Could not submit request. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="form-page">
      <div className="form-visual">
        <div className="eyebrow on-dark">Request access</div>
        <h1 className="h-lg" style={{ marginTop: 16, maxWidth: "13ch" }}>
          The operating layer for global sourcing is opening.
        </h1>
        <p className="lead">
          We onboard new organisations in cohorts and prepare a workspace around
          your sourcing operation.
        </p>
      </div>
      <div className="form-panel">
        <div className="form-card">
          <div className="eyebrow">Request access</div>
          <h2 className="h-md" style={{ marginTop: 12 }}>{title}</h2>
          {done ? (
            <div style={{ marginTop: 24 }}>
              <p className="notice">
                Thank you. Your request has been stored and the AURELEAN team can
                review it from the backend data layer.
              </p>
              <Link className="btn btn-gold" href="/" style={{ marginTop: 22 }}>Back to home</Link>
            </div>
          ) : (
            <>
              {step === 0 && (
                <>
                  <div className="two">
                    <Field label="First name" value={form.firstName} onChange={(v) => setValue("firstName", v)} />
                    <Field label="Last name" value={form.lastName} onChange={(v) => setValue("lastName", v)} />
                  </div>
                  <Field label="Work email" type="email" value={form.email} onChange={(v) => setValue("email", v)} />
                  <Field label="Company" value={form.company} onChange={(v) => setValue("company", v)} />
                  <Field label="Procurement owner" value={form.procurementOwner} onChange={(v) => setValue("procurementOwner", v)} />
                  <Field label="Security contact" type="email" value={form.securityContact} onChange={(v) => setValue("securityContact", v)} />
                </>
              )}
              {step === 1 && (
                <>
                  <OptionGroup title="What do you source?" options={sourcingOptions} selected={form.sourcing} onToggle={(v) => toggle("sourcing", v)} />
                  <div className="field">
                    <label>Annual sourcing volume</label>
                    <select className="select" value={form.volume} onChange={(e) => setValue("volume", e.target.value)}>
                      <option>Under €1M</option>
                      <option>€1M - €10M</option>
                      <option>€10M - €50M</option>
                      <option>€50M+</option>
                    </select>
                  </div>
                </>
              )}
              {step === 2 && (
                <>
                  <OptionGroup title="Which layers interest you?" options={layerOptions} selected={form.layers} onToggle={(v) => toggle("layers", v)} />
                  <div className="field">
                    <label>Anything we should know?</label>
                    <textarea className="textarea" value={form.notes} onChange={(e) => setValue("notes", e.target.value)} placeholder="Tell us about your sourcing operation..." />
                  </div>
                </>
              )}
              {message && <p className="notice" style={{ color: "var(--risk)" }} role="status" aria-live="polite">{message}</p>}
              <div className="actions">
                {step > 0 && (
                  <button type="button" className="btn btn-ghost-lt" onClick={() => setStep((s) => s - 1)}>
                    Back
                  </button>
                )}
                {step < 2 ? (
                  <button className="btn btn-gold" type="button" onClick={() => validateStep(step + 1)}>Continue</button>
                ) : (
                  <button className="btn btn-gold" type="button" onClick={submit} disabled={busy}>{busy ? "Submitting..." : "Request Access"}</button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text"
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const id = `request-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input"
        type={type}
        required={label === "First name" || label === "Last name" || label === "Work email" || label === "Company"}
        aria-required={label === "First name" || label === "Last name" || label === "Work email" || label === "Company"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function OptionGroup({
  title,
  options,
  selected,
  onToggle
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="field">
      <label>{title}</label>
      <div className="chip-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={`chip ${selected.includes(option) ? "on" : ""}`}
            onClick={() => onToggle(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

