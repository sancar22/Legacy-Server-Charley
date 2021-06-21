import request, { Test } from 'supertest';
import { Server } from 'http';
import { Mongoose } from 'mongoose';
import { seedDb, random } from '../__seed__';
import { RawUser, RecipeDB } from '../lib/index';
const bcrypt = require('bcrypt');
const { mocks } = require('../mocks/index');
const { bootDB } = require('../models/index.ts');
const { bootServer } = require('../server.ts');
const jwt = require('jsonwebtoken');
const { isTokenValid } = require('../middlewares/tokenValidation');

const User = require('../models/user.ts');
const Recipe = require('../models/recipe.ts');

const port = process.env.PORT_TEST;
const connectionString = process.env.DB_CONN_TEST;
const SECRET_KEY: string | undefined = process.env.SECRET_KEY;

let server: Server;
let db: Mongoose | undefined;
let mockUsers: RawUser[];
let mockRecipes: RecipeDB[];
let accessToken: string;
let randomLoggedInMockIndex: number;

describe('Integration tests - controllers', () => {
  beforeAll(async () => {
    db = await bootDB(connectionString);
    if (db) {
      await db?.connection.db.dropDatabase();
      const seedData = await seedDb(db);
      mockUsers = seedData.users;
      mockRecipes = seedData.recipes;
    }
    server = bootServer(port);
  });

  test('Mock users must be present', () => {
    expect(mockUsers).toHaveLength(10);
  });

  test('Mock recipes must be present', () => {
    expect(mockRecipes).toHaveLength(10);
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
      await User.deleteOne({ _id: user._id });
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

    test('should return accessToken  with userID on successful login, token should be in jwt store', async () => {
      randomLoggedInMockIndex = random(mockUsers.length);
      const { email, password } = mockUsers[randomLoggedInMockIndex];
      const response = await endpoint.send({ email, password });
      expect(response.body).toHaveProperty('accessToken');
      const tokenData: { _id: string } = jwt.verify(
        response.body.accessToken,
        SECRET_KEY
      );
      expect(tokenData).toHaveProperty('_id');
      expect(isTokenValid(response.body.accessToken)).toBeTruthy();
      const user = await User.findById(tokenData._id);
      expect(user).toBeDefined();
      accessToken = response.body.accessToken;
    });
  });

  describe('Profile GET/profile', () => {
    let endpoint: Test;
    beforeEach(() => {
      endpoint = request(server).get('/profile');
    });
    test('should return 401 if no auth headers are sent', async () => {
      const response = await endpoint;
      expect(response.status).toBe(401);
    });
    test('should return 401 if auth headers are sent with wrong bearer token', async () => {
      const response = await endpoint.set(
        'Authorization',
        'Bearer: notavalidjwttoken'
      );
      expect(response.status).toBe(401);
    });

    test('should return user if valid auth headers are set', async () => {
      const loggedInMockUserCopy: any = {
        ...mockUsers[randomLoggedInMockIndex],
      };
      delete loggedInMockUserCopy.password;
      const response = await endpoint.set(
        'Authorization',
        `Bearer: ${accessToken}`
      );
      expect(response.body).toMatchObject(loggedInMockUserCopy);
    });
  });

  describe('Get all but me GET/users', () => {
    let endpoint: Test;
    beforeEach(() => {
      endpoint = request(server).get('/users');
    });

    test('should return 401 if no auth headers are sent', async () => {
      const response = await endpoint;
      expect(response.status).toBe(401);
    });
    test('should return 401 if auth headers are sent with wrong bearer token', async () => {
      const response = await endpoint.set(
        'Authorization',
        'Bearer: notavalidjwttoken'
      );
      expect(response.status).toBe(401);
    });

    test(`should get all user's username except the username of the one making the request`, async () => {
      const userMakingRequest = mockUsers[randomLoggedInMockIndex];
      const response = await endpoint.set(
        'Authorization',
        `Bearer: ${accessToken}`
      );
      const expectedArrayResponse: string[] = mockUsers
        .filter((user) => user.email !== userMakingRequest.email)
        .map((user) => user.username);
      expect(expectedArrayResponse.sort()).toEqual(response.body.sort());
    });
  });

  describe('Delete recipe POST/deleteRecipe/:recipeId', () => {
    let endpoint: Test;
    let recipe: RecipeDB;
    beforeAll(async () => {
      const userMakingRequest = mockUsers[randomLoggedInMockIndex];
      const userDB = await User.findOne({ email: userMakingRequest.email });
      recipe = (await Recipe.find({ userID: userDB._id }))[0];
    });
    beforeEach(() => {
      endpoint = request(server).post('/users');
    });

    test('should return 401 if no auth headers are sent', async () => {
      const response = await request(server).post(
        `/deleteRecipe/${recipe._id}`
      );
      expect(response.status).toBe(401);
    });
    test('should return 401 if auth headers are sent with wrong bearer token', async () => {
      const response = await request(server)
        .post(`/deleteRecipe/${recipe._id}`)
        .set('Authorization', 'Bearer: notavalidjwttoken');
      expect(response.status).toBe(401);
    });

    test('should delete the recipe if headers are okay', async () => {
      const response = await request(server)
        .post(`/deleteRecipe/${recipe._id}`)
        .set('Authorization', `Bearer: ${accessToken}`);
      const recipeDeleted = await Recipe.findById(recipe._id);
      expect(response.status).toBe(200);
      expect(recipeDeleted).toBeNull();
    });
  });

  describe('Get recipes from friend POST/getFriendStore', () => {
    let endpoint: Test;
    let friendToSearch: RawUser;
    beforeAll(() => {
      const user = mockUsers[randomLoggedInMockIndex];
      friendToSearch = mockUsers.filter(
        (userMock) => userMock.email !== user.email
      )[random(mockUsers.length - 1)];
    });
    beforeEach(() => {
      endpoint = request(server).post('/getFriendStore');
    });

    test('should return 401 if no auth headers are sent', async () => {
      const response = await endpoint.send({
        username: friendToSearch.username,
      });
      expect(response.status).toBe(401);
    });
    test('should return 401 if auth headers are sent with wrong bearer token', async () => {
      const response = await endpoint
        .send({ username: friendToSearch.username })
        .set('Authorization', 'Bearer: notavalidjwttoken');
      expect(response.status).toBe(401);
    });

    test('should get all recipes from friend if headers are okay', async () => {
      const response = await endpoint
        .send({ username: friendToSearch.username })
        .set('Authorization', `Bearer: ${accessToken}`);
      const friendDB = await User.findOne({ email: friendToSearch.email });
      const expectedResponse = await Recipe.find({
        userID: friendDB._id,
      }).lean();
      expect(JSON.stringify(response.body)).toEqual(
        JSON.stringify(expectedResponse)
      );
    });
  });

  describe('Logout user GET/logout', () => {
    let endpoint: Test;
    beforeEach(() => {
      endpoint = request(server).get('/logout');
    });
    test('should return 401 if no auth headers are sent', async () => {
      const response = await endpoint;
      expect(response.status).toBe(401);
    });
    test('should return 401 if auth headers are sent with wrong bearer token', async () => {
      const response = await endpoint.set(
        'Authorization',
        'Bearer: notavalidjwttoken'
      );
      expect(response.status).toBe(401);
    });

    test('token should be removed from jwt storage after correct logout', async () => {
      expect(isTokenValid(accessToken)).toBeTruthy();
      const response = await endpoint.set(
        'Authorization',
        `Bearer: ${accessToken}`
      );
      expect(isTokenValid(accessToken)).toBeFalsy();
      expect(response.status).toBe(200);
    });
  });

  afterAll(async () => {
    await db?.connection.close();
    server.close();
  });
});
