import { Injectable } from '@nestjs/common';
import { KafkaTopics } from 'src/common/enums/kafka-topics.enum';
import { TransactionCreated } from '../event/transaction-created';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { ProducerService } from 'src/kafka/producer.service';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class UpdateWalletHandler {
  constructor(private readonly producerService: ProducerService) {}

  async execute(
    event: TransactionCreated,
    transaction: Transaction,
  ): Promise<void> {
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
}
