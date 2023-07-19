/* eslint-disable */
import { join } from 'path';

module.exports = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  logging: true,
};