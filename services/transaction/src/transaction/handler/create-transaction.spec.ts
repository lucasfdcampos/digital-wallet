import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionHandler } from './create-transaction.handler';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '@transaction/entities/transaction.entity';
import { KafkaTopics } from '@common/enums/kafka-topics.enum';
import { TransactionCreated } from '../event/transaction-created';
import { TransactionStatus } from '@transaction/enums/transaction-status.enum';
import { ProducerService } from '@kafka/producer.service';
import { TransactionType } from '@transaction/enums/transaction-type.enum';

const someTransaction = new Transaction({
  id: '1',
  walletId: '1',
  value: 50,
  type: TransactionType.DEPOSIT,
  status: TransactionStatus.APPROVED,
  originalTransactionId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe('CreateTransactionHandler', () => {
  let createTransactionHandler: CreateTransactionHandler;
  let transactionRepository: Repository<Transaction>;
  let producerService: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionHandler,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            create: jest.fn().mockResolvedValue(someTransaction),
            save: jest.fn().mockResolvedValue(someTransaction),
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

    createTransactionHandler = module.get<CreateTransactionHandler>(
      CreateTransactionHandler,
    );
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
    producerService = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(createTransactionHandler).toBeDefined();
  });

  describe('execute', () => {
    it('should call createTransaction and producerService with the correct parameters', async () => {
      // Arrange
      const event: TransactionCreated = {
        walletId: '1',
        type: TransactionType.DEPOSIT,
        value: 50,
        originalTransactionId: '1',
      };

      jest.spyOn(transactionRepository, 'create').mockReturnValue(event as any);

      jest
        .spyOn(transactionRepository, 'save')
        .mockResolvedValue(someTransaction);

      // Act
      await createTransactionHandler.execute(event);

      // Assert
      expect(transactionRepository.create).toHaveBeenCalledWith({
        walletId: event.walletId,
        type: event.type,
        value: event.value,
        status: TransactionStatus.APPROVED,
        originalTransactionId: event.originalTransactionId,
      });

      expect(transactionRepository.save).toHaveBeenCalledWith(event);

      expect(producerService.produce).toHaveBeenCalledWith({
        topic: KafkaTopics.UPDATE_WALLET_AMOUNT,
        messages: [
          {
            value: JSON.stringify({
              walletId: event.walletId,
              type: event.type,
              value: event.value,
              status: TransactionStatus.APPROVED,
              transactionId: event.originalTransactionId,
            }),
          },
        ],
      });
    });
  });
});
