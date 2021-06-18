import request, { Test } from 'supertest';
import { Server } from 'http';
import { Mongoose } from 'mongoose';
const { mocks } = require('../mocks/index');
const { bootDB } = require('../models/index.ts');
const { bootServer } = require('../server.ts');

const User = require('../models/user.ts');

const port = process.env.PORT_TEST;
const connectionString = process.env.DB_CONN_TEST;

let server: Server;
let db: Mongoose | undefined;

describe('Integration tests - controllers/users.ts', () => {
  beforeAll(async () => {
    db = await bootDB(connectionString);
    await db?.connection.db.dropDatabase();
    server = bootServer(port);
    await User.create(mocks.firstUser);
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
    it('should send status code 400 if missing field', async () => {
      const responseOnlyEmail = await endpoint.send({
        email: mocks.firstUser.email,
      });
      const responseOnlyPassword = await endpoint.send({
        email: mocks.firstUser.password,
      });
      const responseOnlyUsername = await endpoint.send({
        email: mocks.firstUser.username,
      });
      expect(responseOnlyEmail.status).toBe(400);
      expect(responseOnlyPassword.status).toBe(400);
      expect(responseOnlyUsername.status).toBe(400);
    });
  });
});
