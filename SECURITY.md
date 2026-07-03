# Security Policy

## Reporting

Please report suspected security issues privately to the maintainers before opening a public issue. Include reproduction details, affected versions, deployment mode, and any mitigation you have already tested.

## Secrets

- Never commit real `.env` files
- Never commit live OIDC secrets
- Never commit runtime audit data
- Keep sample config values generic and non-identifying

## Scope

Security-sensitive areas include:

- OIDC login flow
- signed session cookies
- server-side command execution
- Docker socket access
- policy editing and mutation routes

## Disclosure expectations

- Give maintainers reasonable time to confirm and patch the issue before public disclosure
- Redact credentials, tokens, cookies, and private infrastructure details from reports
