# SACVPN Pre-PR Audit Checklist

Run through this entire checklist before submitting ANY pull request. Every box must be checked or explicitly marked N/A with a reason. Claude Code should verify each item automatically when helping with a PR.

---

## Security Audit

- [ ] No secrets, API keys, or tokens appear in any changed file (grep for `sk_`, `pk_`, `key`, `secret`, `password`, `token` in the diff)
- [ ] No `.env` files are staged for commit (`git diff --cached --name-only | grep .env`)
- [ ] All auth checks use JWT claims from `_decodeJWT()`, never raw localStorage reads
- [ ] Admin routes are protected by BOTH `AdminRoute` component (frontend) AND `is_admin` check in the API endpoint (backend)
- [ ] All API calls go through `apiFetch()` or `apiJson()` — no raw `fetch()` or `axios` calls
- [ ] No new CORS origins added to the API
- [ ] No changes to Stripe webhook signature verification
- [ ] No private keys (WireGuard, JWT signing, Stripe secret) exposed in API responses, logs, or error messages
- [ ] No changes to bcrypt cost factor or password hashing logic
- [ ] No new `eval()`, `innerHTML`, or `dangerouslySetInnerHTML` usage
- [ ] `npm audit` shows no new high/critical vulnerabilities from added dependencies
- [ ] No changes to RLS policies or Supabase service role key usage patterns

## Code Quality

- [ ] TypeScript strict mode passes: `npx tsc --noEmit` exits cleanly
- [ ] ESLint passes: `npx eslint .` exits cleanly (or only pre-existing warnings)
- [ ] No `any` types in changed files
- [ ] No `console.log` statements in changed files
- [ ] No commented-out code blocks left in changed files
- [ ] All new functions have explicit return types
- [ ] All new components are functional (no class components)
- [ ] Imports follow project convention: libraries first, components second, utilities third
- [ ] No duplicate functionality — checked that existing code does not already solve the problem

## Functionality

- [ ] Feature works as intended in the browser (manual test)
- [ ] Error states are handled (network failure, invalid input, unauthorized)
- [ ] Loading states are shown during async operations
- [ ] Responsive layout works at mobile (375px), tablet (768px), and desktop (1280px) widths
- [ ] No regressions in existing features (test adjacent functionality)
- [ ] Edge cases considered: empty lists, long text, special characters, missing data

## Git Hygiene

- [ ] Branch is named `kevin/feature-name` or `kevin/fix-name`
- [ ] Branch is rebased on latest main (no merge conflicts)
- [ ] Commit messages are clear, descriptive, and in present tense
- [ ] No AI/Claude mentions in any commit message
- [ ] No unrelated changes bundled into the PR
- [ ] No large files (images, binaries, build artifacts) committed accidentally

## Dependencies

- [ ] No new dependencies added without justification
- [ ] No duplicate dependencies (e.g., adding axios when apiFetch exists)
- [ ] No alternative libraries for things already in the stack (icons, state, styling)
- [ ] `package-lock.json` changes are from `npm install` only (not manual edits)

## Performance

- [ ] No unnecessary re-renders (React components do not re-render on every state change)
- [ ] Images are optimized (compressed, appropriate format, lazy loaded if below fold)
- [ ] No large synchronous operations blocking the UI thread
- [ ] API calls are not duplicated (no fetch-on-every-render without proper dependency arrays)

---

## How to Use This Checklist

1. Before creating a PR, go through every item above
2. For each item, either check it off or note why it does not apply
3. If any security item fails, STOP and fix it before proceeding
4. Include a note in the PR description: "AUDIT.md checklist completed"
5. If Claude Code is helping, it should verify each item programmatically where possible (run tsc, eslint, grep for secrets, etc.)
