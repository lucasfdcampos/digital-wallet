import { Injectable, OnModuleInit } from '@nestjs/common';
import { KafkaTopics } from './common/enums/kafka-topics.enum';
import { ConsumerService } from './kafka/consumer.service';

@Injectable()
export class Consumer implements OnModuleInit {
  constructor(private readonly consumerService: ConsumerService) {}
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
            // do something
          }
        },
      },
    );
  }
}
