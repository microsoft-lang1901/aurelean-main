import { cleanString, cleanStringArray, fail, isRateLimited, isWorkEmail, ok, readJson } from "@/lib/api";
import { createAccessRequest } from "@/lib/store";

type Payload = {
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  procurementOwner?: string;
  securityContact?: string;
  sourcing?: string[];
  volume?: string;
  layers?: string[];
  notes?: string;
};

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, "request-access", 8, 60_000)) {
      return fail("Too many submissions. Please wait and try again.", 429, "rate_limited");
    }

    const body = await readJson<Payload>(request);
    const firstName = cleanString(body.firstName, 80);
    const lastName = cleanString(body.lastName, 80);
    const email = cleanString(body.email, 120).toLowerCase();
    const company = cleanString(body.company, 120);
    if (!firstName || !lastName || !email || !company) {
      return fail("First name, last name, work email, and company are required.", 422, "missing_required_fields");
    }
    if (!/^[A-Za-z' -]+$/.test(firstName) || !/^[A-Za-z' -]+$/.test(lastName)) {
      return fail("Names may only contain letters, spaces, apostrophes, and dashes.", 422, "invalid_name");
    }
    if (!isWorkEmail(email)) {
      return fail("Please use a valid work email address.", 422, "invalid_work_email");
    }

    const accessRequest = await createAccessRequest({
      firstName,
      lastName,
      email,
      company,
      procurementOwner: cleanString(body.procurementOwner, 120),
      securityContact: cleanString(body.securityContact, 120),
      sourcing: cleanStringArray(body.sourcing),
      volume: cleanString(body.volume, 80),
      layers: cleanStringArray(body.layers),
      notes: cleanString(body.notes, 1000)
    });

    return Response.json(ok(accessRequest));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create access request.");
  }
}
