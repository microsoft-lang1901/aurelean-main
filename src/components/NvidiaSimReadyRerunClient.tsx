"use client";

import { useState } from "react";

type RerunResponse = {
  ok: boolean;
  data?: {
    requestId: string;
    status: string;
    message: string;
  };
  error?: string;
};

export function NvidiaSimReadyRerunClient() {
  const [status, setStatus] = useState("");
  const [lastRequest, setLastRequest] = useState("");
  const [busy, setBusy] = useState(false);

  async function requestRerun() {
    if (busy) return;
    setBusy(true);
    setStatus("Requesting rerun...");
    try {
      const response = await fetch("/api/integrations/nvidia-simready/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      });
      const payload = (await response.json()) as RerunResponse;
      if (payload.data?.requestId) setLastRequest(payload.data.requestId);
      if (!payload.ok) {
        setStatus(payload.error ?? "Could not start rerun.");
      } else if (payload.data) {
        setStatus(`${payload.data.status.toUpperCase()}: ${payload.data.requestId}`);
      } else {
        setStatus("Rerun queued.");
      }
    } catch {
      setStatus("Could not reach SimReady rerun endpoint.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="notice" style={{ marginTop: 16 }}>
      {lastRequest ? <p>Latest request: {lastRequest}</p> : null}
      <button
        type="button"
        className="btn btn-ghost-dk"
        onClick={requestRerun}
        disabled={busy}
      >
        {busy ? "Requesting rerun..." : "Request SimReady rerun"}
      </button>
      {status && (
        <p role="status" aria-live="polite" style={{ marginTop: 10 }}>
          {status}
        </p>
      )}
    </div>
  );
}
