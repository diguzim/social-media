import { faker } from "@faker-js/faker";

export interface TestUser {
  id?: string;
  name: string;
  username: string;
  email: string;
  password: string;
}

const defaultPassword = "TestPass123!";
const FAKE_E2E_NAME_PREFIX = "Fake E2E";
const FAKE_E2E_USERNAME_PREFIX = "fakee2e";
const FAKE_E2E_EMAIL_PREFIX = "fake-e2e";

export function buildTestUser(overrides: Partial<TestUser> = {}): TestUser {
  const uniqueSuffix = `${Date.now()}-${faker.number.int({ min: 1000, max: 9999 })}`;
  const fakeName = `${FAKE_E2E_NAME_PREFIX} ${faker.person.fullName()}`;
  const fakeUsername = `${FAKE_E2E_USERNAME_PREFIX}_${uniqueSuffix}`;
  const fakeEmail = `${FAKE_E2E_EMAIL_PREFIX}+${uniqueSuffix}@example.com`;

  return {
    name: fakeName,
    username: fakeUsername,
    email: fakeEmail,
    password: defaultPassword,
    ...overrides,
  };
}
