const base = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

const checks = [
  // Public pages
  ["GET", "/"],
  ["GET", "/platform"],
  ["GET", "/trade"],
  ["GET", "/trade/cerruti"],
  ["GET", "/intelligence"],
  ["GET", "/workspace"],
  ["GET", "/ai-agent"],
  ["GET", "/agent"],
  ["GET", "/developer"],
  ["GET", "/developers"],
  ["GET", "/resources"],
  ["GET", "/resources/documentation"],
  ["GET", "/integrations"],
  ["GET", "/integrations/nvidia-simready"],
  ["GET", "/company"],
  ["GET", "/company/about"],
  ["GET", "/company/careers"],
  ["GET", "/company/newsroom"],
  ["GET", "/company/contact"],
  ["GET", "/security"],
  ["GET", "/privacy"],
  ["GET", "/request-access"],
  ["GET", "/solutions"],
  ["GET", "/solutions/luxury-textiles"],
  ["GET", "/solutions/materials"],
  ["GET", "/solutions/furnishings"],
  ["GET", "/solutions/manufacturing"],

  // API GET endpoints
  ["GET", "/api/bootstrap"],
  ["GET", "/api/health"],
  ["GET", "/api/integrations/nvidia-simready"],
  ["GET", "/api/rfqs"]
];

const postChecks = [
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
    "/api/agents/run",
    {
      action: "invalid_action",
      prompt: "Compare bids"
    },
    422
  ],
  [
    "POST",
    "/api/rfqs/NON_EXISTENT/award",
    {
      bidId: "BID-0000",
      approvalIntent: "human-approved"
    },
    404
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
    "/api/suppliers/bad%20id/sample",
    { quantity: "2 sample sets" },
    422
  ]
];

async function request(method, path, body = null, expectedStatus = null) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  if (expectedStatus !== null && response.status !== expectedStatus) {
    const payload = await response.clone().text();
    throw new Error(`${method} ${path} failed with ${response.status}; expected ${expectedStatus}. body: ${payload}`);
  }
  return response;
}

let bootstrapData = null;

for (const [method, path] of checks) {
  const response = await request(method, path);
  if (!response.ok) {
    throw new Error(`${method} ${path} failed with ${response.status}`);
  }
  if (path.startsWith("/api/")) {
    const json = await response.json();
    if (!json.ok) {
      throw new Error(`${method} ${path} returned ${json.error}`);
    }
    if (path === "/api/bootstrap") {
      bootstrapData = json.data;
    }
  }
  console.log(`OK ${method} ${path}`);
}

for (const [method, path, body] of postChecks) {
  const response = await request(method, path, body);
  if (!response.ok) {
    const payload = await response.clone().text();
    throw new Error(`${method} ${path} failed with ${response.status}; ${payload}`);
  }
  const json = await response.json();
  if (!json.ok) {
    throw new Error(`${method} ${path} returned ${json.error}`);
  }
  console.log(`OK ${method} ${path}`);
}

const rfqPayload = {
  supplierId: "cerruti",
  material: "Super 150s worsted wool",
  quantity: "120 m",
  targetDelivery: "Q3 2026",
  specifications: "Smoke test RFQ"
};
const createRfqResponse = await request("POST", "/api/rfqs", rfqPayload);
if (!createRfqResponse.ok) {
  throw new Error(`POST /api/rfqs for smoke suite failed with ${createRfqResponse.status}`);
}
const createPayload = await createRfqResponse.json();
if (!createPayload.ok) {
  throw new Error(`POST /api/rfqs for smoke suite returned ${createPayload.error}`);
}
const createdRfqId = createPayload.data?.id;
if (!createdRfqId) {
  throw new Error("POST /api/rfqs did not return an RFQ id for smoke suite");
}
console.log(`OK POST /api/rfqs -> ${createdRfqId}`);

let awardTarget =
  bootstrapData?.rfqs?.find(
    (rfq) => rfq.status !== "closed" && bootstrapData.bids?.some((bid) => bid.rfqId === rfq.id)
  ) ?? bootstrapData?.rfqs?.find((rfq) => rfq.status !== "closed");

if (!awardTarget) {
  throw new Error("No RFQ available to exercise award endpoint.");
}

const bidForAward = bootstrapData?.bids?.find((bid) => bid.rfqId === awardTarget.id);
if (!bidForAward) {
  console.log(
    `SKIP POST /api/rfqs/${awardTarget.id}/award (no bid available for award validation on ${awardTarget.id})`
  );
} else {
  const awardWithoutIntent = await request(
    "POST",
    `/api/rfqs/${awardTarget.id}/award`,
    { bidId: bidForAward.id },
    403
  );
  const awardWithoutIntentPayload = await awardWithoutIntent.json();
  if (awardWithoutIntentPayload.ok !== false) {
    throw new Error(`POST /api/rfqs/${awardTarget.id}/award without approval expected rejection`);
  }
  console.log(`OK POST /api/rfqs/${awardTarget.id}/award rejected missing approval`);

  const awardResponse = await request(
    "POST",
    `/api/rfqs/${awardTarget.id}/award`,
    { bidId: bidForAward.id, approvalIntent: "human-approved" }
  );
  if (!awardResponse.ok) {
    throw new Error(`POST /api/rfqs/${awardTarget.id}/award failed with ${awardResponse.status}`);
  }
  const awardPayload = await awardResponse.json();
  if (!awardPayload.ok || awardPayload.data?.id !== bidForAward.id) {
    throw new Error(`POST /api/rfqs/${awardTarget.id}/award did not return the expected ${bidForAward.id} award body.`);
  }
  console.log(`OK POST /api/rfqs/${awardTarget.id}/award`);
}

const compareResponse = await request("POST", "/api/agents/run", {
  action: "compare_bids",
  prompt: `Compare bids for ${createdRfqId}`,
  rfqId: createdRfqId
});
if (!compareResponse.ok) {
  throw new Error(`POST /api/agents/run compare_bids failed with ${compareResponse.status}`);
}
const comparePayload = await compareResponse.json();
if (!comparePayload.ok || !comparePayload.data) {
  throw new Error("POST /api/agents/run compare_bids returned invalid response payload");
}
console.log(`OK POST /api/agents/run compare_bids`);

const awardPrepResponse = await request("POST", "/api/agents/run", {
  action: "recommend_award",
  prompt: `Prepare award approval for ${createdRfqId}`,
  rfqId: createdRfqId
});
if (!awardPrepResponse.ok) {
  throw new Error(`POST /api/agents/run recommend_award failed with ${awardPrepResponse.status}`);
}
const awardPrepPayload = await awardPrepResponse.json();
if (!awardPrepPayload.ok || !awardPrepPayload.data) {
  throw new Error("POST /api/agents/run recommend_award returned invalid response payload");
}
console.log(`OK POST /api/agents/run recommend_award`);

for (const [method, path, body, expectedStatus] of negativeChecks) {
  const response = await request(method, path, body, expectedStatus);
  const json = await response.json();
  if (json.ok !== false) {
    throw new Error(`${method} ${path} expected rejection`);
  }
  console.log(`OK ${method} ${path} rejected invalid input`);
}
