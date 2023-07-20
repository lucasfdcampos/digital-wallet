import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormConfig from './orm.config';
import { join } from 'path';
import { TransactionModule } from './transaction/transaction.module';
import { KafkaModule } from './kafka/kafka.module';
import { Consumer } from './consumer';

@Module({
  imports: [
    KafkaModule,
    TypeOrmModule.forRoot({
      ...ormConfig,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      migrations: [join(__dirname, './migrations/*{.ts,.js}')],
    }),
    TransactionModule,
  ],
  providers: [Consumer],
})
export class AppModule {}
