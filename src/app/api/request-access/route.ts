import { fail, ok, readJson } from "@/lib/api";
import { createAccessRequest } from "@/lib/store";

type Payload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  sourcing?: string[];
  volume?: string;
  layers?: string[];
  notes?: string;
};

export async function POST(request: Request) {
  try {
    const body = await readJson<Payload>(request);
    if (!body.email || !body.company) {
      return fail("Work email and company are required.");
    }

    const accessRequest = await createAccessRequest({
      firstName: body.firstName ?? "",
      lastName: body.lastName ?? "",
      email: body.email,
      company: body.company,
      sourcing: body.sourcing ?? [],
      volume: body.volume ?? "",
      layers: body.layers ?? [],
      notes: body.notes ?? ""
    });

    return Response.json(ok(accessRequest));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create access request.");
  }
}
