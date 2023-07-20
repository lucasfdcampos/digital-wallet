import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['kafka:9092'],
  });
  private readonly consumers: Consumer[] = [];

  async consume(topic: ConsumerSubscribeTopics, config: ConsumerRunConfig) {
    const consumer = this.kafka.consumer({ groupId: 'wallet-transaction' });
    await consumer.connect();
    await consumer.subscribe(topic);
    await consumer.run(config);
    this.consumers.push(consumer);
  }

  async pause(
    topics: {
      topic: string;
      partitions?: number[];
    }[],
  ) {
    this.consumers[0].pause(topics);
  }

  async topicsExists(topic: string) {
    const topics = await this.listTopics();
    return topics.some((topicInCluster) => topicInCluster == topic);
  }

  async listTopics() {
    return this.kafka.admin().listTopics();
  }

  async resume(
    topics: {
      topic: string;
      partitions?: number[];
    }[],
  ) {
    this.consumers[0].resume(topics);
  }

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }
}
