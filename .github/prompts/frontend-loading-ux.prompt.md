---
name: frontend-loading-ux
description: Plan or implement progressive loading UX using islands, Suspense boundaries, and interaction-pending patterns.
argument-hint: Scope (for example: "home + feed", "profile only", "all forms")
agent: agent
---

Use the repository instructions from [Copilot instructions](../copilot-instructions.md).

Goal:
Design and/or implement progressive loading UX without blocking already loaded UI.

Task:

1. Inspect the current routes/pages/components in `apps/user-portal` for loading behavior.
2. Propose (or implement, if requested) island boundaries for the selected scope.
3. Ensure loading strategy covers:
   - initial route load
   - section load
   - background refresh
   - interaction pending (form submit/actions)
4. Prefer section-level fallbacks over page-level blocking loaders.
5. Use React APIs when appropriate:
   - `Suspense` for section fallback boundaries
   - `useTransition`/`startTransition` for non-urgent state updates
   - `useDeferredValue` for input-heavy filtering/search
6. Keep layout stable during loading (avoid visual jumps).
7. Add or update tests (unit and/or e2e) for pending/loaded coexistence and duplicate-submit prevention.
8. Update docs affected by the change (`apps/user-portal/README.md` and others if needed).

User scope: ${input:scope:Which page/feature should be planned or implemented?}
