# Release Process

## Versioning

This project uses Semantic Versioning and annotated Git tags in the form `vMAJOR.MINOR.PATCH`.

## Standard flow

1. Merge completed feature work into `dev`
2. Validate docs, install flow, and Docker Compose behavior
3. Update:
   - `package.json`
   - `CHANGELOG.md`
   - any release notes
4. Merge `dev` into `main`
5. Create and push the release tag

## Pre-release checks

- Verify `.env.example` still uses generic sample values only
- Verify `README.md` and install docs match the current operator flow
- Verify no internal hostnames, usernames, or private infrastructure references appear in public-facing docs
- Run the relevant test and validation steps for the release

## Helper

```bash
./scripts/release.sh 0.1.1
```

This script validates the version, creates an annotated tag, and prints the push command.
