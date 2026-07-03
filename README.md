# Headmaster

Headmaster is a modular, `.env`-driven admin UI for Headscale. It is built to stay deployment-agnostic, so operators can bring their own identity provider, hostnames, and runtime layout without patching application code.

## Highlights

- OIDC login with admin-group gating
- Server-side Headscale command adapter
- Nodes-first admin surface for users, nodes, preauth keys, API keys, routes, enrollment, policy, settings, and audit
- Docker Compose first, with configuration supplied through `.env`

## Status

- Current version: `0.1.0`
- Release model: SemVer
- Runtime model: Docker Compose first
- Auth model: OIDC with admin-group enforcement
- Headscale integration: `docker exec` by default, direct binary mode optional

## Ports

- Default host port: `41869`
- Default container port: `41869`

## Requirements

- Docker and Docker Compose for the default deployment path
- A reachable Headscale instance
- An OIDC provider for authenticated administration

## Plug and play

```bash
curl -fsSL https://raw.githubusercontent.com/Pragith/headmaster/main/install.sh | bash
```

Or install from a local checkout:

```bash
cp .env.example .env
./bin/headmaster env:init
./bin/headmaster doctor
./bin/headmaster up
```

## Quick start

1. Copy `.env.example` to `.env`
2. Set your public base URL, OIDC values, and Headscale execution mode
3. Set either:
   - `HEADMASTER_HEADSCALE_EXEC_MODE=docker` with `HEADMASTER_HEADSCALE_CONTAINER`
   - or `HEADMASTER_HEADSCALE_EXEC_MODE=direct` with `HEADMASTER_HEADSCALE_BINARY`
4. Choose whether policy writes should target Headscale database mode or the mounted policy file path
5. Start the stack with `./bin/headmaster up`

## Configuration

Headmaster is configured entirely through environment variables. The sample file intentionally uses neutral placeholder values so it can be copied into any environment without leaking internal hostnames or usernames.

At minimum, configure:

- `HEADMASTER_PUBLIC_BASE_URL`
- `HEADMASTER_SESSION_SECRET`
- `HEADMASTER_AUTH_ISSUER`
- `HEADMASTER_AUTH_CLIENT_ID`
- `HEADMASTER_AUTH_CLIENT_SECRET`
- `HEADMASTER_AUTH_REDIRECT_URI`
- one Headscale execution path:
  - `HEADMASTER_HEADSCALE_EXEC_MODE=docker` with `HEADMASTER_HEADSCALE_CONTAINER`
  - or `HEADMASTER_HEADSCALE_EXEC_MODE=direct` with `HEADMASTER_HEADSCALE_BINARY`

Optional settings include:

- `HEADMASTER_HEADSCALE_CONFIG_FILE` when you want file-based policy fallback support
- `HEADMASTER_READ_ONLY=true` for a safer read-only operator mode
- `HEADMASTER_AUDIT_LOG_PATH` to relocate audit storage

## Authentication

Headmaster is not tied to Keycloak. Any OIDC provider can be used if it exposes a standard issuer URL, client ID, client secret, redirect URI, and group claim.

Keycloak-compatible providers can use `scripts/bootstrap-keycloak-client.py` to create the client from `.env`. Non-Keycloak providers should create the OIDC client in their own admin console and place the resulting values in `.env`.

For private networks where another layer already enforces access, set `HEADMASTER_AUTH_ENABLED=false` and keep Headmaster behind that trusted boundary.

## Local development

```bash
cp .env.example .env
pnpm install
pnpm typecheck
pnpm dev
```

## Docker

```bash
docker compose up -d --build
```

## Bootstrap OIDC client

If your identity provider is Keycloak-compatible, you can bootstrap the Headmaster client from `.env`:

```bash
cp .env.example .env
./bin/headmaster env:init
python3 scripts/bootstrap-keycloak-client.py
```

## Notes

- The browser never gets direct Headscale admin credentials.
- Headscale execution defaults to `docker exec` against the configured container.
- Runtime config is read from the live container environment, so Docker secrets do not need to be baked into the image.
- Policy validation works in both Docker and direct-binary modes. Policy apply supports both Headscale database mode and file-backed policy mode.
- Audit entries are written to `.data/audit.jsonl`.
- Release/tag workflow is documented in [RELEASE.md](./RELEASE.md).
- Contribution and repo policy guidance lives in [AGENTS.md](./AGENTS.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).
- Created by Pragith Prakash and maintained as a portable open-source project.
