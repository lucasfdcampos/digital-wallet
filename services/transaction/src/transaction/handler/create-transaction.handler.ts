import { Injectable } from '@nestjs/common';
import { KafkaTopics } from 'src/common/enums/kafka-topics.enum';
import { TransactionCreated } from '../event/transaction-created';

@Injectable()
export class CreateTransactionHandler {
  eventname = KafkaTopics.CREATE_TRANSACTION;

  async execute(event: TransactionCreated): Promise<void> {
    console.log(event);
  }
}
