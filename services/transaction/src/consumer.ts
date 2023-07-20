import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './kafka/consumer.service';
import { KafkaTopics } from './common/enums/kafka-topics.enum';
import { CreateTransactionHandler } from './transaction/handler/create-transaction.handler';

@Injectable()
export class Consumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly createTransactionHandler: CreateTransactionHandler,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume(
      {
        topics: [KafkaTopics.CREATE_TRANSACTION],
        fromBeginning: true,
      },
      {
        /* eslint-disable */
        eachMessage: async ({ topic, partition, message }) => {
          if (topic === KafkaTopics.CREATE_TRANSACTION) {
            await this.createTransactionHandler.execute(
              JSON.parse(message.value.toString()),
            );
          }
        },
      },
    );
  }
}
