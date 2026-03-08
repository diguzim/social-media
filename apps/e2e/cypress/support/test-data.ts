import { faker } from "@faker-js/faker";

export interface TestUser {
  name: string;
  email: string;
  password: string;
}

const defaultPassword = "TestPass123!";
const FAKE_E2E_NAME_PREFIX = "Fake E2E";
const FAKE_E2E_EMAIL_PREFIX = "fake-e2e";

export function buildTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const uniqueSuffix = `${Date.now()}-${faker.number.int({ min: 1000, max: 9999 })}`;
  const fakeName = `${FAKE_E2E_NAME_PREFIX} ${faker.person.fullName()}`;
  const fakeEmail = `${FAKE_E2E_EMAIL_PREFIX}+${uniqueSuffix}@example.com`;

  return {
    name: fakeName,
    email: fakeEmail,
    password: defaultPassword,
    ...overrides,
  };
}
