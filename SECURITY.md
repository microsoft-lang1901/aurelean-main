# Security Policy

## Supported Surface

AURELEAN currently supports security review for the public marketing site, workspace demo, API routes, Supabase persistence path, OpenAI/NVIDIA integrations, and Prisma Phase 2 schema.

## Reporting

Report suspected vulnerabilities to the repository owner or project security contact before public disclosure. Include:

- Affected route, endpoint, workflow, or integration.
- Reproduction steps and expected impact.
- Any relevant request/response samples with secrets and personal data removed.

Do not include production secrets, private API keys, bearer tokens, Supabase service-role keys, or customer procurement data in reports.

## Current Controls

- Mutation routes can be token-gated with `AURELEAN_REQUIRE_AUTH=true` and `AURELEAN_API_TOKEN`.
- `/api/reset` is disabled unless `AURELEAN_ENABLE_RESET=true` and a valid API token is supplied.
- Security response headers are applied through `next.config.ts`.
- CodeQL, dependency review, and high-severity `npm audit` checks run in GitHub Actions.

## Non-Goals

This policy does not authorize testing against third-party suppliers, OpenAI, NVIDIA, Supabase, Vercel, or other connected services outside the AURELEAN repository and deployed application scope.
