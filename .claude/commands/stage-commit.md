Stage one logical commit group and propose a commit message without committing.

## Task

1. Inspect `git status` and `git diff`.
2. Select only one logical commit group based on the scope provided.
3. Stage only the files for that group.
4. Leave unrelated files unstaged.
5. Propose:
   - one best commit message
   - two alternative commit messages
6. Provide a short staged-change summary for review.
7. Explicitly stop before committing.

## Important constraints

- Never commit in this command.
- If a file looks mixed (changes belonging to multiple logical groups), call it out and avoid partial staging unless clearly safe.

## Scope

$ARGUMENTS
