# Testing Guidelines

This document defines the testing principles and standards for the TODO application. The goal is to keep tests reliable, maintainable, and aligned with the architecture of the project.

## General Principles

1. All new features must include appropriate automated tests.
2. Tests must be maintainable, readable, and focused on observable behavior.
3. Tests must be isolated and independent. Each test must set up its own data and must not rely on the execution of other tests.
4. Setup and teardown hooks are required where needed so tests can pass consistently across repeated runs.
5. Prefer smaller, targeted tests close to the behavior they validate before adding broader end-to-end coverage.

## Unit Tests

1. Use Jest to test individual functions and React components in isolation.
2. Unit test files must use the naming convention `*.test.js` or `*.test.ts`.
3. Backend unit tests must be placed in `packages/backend/__tests__/`.
4. Frontend unit tests must be placed in `packages/frontend/src/__tests__/`.
5. Unit test file names should match what they are testing, for example `app.test.js` for `app.js`.
6. Unit tests should mock external dependencies when needed so they stay focused on a single unit of behavior.

## Integration Tests

1. Use Jest + Supertest to test backend API endpoints with real HTTP requests.
2. Integration test files must use the naming convention `*.test.js` or `*.test.ts`.
3. Integration tests must be placed in `packages/backend/__tests__/integration/`.
4. Integration test file names should describe the behavior or API surface they cover, for example `todos-api.test.js`.
5. Integration tests should validate request and response behavior, including success cases and important error cases.

## End-To-End Tests

1. Use Playwright to test complete UI workflows through browser automation.
2. E2E test files must use the naming convention `*.spec.js` or `*.spec.ts`.
3. E2E tests must be placed in `tests/e2e/`.
4. E2E test file names should describe the user journey they cover, for example `todo-workflow.spec.js`.
5. Playwright tests must use one browser only.
6. Playwright tests must use the Page Object Model (POM) pattern for maintainability.
7. Limit E2E coverage to 5-8 critical user journeys, focusing on happy paths and key edge cases rather than exhaustive coverage.
8. E2E tests must remain isolated and must not depend on the order of execution.

## Port Configuration

1. Always use environment variables with sensible defaults for port configuration.
2. Backend services should use `const PORT = process.env.PORT || 3030;`.
3. The frontend should use React's default port of `3000`, while still allowing the `PORT` environment variable to override it.
4. Port configuration must support CI/CD workflows that need to assign ports dynamically.

## Quality Expectations

1. Tests should be deterministic and should not rely on timing-sensitive behavior unless that behavior is the subject of the test.
2. Assertions should be specific enough to explain failures clearly.
3. Avoid duplicating test logic when shared helpers or page objects can make tests easier to maintain.
4. When adding a bug fix, add or update a test that would fail without that fix.
5. Keep test scope intentional: use unit tests for isolated logic, integration tests for service boundaries, and E2E tests for critical user flows.