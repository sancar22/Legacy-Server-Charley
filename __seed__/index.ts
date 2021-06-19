import { Mongoose } from 'mongoose';
import faker from 'faker';
import bcrypt from 'bcrypt';
import { RawUser } from '../lib/index';

export interface DbSeedData {
  users: RawUser[];
}

export const random = (max: number): number => Math.floor(Math.random() * max);

export const seedDb = async (db: Mongoose): Promise<DbSeedData> => {
  const users: RawUser[] = Array.from({ length: 10 }, () => ({
    username: faker.internet.userName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }));
  await db.connection.models.User.insertMany(
    users.map((user) => ({
      ...user,
      password: bcrypt.hashSync(user.password, 10),
    }))
  );
  return { users };
};
