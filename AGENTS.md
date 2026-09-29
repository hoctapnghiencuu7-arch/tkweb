# TKWEB PROJECT — NON-NEGOTIABLE AGENT RULES

Read and obey this file before editing this repository.

## Core behavior
- Preserve working behavior unless the task explicitly requires a change.
- Prefer the smallest safe patch.
- Never rewrite the project just to solve a local issue.
- Never delete or replace shared UI (header/footer/fonts/layout) without first mapping all consumers.
- Never change the global font, root layout, CSS reset, theme, router, or shared components for a page-local problem.
- Never add a new framework, UI library, or dependency unless it is demonstrably required.
- Never "fix" CSS with broad `!important`, arbitrary negative margins, or magic pixel offsets.
- Never claim a feature works because the page renders; verify the relevant user flow.

## Change discipline
Before any edit:
1. Inspect repository structure and relevant files.
2. Identify the source of truth for the behavior.
3. State the exact files that will change.
4. State the regression risks.
5. If the task spans multiple pages, make a plan first.

During edits:
- Keep diffs localized.
- Do not mass-reformat unrelated files.
- Do not remove code unless you have verified references/usages.
- Preserve existing public APIs and data contracts unless the task requires a versioned change.
- When touching shared CSS/components, inspect all pages that consume them.

## Regression gates
After each logical change-set:
- run the repository's real build/lint/test commands when available;
- inspect the diff;
- check for unexpected deletions;
- for UI changes, verify at least desktop + mobile;
- for shared UI changes, verify every impacted page.

If a change introduces unrelated breakage:
STOP, identify the regression, revert/repair the risky change, and continue with a smaller patch.

## Issue traceability
Every bug discovered during repair must be tracked with:
BUG-ID, severity, page, element, observed behavior, expected behavior,
root-cause evidence, fix, files changed, regression check, status.

## Priority
P0/security/data-loss > P1/broken user flow > P2/major UI/UX > P3/polish.

## CMS/Admin
The admin "Website Editor" must be treated as a real application feature:
- no fake success messages;
- no pretending client-only state is persistent;
- distinguish draft from published content;
- protect admin operations server-side where a backend exists;
- do not store sensitive credentials in browser storage.

## Stop conditions
Stop before making more edits if:
- build/test becomes newly broken;
- a shared header/footer/font breaks multiple pages;
- a change unexpectedly modifies many unrelated files;
- a data model/API contract is unclear;
- deletion is required but references cannot be proven absent.

## Completion
"Done" means the defined acceptance criteria pass, not merely that code compiles.
