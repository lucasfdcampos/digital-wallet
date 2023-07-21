import { Injectable } from '@nestjs/common';
import { KafkaTopics } from 'src/common/enums/kafka-topics.enum';
import { TransactionCreated } from '../event/transaction-created';
import { CreateTransactionService } from '../services/create-transaction.service';
import { UpdateWalletHandler } from './update-wallet.handler';

@Injectable()
export class CreateTransactionHandler {
  constructor(
    private readonly createTransactionService: CreateTransactionService,
    private readonly updateWalletHandler: UpdateWalletHandler,
  ) {}

  eventname = KafkaTopics.CREATE_TRANSACTION;

  async execute(event: TransactionCreated): Promise<void> {
    const transaction = await this.createTransactionService.execute(event);
    await this.updateWalletHandler.execute(event, transaction);
  }
}
