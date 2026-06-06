import { fail, isRateLimited, isWorkEmail, ok, parseValidatedJson } from "@/lib/api";
import { requestAccessSchema } from "@/lib/validation";
import { createAccessRequest } from "@/lib/store";

export async function POST(request: Request) {
  try {
    if (isRateLimited(request, "request-access", 8, 60_000)) {
      return fail("Too many submissions. Please wait and try again.", 429, "rate_limited");
    }

    const bodyResult = await parseValidatedJson(request, requestAccessSchema);
    if (!bodyResult.ok) return bodyResult.response;

    const body = bodyResult.data;
    const firstName = body.firstName;
    const lastName = body.lastName;
    const email = body.email.toLowerCase();
    const company = body.company;

    if (!isWorkEmail(email)) {
      return fail("Please use a valid work email address.", 422, "invalid_work_email");
    }

    const accessRequest = await createAccessRequest({
      firstName,
      lastName,
      email,
      company,
      procurementOwner: body.procurementOwner,
      securityContact: body.securityContact ?? "",
      sourcing: body.sourcing,
      volume: body.volume ?? "",
      layers: body.layers,
      notes: body.notes ?? ""
    });

    return Response.json(ok(accessRequest));
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not create access request.");
  }
}
