import request, { Test } from 'supertest';
import { Server } from 'http';
import { Mongoose } from 'mongoose';
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

describe('Integration tests - controllers/users.ts', () => {
  beforeAll(async () => {
    db = await bootDB(connectionString);
    await db?.connection.db.dropDatabase();
    server = bootServer(port);
  });

  afterAll(async () => {
    await db?.connection.close();
    server.close();
  });

  describe('User creation POST/signup', () => {
    let endpoint: Test;
    beforeEach(() => {
      endpoint = request(server).post('/signup');
    });
    afterEach(async () => {
      await User.deleteMany();
    });
    test('should send status code 400 if missing field', async () => {
      const response = await endpoint.send({});
      expect(response.status).toBe(400);
    });

    test('should send status code 409 if username or email is taken', async () => {
      await User.create(mocks.firstUser);
      const response = await endpoint.send(mocks.firstUser);
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
});
