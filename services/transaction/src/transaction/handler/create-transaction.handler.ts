import { Injectable } from '@nestjs/common';
import { KafkaTopics } from '@common/enums/kafka-topics.enum';
import { TransactionCreated } from '../event/transaction-created';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '@transaction/entities/transaction.entity';
import { Repository } from 'typeorm';
import { TransactionStatus } from '@transaction/enums/transaction-status.enum';
import { ProducerService } from '@kafka/producer.service';

@Injectable()
export class CreateTransactionHandler {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly producerService: ProducerService,
  ) {}

  eventname = KafkaTopics.CREATE_TRANSACTION;

  async execute(event: TransactionCreated): Promise<void> {
    const transaction = await this.createTransaction(event);

    await this.producerService.produce({
      topic: KafkaTopics.UPDATE_WALLET_AMOUNT,
      messages: [
        {
          value: JSON.stringify({
            walletId: event.walletId,
            type: event.type,
            value: event.value,
            status: TransactionStatus.APPROVED,
            transactionId: transaction.id,
          }),
        },
      ],
    });
  }

  private async createTransaction(
    data: TransactionCreated,
  ): Promise<Transaction> {
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
