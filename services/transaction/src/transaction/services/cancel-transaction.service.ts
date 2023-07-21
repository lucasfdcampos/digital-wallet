import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionType } from '../enums/transaction-type.enum';
import { ProducerService } from 'src/kafka/producer.service';
import { KafkaTopics } from 'src/common/enums/kafka-topics.enum';

@Injectable()
export class CancelTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly producerService: ProducerService,
  ) {}

  async execute(originalTransactionId: string): Promise<void> {
    const originalTransaction = await this.validateOriginalTransaction(
      originalTransactionId,
    );

    await this.producerService.produce({
      topic: KafkaTopics.CREATE_TRANSACTION,
      messages: [
        {
          value: JSON.stringify({
            walletId: originalTransaction.walletId,
            type: TransactionType.CANCELLATION,
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

    const canceledTransaction = await this.transactionRepository.findOne({
      where: {
        originalTransactionId: originalTransaction.id,
        type: TransactionType.CANCELLATION,
      },
    });

    if (canceledTransaction) {
      throw new UnprocessableEntityException(
        'The original transaction has already been canceled',
      );
    }

    const lastPurchaseTransaction = await this.findLastPurchaseTransaction(
      originalTransaction.walletId,
    );

    if (originalTransaction.id !== lastPurchaseTransaction.id) {
      throw new UnprocessableEntityException(
        'Cannot cancel the transaction as it is not the last purchase',
      );
    }

    return originalTransaction;
  }

  private async findLastPurchaseTransaction(
    walletId: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({
      where: {
        walletId: walletId,
        type: TransactionType.PURCHASE,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    if (!transaction) {
      throw new NotFoundException(
        `Last transaction of type ${TransactionType.PURCHASE} not found`,
      );
    }

    return transaction;
  }
}
