import { Module } from '@nestjs/common';
import { TransactionController } from './transaction.controller';
import { Transaction } from './entities/transaction.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GetTransactionService } from './services/get-transaction.service';
import { ListTransactionService } from './services/list-transaction.service';
import { CreateTransactionHandler } from './handler/create-transaction.handler';
import { CancelTransactionService } from './services/cancel-transaction.service';
import { ReverseTransactionService } from './services/reverse-transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction])],
  controllers: [TransactionController],
  providers: [
    GetTransactionService,
    ListTransactionService,
    CreateTransactionHandler,
    CancelTransactionService,
    ReverseTransactionService,
  ],
  exports: [CreateTransactionHandler],
})
export class TransactionModule {}
