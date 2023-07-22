import { Test, TestingModule } from '@nestjs/testing';
import { CancelTransactionService } from './cancel-transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '../enums/transaction-type.enum';
import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ProducerService } from '../../kafka/producer.service';
import { KafkaTopics } from '@common/enums/kafka-topics.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

const originalTransaction = new Transaction({
  id: '1',
  walletId: '1',
  value: 100,
  type: TransactionType.PURCHASE,
  status: TransactionStatus.APPROVED,
  originalTransactionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe('CancelTransactionService', () => {
  let cancelTransactionService: CancelTransactionService;
  let transactionRepository: Repository<Transaction>;
  let producerService: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelTransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            findOne: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ProducerService,
          useValue: {
            produce: jest.fn(),
          },
        },
      ],
    }).compile();

    cancelTransactionService = module.get<CancelTransactionService>(
      CancelTransactionService,
    );
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    producerService = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(cancelTransactionService).toBeDefined();
    expect(transactionRepository).toBeDefined();
    expect(producerService).toBeDefined();
  });

  describe('execute', () => {
    it('should cancel the transaction and produce a new cancellation transaction', async () => {
      // Arrange
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValueOnce(originalTransaction);
      // original transaction already been canceleed
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValueOnce(null);
      // last purchase
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValueOnce(originalTransaction);

      // Act
      await cancelTransactionService.execute('1');

      // Assert
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: {
          originalTransactionId: '1',
          type: TransactionType.CANCELLATION,
        },
      });
      expect(producerService.produce).toHaveBeenCalledWith({
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
    });

    it('should throw NotFoundException if the original transaction does not exist', async () => {
      // Arrange
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValueOnce(null);

      // Act and Assert
      await expect(cancelTransactionService.execute('1')).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw UnprocessableEntityException if the original transaction is not of type "PURCHASE"', async () => {
      // Arrange
      const depositTransaction: Transaction = {
        id: '1',
        walletId: '1',
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.APPROVED,
        value: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        originalTransactionId: null,
      };

      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValueOnce(depositTransaction);

      // Act and Assert
      await expect(
        cancelTransactionService.execute(depositTransaction.id),
      ).rejects.toThrowError(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if the original transaction has already been cancelled', async () => {
      // Arrange
      const canceledTransaction: Transaction = new Transaction({
        id: '1',
        walletId: '1',
        value: 100,
        type: TransactionType.CANCELLATION,
        status: TransactionStatus.APPROVED,
        originalTransactionId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValueOnce(canceledTransaction);

      // Act and Assert
      await expect(
        cancelTransactionService.execute(canceledTransaction.id),
      ).rejects.toThrowError(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if the transaction to be cancelled is not the last purchase', async () => {
      // Arrange
      const anotherTransaction: Transaction = new Transaction({
        id: '2',
        walletId: '1',
        value: 100,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.APPROVED,
        originalTransactionId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValueOnce(originalTransaction);
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValueOnce(anotherTransaction);

      // Act and Assert
      await expect(
        cancelTransactionService.execute(originalTransaction.id),
      ).rejects.toThrowError(UnprocessableEntityException);
    });
  });
});
