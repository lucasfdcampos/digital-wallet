import { Test, TestingModule } from '@nestjs/testing';
import { ReverseTransactionService } from './reverse-transaction.service';
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

describe('ReverseTransactionService', () => {
  let reverseTransactionService: ReverseTransactionService;
  let transactionRepository: Repository<Transaction>;
  let producerService: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReverseTransactionService,
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

    reverseTransactionService = module.get<ReverseTransactionService>(
      ReverseTransactionService,
    );
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    producerService = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(reverseTransactionService).toBeDefined();
    expect(transactionRepository).toBeDefined();
    expect(producerService).toBeDefined();
  });

  describe('execute', () => {
    it('should reverse the transaction and produce a new reversal transaction', async () => {
      // Arrange
      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValueOnce(originalTransaction);
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValueOnce(null);

      // Act
      await reverseTransactionService.execute('1');

      // Assert
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(transactionRepository.findOne).toHaveBeenCalledWith({
        where: {
          originalTransactionId: '1',
          type: TransactionType.REVERSAL,
        },
      });
      expect(producerService.produce).toHaveBeenCalledWith({
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
    });

    it('should throw NotFoundException if the original transaction does not exist', async () => {
      // Arrange
      jest.spyOn(transactionRepository, 'findOne').mockResolvedValueOnce(null);

      // Act and Assert
      await expect(reverseTransactionService.execute('1')).rejects.toThrowError(
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
        reverseTransactionService.execute(depositTransaction.id),
      ).rejects.toThrowError(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if the original transaction has already been reversed', async () => {
      // Arrange
      const reversedTransaction: Transaction = new Transaction({
        id: '1',
        walletId: '1',
        value: 100,
        type: TransactionType.REVERSAL,
        status: TransactionStatus.APPROVED,
        originalTransactionId: '1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      });

      jest
        .spyOn(transactionRepository, 'findOne')
        .mockResolvedValueOnce(reversedTransaction);

      // Act and Assert
      await expect(
        reverseTransactionService.execute(reversedTransaction.id),
      ).rejects.toThrowError(UnprocessableEntityException);
    });
  });
});
