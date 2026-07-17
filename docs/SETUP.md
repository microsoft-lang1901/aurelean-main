# Setup

Local setup guidance for AURELEAN Main, derived from the tracked manifests and root scripts at `b71876271170597deda65cf7e0d0274cc8bc8a5d`.

<!-- portfolio-maintenance-20260717:setup:start -->
## Prerequisites and Install

```powershell
npm ci
```
Use `.env.example` only as a variable-name template. Keep real values outside Git and never commit `.env` files.
Available root commands:
- `npm run dev`
- `npm run start`
- `npm run build`
- `npm run lint`
- `npm run test:smoke`

## Component Manifests

- `package.json`

## Setup Boundary

Do not run deployment, production migration, billing, provider, or destructive data commands as part of local setup. Use repository-specific environment and approval documentation where present.
<!-- portfolio-maintenance-20260717:setup:end -->
