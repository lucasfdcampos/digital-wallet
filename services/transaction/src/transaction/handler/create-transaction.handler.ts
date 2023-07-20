import { Injectable } from '@nestjs/common';
import { KafkaTopics } from 'src/common/enums/kafka-topics.enum';

@Injectable()
export class CreateTransactionHandler {
  eventname = KafkaTopics.CREATE_TRANSACTION;

  async execute(event: any): Promise<void> {
    console.log('consumer', event);
  }
}
