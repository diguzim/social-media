Fix broken tests by changing test code only.

## Task

1. Determine the canonical test command from the root `package.json` `scripts.test`.
2. Default command for this repo: `pnpm test` (root test script runs `turbo run test`).
3. Run the tests and collect all failures.
4. Apply minimal, targeted fixes in test files only.
5. Repeat until there are no failing tests:
   - run tests
   - inspect failures
   - fix tests
   - run tests again
6. Do not refactor unrelated code.
7. If any failure cannot be fixed from tests alone and requires non-test application code changes:
   - do not implement the app-code fix
   - report the required app-code change instead
   - include why test-only changes are insufficient
   - include exact app files that would need to change
   - include the minimal proposed app change

## Stop condition

Stop only when all tests pass, or when blocked by required non-test app changes.

## Required final output

- Final status: `ALL TESTS PASS` or `BLOCKED BY APP CHANGE`
- Commands executed
- Test files changed
- If blocked: required app-code changes (no implementation)

## Scope

$ARGUMENTS
