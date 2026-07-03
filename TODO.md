# TODO

## Scope: Foundation

- [x] Scaffold a standalone `headmaster` app in its own repository.
- [x] Make the runtime modular and `.env`-driven.
- [x] Add Docker Compose as the default deployment model.
- [x] Add a local `headmaster` CLI wrapper for common operations.
- [x] Add curl-based installation entrypoint scripts.

## Scope: Product

- [x] Add users, nodes, keys, routes, policy, settings, and audit views.
- [x] Add API key and enrollment views.
- [x] Keep nodes as the default first view.
- [x] Remove dashboard-style overview cards and mock-looking defaults.
- [x] Replace DaisyUI-dependent styling with local shadcn-like UI primitives.
- [x] Keep Headscale credentials server-side only.
- [x] Support OIDC login and admin-group enforcement.
- [x] Add node tagging controls and richer key lifecycle UX.
- [ ] Add richer route discovery and approval UX when advertised routes exist.
- [ ] Add optional read-only role support beyond a single global flag.

## Scope: Open Source Maturity

- [x] Add SemVer versioning and release notes scaffolding.
- [x] Add AGENTS.md with software development and versioning rules.
- [x] Add CONTRIBUTING, SECURITY, labels, issue templates, and release workflow stubs.
- [x] Remove fleet-specific branding and personal bootstrap defaults from public templates.
- [ ] Add example screenshots and a demo deployment guide.

## Scope: Releases

- [x] Add a release helper script and tag workflow notes.
- [x] Cut and publish the first public release tag after live verification and push.
