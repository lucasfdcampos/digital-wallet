import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetTransactionService } from './services/get-transaction.service';
import { ListTransactionService } from './services/list-transaction.service';
import { CreateTransactionHandler } from './handler/create-transaction.handler';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionController],
  providers: [
    GetTransactionService,
    ListTransactionService,
    CreateTransactionHandler,
  ],
  exports: [CreateTransactionHandler],
})
export class TransactionModule {}
