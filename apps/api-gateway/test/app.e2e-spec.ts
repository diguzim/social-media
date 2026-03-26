import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { RpcExceptionFilter } from '@repo/exception-filters';

function getErrorMessages(body: unknown): string[] {
  if (typeof body !== 'object' || body === null || !('message' in body)) {
    return [];
  }

  const message = (body as { message?: unknown }).message;
  return Array.isArray(message)
    ? message.filter((item): item is string => typeof item === 'string')
    : [];
}

describe('Users validation (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new RpcExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 400 when registering without username', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'Fake E2E User',
      email: 'fake-e2e-user@example.com',
      password: '123456',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    const messages = getErrorMessages(response.body);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages).toEqual(
      expect.arrayContaining([expect.stringMatching(/username/i)]),
    );
  });

  it('returns 400 when registering with non-whitelisted field', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      name: 'Fake E2E User',
      username: 'fake-e2e-user',
      email: 'fake-e2e-user@example.com',
      password: '123456',
      role: 'admin',
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    const messages = getErrorMessages(response.body);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('property role should not exist'),
      ]),
    );
  });

  it('returns 400 when login payload misses password', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/login')
      .send({
        email: 'fake-e2e-user@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    const messages = getErrorMessages(response.body);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages).toEqual(
      expect.arrayContaining([expect.stringMatching(/password/i)]),
    );
  });

  it('returns 400 when email verification confirm payload misses token', async () => {
    const response = await request(app.getHttpServer())
      .post('/users/email-verification/confirm')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      statusCode: 400,
      error: 'Bad Request',
    });
    const messages = getErrorMessages(response.body);
    expect(messages.length).toBeGreaterThan(0);
    expect(messages).toEqual(
      expect.arrayContaining([expect.stringMatching(/token/i)]),
    );
  });
});
