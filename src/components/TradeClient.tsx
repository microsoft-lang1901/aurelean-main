"use client";

import Link from "next/link";
import { Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { Supplier } from "@/types/aurelean";

const categories = ["all", "wool", "silk", "cashmere", "linen", "cotton", "technical"];

export function TradeClient({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const [status, setStatus] = useState("");
  const [savingId, setSavingId] = useState("");

  const visible = useMemo(() => {
    const q = query.toLowerCase();
    return suppliers
      .filter((supplier) => category === "all" || supplier.category === category)
      .filter((supplier) =>
        `${supplier.name} ${supplier.material} ${supplier.country}`.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        if (sort === "lead") return a.leadTimeWeeks - b.leadTimeWeeks;
        if (sort === "moq") return parseInt(a.moq, 10) - parseInt(b.moq, 10);
        return b.featuredScore - a.featuredScore;
      });
  }, [category, query, sort, suppliers]);

  async function toggleSave(id: string) {
    try {
      if (savingId) return;
      setSavingId(id);
      setStatus("Saving supplier...");
      const response = await fetch(`/api/suppliers/${id}/save`, { method: "POST" });
      const json = await response.json();
      if (!json.ok) {
        setStatus(json.error ?? "Could not save supplier.");
        return;
      }
      setSuppliers((current) =>
        current.map((supplier) => (supplier.id === id ? json.data : supplier))
      );
      setStatus("Supplier updated.");
    } catch {
      setStatus("Network error. Please try again.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <>
    <section className="dk section">
        <div className="wrap">
          <div className="eyebrow on-dark">AURELEAN Trade</div>
          <h1 className="h-xl" style={{ marginTop: 16, maxWidth: "13ch" }}>
            The sourcing marketplace for the world&apos;s finest cloth.
          </h1>
          <p className="lead" style={{ marginTop: 22 }}>
            Verified sourcing intelligence, editorial discovery, and transparent
            global trade workflows for luxury textiles.
          </p>
          <div className="stat-grid" style={{ maxWidth: 760 }}>
            <MiniStat value="2,400+" label="Verified mills" />
            <MiniStat value="38,000+" label="Materials indexed" />
            <MiniStat value="42" label="Countries" />
            <MiniStat value="< 36h" label="Avg. RFQ response" />
          </div>
        </div>
      </section>
      <div className="searchbar">
        <div className="wrap">
          <label className="input search-input" htmlFor="trade-search" style={{ display: "flex", gap: 10 }}>
            <Search size={18} />
            <input
              id="trade-search"
              aria-label="Search supplier marketplace"
              style={{ border: 0, background: "transparent", outline: 0, width: "100%" }}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder='Search mills, fibers, finishes - "cashmere", "Biella wool"...'
            />
          </label>
          <div className="chip-row">
            {categories.map((item) => (
              <button
                type="button"
                className={`chip ${category === item ? "on" : ""}`}
                key={item}
                onClick={() => setCategory(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <select className="select" style={{ width: 160 }} value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="featured">Featured</option>
            <option value="lead">Lead time</option>
            <option value="moq">MOQ low-high</option>
          </select>
        </div>
      </div>
      <section className="section">
        <div className="wrap">
          <div className="eyebrow">The index</div>
          <h2 className="h-md" style={{ marginTop: 10 }}>Verified mills & materials</h2>
          <p style={{ color: "var(--on-lt-mut)" }}>{visible.length} result{visible.length === 1 ? "" : "s"}</p>
          {status && (
            <p className="notice" style={{ marginTop: 16 }} role="status" aria-live="polite">
              {status}
            </p>
          )}
          <div className="listing">
            {visible.map((supplier, index) => (
              <article className="supplier-card" key={supplier.id}>
                <div className="swatch" style={{ background: swatch(index) }}>
                  <button
                    type="button"
                    className={`save ${supplier.saved ? "on" : ""}`}
                    aria-label="Save supplier"
                    disabled={savingId === supplier.id}
                    onClick={() => toggleSave(supplier.id)}
                  >
                    <Heart size={16} fill={supplier.saved ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="card-body">
                  <div className="kicker">{supplier.country} · {supplier.countryCode}</div>
                  <h3 className="h-md" style={{ fontSize: 25, marginTop: 8 }}>{supplier.name}</h3>
                  <p style={{ color: "var(--on-lt-mut)", fontSize: 13 }}>{supplier.material}</p>
                  <div className="spec-row">
                    <Spec label="MOQ" value={supplier.moq} />
                    <Spec label="Lead" value={`${supplier.leadTimeWeeks} wk`} />
                    <Spec label="Tier" value={supplier.tier} />
                  </div>
                  <Link className="btn btn-ghost-lt" href={`/trade/${supplier.id}`} style={{ marginTop: 16, width: "100%" }}>
                    Open supplier
                  </Link>
                  <Link className="text-link" href={`/fabrics/${supplier.id}`} style={{ marginTop: 12 }}>
                    Open fabric
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="stat-number">{value}</div>
      <div className="kicker" style={{ color: "var(--on-dk-mut)" }}>{label}</div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="kicker">{label}</div>
      <div>{value}</div>
    </div>
  );
}

function swatch(index: number) {
  const colors = ["#6f6555", "#3c4a52", "#7c5a4b", "#4d4636", "#8a7f6b", "#5a4d57"];
  const color = colors[index % colors.length];
  return `linear-gradient(145deg, ${color}, #18140f)`;
}


