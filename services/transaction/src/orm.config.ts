import { join } from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const ormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  logging: true,
};

export const developmentConfig: TypeOrmModuleOptions = {
  ...ormConfig,
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/**/*.entity{.js,.ts}'],
  migrations: [join(__dirname, './migrations/*{.ts,.js}')],
};
