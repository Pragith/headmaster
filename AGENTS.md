# Headmaster Agent Guide

This repository is intended to be maintained as a mature open-source software project. Any agent or engineer working here must follow these rules.

## Product principles

- Keep `headmaster` modular and portable. Avoid fleet-specific assumptions in code, defaults, or docs.
- Prefer `.env`-driven configuration over hardcoded values.
- Keep browser code free of privileged Headscale credentials, raw Docker access, and direct server secrets.
- Treat Docker Compose as the default operator experience.

## Versioning and releases

- This project follows Semantic Versioning.
- Public-facing changes must update:
  - `package.json`
  - `CHANGELOG.md`
  - any affected install or upgrade docs
- Breaking changes require an explicit migration note in `CHANGELOG.md` and `README.md`.
- Release tags must use the form `vMAJOR.MINOR.PATCH`.

## Branching model

- `main` is always releasable.
- `dev` is the integration branch for pending work.
- Feature work must land on `feature/*` branches first.
- Do not develop directly on `main`.
- Merge flow:
  - `feature/*` -> `dev`
  - `dev` -> `main`

## Engineering rules

- Keep the Headscale adapter encapsulated behind server-side modules.
- Keep auth generic. Do not hardcode one identity provider, one realm, or one deployment topology.
- Prefer small, testable modules over page-local business logic.
- Avoid placeholder TODO/FIXME logic in shipped code unless it is explicitly documented in `TODO.md`.

## Documentation rules

- Keep `README.md` operator-focused and quick to start.
- Keep `AGENTS.md` authoritative for repo rules.
- Keep `TODO.md` grouped by scope rather than as a loose scratchpad.
- Installation, upgrade, and release instructions must remain accurate for a fresh operator with no internal context.
- Keep public docs free of fleet-internal branding, personal secrets, and deployment-only usernames.

## Safety rules

- Never commit real secrets, tokens, live `.env` files, or runtime data.
- Keep `.env.example` complete enough for a new user to bootstrap the app.
- If a workflow depends on external tools such as `docker`, `docker compose`, or `headscale`, document the requirement clearly and make `headmaster doctor` surface it.
