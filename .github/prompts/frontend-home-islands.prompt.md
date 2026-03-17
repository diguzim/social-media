---
name: frontend-home-islands
description: Plan or implement the Home page progressive loading architecture using reusable loading primitives and island boundaries.
argument-hint: Optional focus such as "plan only", "implement loading primitives", or "implement Home islands"
agent: agent
---

Use the repository instructions from [Copilot instructions](../copilot-instructions.md).

Goal:
Turn the Home page into the reference implementation for progressive loading UX in `apps/user-portal`.

Task:

1. Inspect the current Home page, feed, create-post form, authenticated layout, and related services.
2. Produce (or implement, if requested) a concrete blueprint for Home using these islands:
   - profile summary island
   - create-post island
   - feed island
3. Introduce or reuse shared loading primitives under `src/components/loading/` before adding page-specific fallbacks.
4. Keep the authenticated shell (`Navbar` and other stable layout chrome) visible at all times.
5. Design Home loading behavior for these scenarios:
   - initial route load
   - section load
   - background refresh after data already exists
   - interaction pending after creating a post
6. Prefer local fallback UI with reserved space rather than page-wide blocking spinners.
7. When using React APIs:
   - use `Suspense` for local island boundaries if the data pattern supports it
   - use `useTransition`/`startTransition` for non-urgent feed refreshes after post creation
   - use cached profile data first when available, then revalidate in the background
8. Define the target file structure explicitly when planning. Prefer small focused components, for example:
   - `src/components/loading/LoadingBlock.tsx`
   - `src/components/loading/SectionSkeleton.tsx`
   - `src/components/loading/PendingButton.tsx`
   - `src/components/home/HomeProfileSummary.tsx`
   - `src/components/home/HomeFeedSection.tsx`
   - `src/components/home/HomeCreatePostSection.tsx`
9. Add or update tests that prove:
   - shell remains visible while a Home island is pending
   - already loaded Home sections remain visible during refresh
   - create-post prevents duplicate submission and shows inline pending feedback
10. Update affected docs when behavior or conventions change.

User focus: ${input:focus:Optional scope or implementation focus}
