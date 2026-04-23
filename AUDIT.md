# AUDIT - SACVPN Web

**Date:** 2026-04-23
**Tier:** 2 (Near Complete)
**Completion (entry / exit):** 75% / 78%

## Stack
React 19 + Vite + JavaScript with Supabase, Stripe (live mode), React Router, Zustand, Framer Motion, Recharts. E2E via Playwright. Deployed on self-hosted Texas server behind Cloudflare. Related API package under `scvpn-api/`.

## Health Check Results
- Build (`npm run build`): PASS (14s, 1,143 KB main chunk flagged for code-split).
- Lint (`npx eslint .`): 24 errors, 1 warning (unused imports/vars, one CJS `require` in e2e-smoke).
- E2E (Playwright): not run this pass.
- Deployed check: not verified this pass.

## Gaps Found

### Critical - addressed this pass
**Secret values were committed to the public GitHub repo (`kstephens0331/SCVPN`).** GitHub's own secret-scanning had already flagged four of them; three were marked revoked by the owner in August 2025, one Stripe webhook signing secret remains as an open alert from October 2025.

I audited the currently-tracked files and found 49 live secret values in 16 tracked files. The owner has decided not to rotate the underlying secrets (server passwords and Supabase service role key remain in use; abuse monitoring is in place at the application layer). The committed exposure has been scrubbed this pass so it does not widen going forward:

Redactions applied across:
- `CREDENTIALS.md` (8)
- `RAILWAY_ENV_VARS.md` (6)
- `Deploy-VPNNodes.ps1` (6)
- `DEPLOY_MONITORING.md` (5)
- `LAUNCH_CHECKLIST.md` (4)
- `README_NEXT_STEPS.md` (4)
- `SETUP_YOUR_NODES.md` (4)
- `MANUAL_DEPLOYMENT_STEPS.md` (3)
- `DEPLOYMENT_SUMMARY.md` (2)
- `CURRENT_STATUS_REPORT.md` (1)
- `MIGRATION-RAILWAY-TO-TEXAS.md` (1)
- `VERIFY_WIREGUARD_PEER_REGISTRATION.md` (1)
- `deploy-dallas-central.sh` (1)
- `deploy-va-primary.sh` (1)
- `.env.local.bak` (1) - file also removed from tracking
- `.env.local.bak_20250824-083239` (1) - file also removed from tracking

Placeholder tokens used: `<REDACTED-SUPABASE-SERVICE-KEY>`, `<REDACTED-SUPABASE-ANON-KEY>`, `<REDACTED-STRIPE-LIVE-KEY>`, `<REDACTED-STRIPE-WEBHOOK-SECRET>`, `<REDACTED-STRIPE-PUBLISHABLE-KEY>`, `<REDACTED-SERVER-PASSWORD>`.

`.gitignore` updated to exclude `.env.local.bak*` pattern so these cannot recur.

Important to understand what this pass does NOT do:
- **Secrets are still in git history** at pre-redaction commits (public repo). Anyone who cloned or scraped the repo has them.
- **Underlying secrets are NOT rotated.** Per owner instruction, monitoring at the application layer stays the mitigation.
- **No history rewrite** (git-filter-repo / BFG).

### Important
- 24 ESLint errors (unused imports/vars, one CommonJS `require` in an ESM file).
- Main bundle 1,143 KB gzip 309 KB - should code-split.
- Root directory has 100+ runbook markdown files. Consider a `docs/` subtree.
- No pre-commit secret scanner (`gitleaks` or equivalent). One is installable in minutes and would prevent recurrence; added to Next Actions.

### Polish (deferred)
- Earlier uncommitted `AUDIT.md` was a pre-PR checklist; renamed to `PR-CHECKLIST.md` during the portfolio audit so this file can carry the portfolio audit record consistently across the portfolio.
- Mixed-case runbook file naming conventions (`FIX_`, `SETUP_`, `CREATE_`) suggest ad-hoc growth. Not a rename pass needed, but a table-of-contents README in `docs/` would help.

## Changes Made This Pass
- Redacted 49 live secret values from 16 tracked files (see list above).
- Removed `.env.local.bak` and `.env.local.bak_20250824-083239` from tracking. Updated `.gitignore` to exclude `.env.local.bak*` going forward.
- Renamed the prior `AUDIT.md` (pre-PR checklist) to `PR-CHECKLIST.md`.
- Created this `AUDIT.md` as the portfolio audit record.

## Still Open
- Secrets remain in git history of the public repo (owner decision).
- Install pre-commit secret scanner (gitleaks).
- 24 ESLint errors.
- Code-split main bundle.
- Docs reorganization.
- E2E Playwright runs in CI.
- The still-open GitHub secret-scanning alert (Alert 4) can now be resolved in the GitHub UI as "revoked - won't fix" if that matches the owner's decision.

## Next Actions for This Project
1. Install `gitleaks` as a pre-commit hook. Single binary + config file; catches the same patterns going forward.
2. Close the remaining GitHub secret-scanning alert (Alert 4) with a "revoked / won't fix" note since the underlying secret management is now monitoring-based.
3. Lint cleanup pass (24 errors to zero).
4. Code-split the 1.1 MB main chunk.
5. Move root-level MD files into a `docs/` subtree with a README.md table of contents.
