import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AuthModule } from '../src/auth/auth.module';
import { UsersService } from '../src/users/users.service';

type StoredUser = {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
};

describe('AuthController (e2e)', () => {
  let app: INestApplication<App>;
  let usersByEmail: Map<string, StoredUser>;
  let nextId = 1;

  const asRecord = (value: unknown): Record<string, unknown> => {
    if (typeof value !== 'object' || value === null) {
      throw new Error('Expected object response body');
    }
    return value as Record<string, unknown>;
  };

  beforeEach(async () => {
    usersByEmail = new Map<string, StoredUser>();
    nextId = 1;

    const usersServiceMock = {
      findByEmail(email: string) {
        return Promise.resolve(usersByEmail.get(email) ?? null);
      },
      createUser(input: { email: string; name: string; passwordHash: string }) {
        const createdUser: StoredUser = {
          id: nextId++,
          email: input.email,
          name: input.name,
          passwordHash: input.passwordHash,
          createdAt: new Date(),
        };

        usersByEmail.set(createdUser.email, createdUser);
        return Promise.resolve({
          id: createdUser.id,
          email: createdUser.email,
          name: createdUser.name,
          createdAt: createdUser.createdAt,
        });
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(UsersService)
      .useValue(usersServiceMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('register -> login -> me', async () => {
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'sam@example.com',
        name: 'Sam',
        password: 'secret123',
      })
      .expect(201);

    const registerBody = asRecord(registerResponse.body);
    const registerUser = asRecord(registerBody.user);
    expect(registerUser.email).toBe('sam@example.com');
    expect(registerBody.accessToken).toBeDefined();

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'sam@example.com',
        password: 'secret123',
      })
      .expect(201);

    const loginBody = asRecord(loginResponse.body);
    const accessToken = loginBody.accessToken;
    expect(accessToken).toBeDefined();
    if (typeof accessToken !== 'string') {
      throw new Error('Expected string accessToken');
    }

    const meResponse = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const meBody = asRecord(meResponse.body);
    expect(meBody.email).toBe('sam@example.com');
    expect(meBody.userId).toBe(1);
  });

  it('rejects /auth/me without token', async () => {
    await request(app.getHttpServer()).get('/auth/me').expect(401);
  });

  it('rejects /auth/me with invalid token', async () => {
    await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', 'Bearer not-a-real-token')
      .expect(401);
  });

  it('rejects login with wrong password', async () => {
    await request(app.getHttpServer()).post('/auth/register').send({
      email: 'sam@example.com',
      name: 'Sam',
      password: 'secret123',
    });

    await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'sam@example.com',
        password: 'wrong-password',
      })
      .expect(401);
  });
});
