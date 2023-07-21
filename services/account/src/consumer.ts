import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './kafka/consumer.service';
import { KafkaTopics } from './common/enums/kafka-topics.enum';
import { UpdateWalletAmountHandler } from './wallet/handler/update-wallet-amount.handler';

@Injectable()
export class Consumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly updateWalletAmountHandler: UpdateWalletAmountHandler,
  ) {}
  async onModuleInit() {
    await this.consumerService.consume(
      {
        topics: [KafkaTopics.UPDATE_WALLET_AMOUNT],
        fromBeginning: true,
      },
      {
        /* eslint-disable */
        eachMessage: async ({ topic, partition, message }) => {
          if (topic === KafkaTopics.UPDATE_WALLET_AMOUNT) {
            await this.updateWalletAmountHandler.execute(
              JSON.parse(message.value.toString())
            );
          }
        },
      },
    );
  }
}
