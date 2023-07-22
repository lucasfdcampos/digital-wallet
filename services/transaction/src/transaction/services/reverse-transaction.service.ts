import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { TransactionType } from '../enums/transaction-type.enum';
import { ProducerService } from '../../kafka/producer.service';
import { KafkaTopics } from '@common/enums/kafka-topics.enum';
import { Transaction } from '../entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReverseTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly producerService: ProducerService,
  ) {}

  async execute(originalTransactionId: string): Promise<void> {
    const originalTransaction = await this.validateOriginalTransaction(
      originalTransactionId,
    );
    await this.validateOriginalTransactionAlreadyReversed(originalTransaction);

    await this.producerService.produce({
      topic: KafkaTopics.CREATE_TRANSACTION,
      messages: [
        {
          value: JSON.stringify({
            walletId: originalTransaction.walletId,
            type: TransactionType.REVERSAL,
            value: originalTransaction.value,
            originalTransactionId: originalTransaction.id,
          }),
        },
      ],
    });
  }

  private async validateOriginalTransaction(id: string): Promise<Transaction> {
    const originalTransaction = await this.transactionRepository.findOne({
      where: { id },
    });

    if (!originalTransaction) {
      throw new NotFoundException('Transaction does not exist');
    }

    if (originalTransaction.type !== TransactionType.PURCHASE) {
      throw new UnprocessableEntityException(
        `Transaction type must be ${TransactionType.PURCHASE}`,
      );
    }

    return originalTransaction;
  }

  private async validateOriginalTransactionAlreadyReversed(
    originalTransaction: Transaction,
  ): Promise<void> {
    const reversedTransaction = await this.transactionRepository.findOne({
      where: {
        originalTransactionId: originalTransaction.id,
        type: TransactionType.REVERSAL,
      },
    });

    if (reversedTransaction) {
      throw new UnprocessableEntityException(
        'The original transaction has already been reversed',
      );
    }
  }
}
