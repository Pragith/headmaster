# Contributing

Thanks for helping improve Headmaster.

## Branching

- Create feature branches from `dev`
- Use branch names like `feature/oidc-hardening` or `feature/routes-editor`
- Open pull requests into `dev`
- Merge `dev` into `main` only when the release is ready

## Versioning

- Follow Semantic Versioning
- Update `CHANGELOG.md` for all user-visible changes
- Record breaking changes and migration notes explicitly

## Local development

```bash
cp .env.example .env
./bin/headmaster env:init
./bin/headmaster doctor
./bin/headmaster up
```

Use neutral sample values when updating docs or `.env.example`. Public-facing examples should stay portable across environments and should not include personal usernames, private domains, or internal infrastructure details.

## Pull requests

- Keep PRs scoped
- Include operator-facing impact
- Include docs updates when behavior changes
- Note whether the change affects install, upgrade, auth, or release flow
- Mention any new environment variables or changed defaults

## Reporting bugs and ideas

- Use the issue templates for defects and feature proposals when possible
- Include enough environment detail for maintainers to reproduce the problem without sharing secrets
