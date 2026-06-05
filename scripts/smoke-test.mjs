const base = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

const checks = [
  ["GET", "/", null],
  ["GET", "/trade", null],
  ["GET", "/workspace", null],
  ["GET", "/api/bootstrap", null],
  [
    "POST",
    "/api/request-access",
    {
      firstName: "Smoke",
      lastName: "Test",
      email: "smoke@aurelean.test",
      company: "Smoke Maison",
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
