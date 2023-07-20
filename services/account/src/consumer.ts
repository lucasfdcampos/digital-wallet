import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './kafka/consumer.service';
import { KafkaTopics } from './common/enums/kafka-topics.enum';

@Injectable()
export class Consumer implements OnModuleInit {
  constructor(private readonly consumerService: ConsumerService) {}
  async onModuleInit() {
    await this.consumerService.consume(
      {
        topics: [KafkaTopics.CREATE_HISTORY],
        fromBeginning: true,
      },
      {
        /* eslint-disable */
        eachMessage: async ({ topic, partition, message }) => {
          // if (topic === KafkaTopics.CREATE_HISTORY) {
          //   // do something
          // }
        },
      },
    );
  }
}
