import { Injectable } from '@nestjs/common';
import { KafkaTopics } from 'src/common/enums/kafka-topics.enum';
import { TransactionCreated } from '../event/transaction-created';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Injectable()
export class CreateTransactionHandler {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  eventname = KafkaTopics.CREATE_TRANSACTION;

  async execute(event: TransactionCreated): Promise<void> {
    const transaction = this.transactionRepository.create({
      walletId: event.walletId,
      type: event.type,
      value: event.value,
      status: TransactionStatus.APPROVED,
    });
    await this.transactionRepository.save(transaction);
  }
}
