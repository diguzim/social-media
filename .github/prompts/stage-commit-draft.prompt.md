---
name: stage-commit-draft
description: Stage one logical commit group and propose a commit message without committing.
argument-hint: Describe which change group to stage (for example: "home feed only" or "copilot prompt only")
agent: agent
---

Use the repository instructions from [Copilot instructions](../copilot-instructions.md).

Goal:
Prepare one commit for review, but do NOT create the commit yet.

Task:

1. Inspect git status/diff.
2. Select only one logical commit group based on user context.
3. Stage only the files for that group.
4. Leave unrelated files unstaged.
5. Propose:
   - one best commit message
   - two alternative commit messages
6. Provide a short staged-change summary for review.
7. Explicitly stop before committing.

Important constraints:

- Never commit in this prompt.
- If a file looks mixed, call it out and avoid partial staging unless clearly safe.

User context: ${input:commitScope:Which change should be staged?}
