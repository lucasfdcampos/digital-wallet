import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionCreated } from '../event/transaction-created';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Injectable()
export class CreateTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(event: TransactionCreated): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      walletId: event.walletId,
      type: event.type,
      value: event.value,
      status: TransactionStatus.APPROVED,
    });
    return await this.transactionRepository.save(transaction);
  }
}
