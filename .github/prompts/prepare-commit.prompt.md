---
name: prepare-commit
description: Review current git changes and draft a clean commit message with a short summary.
argument-hint: Optional context, scope, or preferred commit style
agent: agent
---

Use the repository instructions from [Copilot instructions](../copilot-instructions.md).

Task:

1. Inspect the current git status and diff.
2. Detect whether the current changes contain more than one logical unit of work.
3. If they should be split, separate them into commit groups and give each group:
   - a short label
   - the exact files that belong in that commit
   - files that should stay out of that commit
4. If a file appears mixed or risky, call it out explicitly as maybe needing manual review or partial staging.
5. Summarize each proposed commit in 3-5 bullets.
6. Propose for each commit group:
   - one best commit message
   - two alternative commit messages
7. Prefer concise conventional commit style when appropriate.
8. End with a clear recommendation section in this format:
   - Commit 1: <label>
     - Stage: <files>
     - Leave unstaged: <files>
     - Message: <best message>

   - Commit 2: <label>
     - Stage: <files>
     - Leave unstaged: <files>
     - Message: <best message>

9. If the user asks to proceed with one commit only, focus only on that commit group and ignore the others.

Extra user context: ${input:userContext:Optional commit context or style preferences}
