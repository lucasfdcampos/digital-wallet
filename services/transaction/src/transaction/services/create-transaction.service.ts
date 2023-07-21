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

  async execute(data: TransactionCreated): Promise<Transaction> {
    const transaction = this.transactionRepository.create({
      walletId: data.walletId,
      type: data.type,
      value: data.value,
      status: TransactionStatus.APPROVED,
      originalTransactionId: data.originalTransactionId,
    });
    return await this.transactionRepository.save(transaction);
  }
}
