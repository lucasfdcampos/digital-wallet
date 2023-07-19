import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormConfig from './orm.config';
import { join } from 'path';
import { TransactionModule } from './transaction/transaction.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...ormConfig,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      migrations: [join(__dirname, './migrations/*{.ts,.js}')],
    }),
    TransactionModule,
  ],
})
export class AppModule {}
