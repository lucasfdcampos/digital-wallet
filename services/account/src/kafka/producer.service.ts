import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    clientId: 'account',
    brokers: [process.env.KAFKA_URL],
  });

  private readonly producer: Producer = this.kafka.producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async listTopics() {
    return this.kafka.admin().listTopics();
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }
}
