import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormConfig from './orm.config';
import { join } from 'path';
import { TransactionModule } from './transaction/transaction.module';
import { KafkaModule } from './kafka/kafka.module';
import { Consumer } from './consumer';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    KafkaModule,
    TypeOrmModule.forRoot({
      ...ormConfig,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      migrations: [join(__dirname, './migrations/*{.ts,.js}')],
    }),
    MongooseModule.forRoot(process.env.MONGO_URL),
    TransactionModule,
    AuditModule,
  ],
  providers: [Consumer],
})
export class AppModule {}
