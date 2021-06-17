import { Request, Response } from 'express';

const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

const router = require('./router');

const { PORT } = process.env;

const app = express();

app
  .use(morgan('dev'))
  .use(cors())
  .use(express.json())
  .use(router)
  .get('/', (_: Request, res: Response) => {
    res.status(200).send('Hello, stranger!');
  })
  .get('*', (_: Request, res: Response) => {
    res.status(404).send('Sorry, not found 😞');
  })
  .listen(PORT, () => {
    console.log(`🚀 server listening on port: ${PORT}`);
  });
