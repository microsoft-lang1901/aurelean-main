const base = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

const checks = [
  ["GET", "/", null],
  ["GET", "/trade", null],
  ["GET", "/workspace", null],
  ["GET", "/api/bootstrap", null],
  ["GET", "/api/health", null],
  ["GET", "/api/integrations/nvidia-simready", null],
  ["GET", "/api/rfqs", null],
  [
    "POST",
    "/api/request-access",
    {
      firstName: "Smoke",
      lastName: "Test",
      email: "smoke@aurelean.example",
      company: "Smoke Maison",
      procurementOwner: "Elise Moreau",
      securityContact: "security@aurelean.example",
      sourcing: ["Luxury textiles"],
      volume: "Under €1M",
      layers: ["Trade"],
      notes: "Automated smoke test."
    }
  ],
  [
    "POST",
    "/api/rfqs",
    {
      supplierId: "cerruti",
      material: "Super 150s worsted wool",
      quantity: "120 m",
      targetDelivery: "Q3 2026",
      specifications: "Smoke test RFQ"
    }
  ],
  [
    "POST",
    "/api/memory/query",
    {
      question: "Why did we choose Cerruti?"
    }
  ],
  [
    "POST",
    "/api/suppliers/cerruti/save",
    {}
  ],
  [
    "POST",
    "/api/suppliers/cerruti/sample",
    {
      material: "Super 150s worsted wool",
      quantity: "2 sample sets",
      targetDelivery: "Q3 2026",
      specifications: "Automated smoke sample request."
    }
  ],
  [
    "POST",
    "/api/rfqs/RFQ-2041/award",
    {
      bidId: "BID-9001",
      approvalIntent: "human-approved"
    }
  ],
  [
    "POST",
    "/api/agents/run",
    {
      action: "compare_bids",
      prompt: "Compare bids for RFQ-2041",
      rfqId: "RFQ-2041"
    }
  ],
  [
    "POST",
    "/api/agents/run",
    {
      action: "recommend_award",
      prompt: "Prepare award approval for RFQ-2041",
      rfqId: "RFQ-2041"
    }
  ]
];

const negativeChecks = [
  [
    "POST",
    "/api/request-access",
    {
      email: "smoke@gmail.com",
      company: "Smoke Maison"
    },
    422
  ],
  [
    "POST",
    "/api/suppliers/cerruti/sample",
    {
      material: "Super 150s worsted wool",
      quantity: ""
    },
    422
  ],
  [
    "POST",
    "/api/rfqs/RFQ-2041/award",
    {
      bidId: "BID-9001"
    },
    403
  ],
  [
    "POST",
    "/api/agents/run",
    {
      action: "invalid_action",
      prompt: "Compare bids"
    },
    422
  ]
];

for (const [method, path, body] of checks) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}`);
  }
  if (path.startsWith("/api/")) {
    const json = await response.json();
    if (!json.ok) throw new Error(`${method} ${path} returned ${json.error}`);
  }
  console.log(`OK ${method} ${path}`);
}

for (const [method, path, body, expectedStatus] of negativeChecks) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const json = await response.json();
  if (response.status !== expectedStatus || json.ok !== false) {
    throw new Error(`${method} ${path} expected ${expectedStatus} validation failure`);
  }
  console.log(`OK ${method} ${path} rejected invalid input`);
}

