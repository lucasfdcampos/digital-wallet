import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from './kafka/consumer.service';
import { KafkaTopics } from './common/enums/kafka-topics.enum';
import { CreateTransactionHandler } from './transaction/handler/create-transaction.handler';
import { AuditService } from './audit/audit.service';

@Injectable()
export class Consumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly createTransactionHandler: CreateTransactionHandler,
    private readonly auditService: AuditService,
  ) {}

  async onModuleInit() {
    await this.consumerService.consume(
      {
        topics: [KafkaTopics.CREATE_TRANSACTION, KafkaTopics.CREATE_AUDIT],
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
          if (topic === KafkaTopics.CREATE_AUDIT) {
            await this.auditService.create(
              JSON.parse(message.value.toString()),
            )
          }
        },
      },
    );
  }
}
