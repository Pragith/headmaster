# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning.

## [Unreleased]

No unreleased changes.

## [0.1.0] - 2026-07-03

### Added

- Initial public scaffold of `headmaster`, a modular Nuxt + Tailwind admin UI for Headscale.
- OIDC login flow with admin-group enforcement and signed server-side sessions.
- Server-side Headscale command adapter with Docker and direct binary execution modes.
- Nodes-first admin views for users, nodes, preauth keys, API keys, routes, enrollment, policy, settings, and audit history.
- Docker Compose packaging with a dedicated external and internal app port `41869`.
- Local CLI wrapper, installer script, release script, contribution docs, issue templates, labels manifest, and repo policy files.
- Generic `.env` templates and Keycloak bootstrap helpers suitable for open-source reuse.
- Local shadcn-like UI primitives with no DaisyUI runtime dependency.
- Browser-level smoke tests and GitHub Actions workflows for CI and release hygiene.

### Changed

- Expanded Headscale parity for user metadata, preauth key lifecycle, API key lifecycle, node tag and expiry controls, enrollment actions, and file-mode policy apply fallback.
- Hardened Docker secret hygiene by excluding live env files from the build context and reading runtime config from the live container environment.
