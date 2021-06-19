import request, { Test } from 'supertest';
import { Server } from 'http';
import { Mongoose } from 'mongoose';
import { seedDb, random } from '../__seed__';
import { RawUser } from '../lib/index';
const bcrypt = require('bcrypt');
const { mocks } = require('../mocks/index');
const { bootDB } = require('../models/index.ts');
const { bootServer } = require('../server.ts');
const jwt = require('jsonwebtoken');

const User = require('../models/user.ts');

const port = process.env.PORT_TEST;
const connectionString = process.env.DB_CONN_TEST;
const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

let server: Server;
let db: Mongoose | undefined;
let mockUsers: RawUser[];

describe('Integration tests - controllers/users.ts', () => {
  beforeAll(async () => {
    db = await bootDB(connectionString);
    if (db) {
      await db?.connection.db.dropDatabase();
      const seedData = await seedDb(db);
      mockUsers = seedData.users;
    }
    server = bootServer(port);
  });

  test('Mock users must be present', () => {
    expect(mockUsers).toHaveLength(10);
  });

  describe('User creation POST/signup', () => {
    let endpoint: Test;
    beforeEach(() => {
      endpoint = request(server).post('/signup');
    });
    test('should send status code 400 if missing field', async () => {
      const response = await endpoint.send({});
      expect(response.status).toBe(400);
    });

    test('should send status code 409 if username or email is taken', async () => {
      const response = await endpoint.send(mockUsers[random(mockUsers.length)]);
      expect(response.status).toBe(409);
    });

    test(`should return accessToken on creation with userID,
          password should be hashed with bcrypt in database,
          should save user in db with fields filled in signup form`, async () => {
      const firstMockUserCopy = { ...mocks.firstUser };
      const response = await endpoint.send(mocks.firstUser);
      expect(response.body).toHaveProperty('accessToken');

      const tokenData: { _id: string } = jwt.verify(
        response.body.accessToken,
        SECRET_KEY
      );
      expect(tokenData).toHaveProperty('_id');

      const user = await User.findById(tokenData._id);
      expect(user).toBeDefined();

      const isMatch: boolean = bcrypt.compareSync(
        mocks.firstUser.password,
        user.password
      );
      firstMockUserCopy.password = user.password;
      expect(isMatch).toBeTruthy();
      expect(user).toMatchObject(firstMockUserCopy);
    });
  });

  describe('Login user POST/login', () => {
    let endpoint: Test;
    beforeEach(() => {
      endpoint = request(server).post('/login');
    });
    test('should send status code 400 if missing field', async () => {
      const response = await endpoint.send({});
      expect(response.status).toBe(400);
    });

    test('should send status code 403 if user does not exist', async () => {
      const response = await endpoint.send(mocks.userLoginNotExist);
      expect(response.status).toBe(403);
    });

    test('should send status code 403 if password is incorrect', async () => {
      const mockUser = mockUsers[random(mockUsers.length)];
      const response = await endpoint.send({
        email: mockUser.email,
        password: 'thisisnotthepasswordbelieveme',
      });
      expect(response.status).toBe(403);
    });

    test('should return accessToken  with userID on successful login', async () => {
      const { email, password } = mockUsers[random(mockUsers.length)];
      const response = await endpoint.send({ email, password });
      expect(response.body).toHaveProperty('accessToken');
      const tokenData: { _id: string } = jwt.verify(
        response.body.accessToken,
        SECRET_KEY
      );
      expect(tokenData).toHaveProperty('_id');
      const user = await User.findById(tokenData._id);
      expect(user).toBeDefined();
    });
  });

  afterAll(async () => {
    await db?.connection.close();
    server.close();
  });
});
