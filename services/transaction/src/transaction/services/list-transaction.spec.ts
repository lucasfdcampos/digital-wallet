import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ListTransactionService } from './list-transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { ListTransactionParamsDto } from '../dto/list-transaction-query-params.dto';
import { TransactionType } from '@transaction/enums/transaction-type.enum';
import { TransactionStatus } from '@transaction/enums/transaction-status.enum';
import { SortType } from '@transaction/enums/sort-type.enum';

const transactionList: Transaction[] = [
  new Transaction({
    id: '1',
    walletId: '1',
    value: 100,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.APPROVED,
    originalTransactionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }),
  new Transaction({
    id: '2',
    walletId: '1',
    value: 100,
    type: TransactionType.DEPOSIT,
    status: TransactionStatus.APPROVED,
    originalTransactionId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }),
];

const queryParams: ListTransactionParamsDto = {
  walletId: '1',
  createdAtStart: new Date('2023-07-011T00:00:00'),
  createdAtEnd: new Date('2023-07-311T00:00:00'),
  offset: 0,
  limit: 10,
  sort: SortType.ASC,
};

describe('ListTransactionService', () => {
  let listTransactionService: ListTransactionService;
  let transactionRepository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListTransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            findAndCount: jest.fn().mockResolvedValue([transactionList, 2]),
          },
        },
      ],
    }).compile();

    listTransactionService = module.get<ListTransactionService>(
      ListTransactionService,
    );
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(listTransactionService).toBeDefined();
    expect(transactionRepository).toBeDefined();
  });

  describe('execute', () => {
    it('should list transactions with valid query', async () => {
      // Act
      const result = await listTransactionService.execute(queryParams);

      // Assert
      expect(result).toEqual({
        totalCount: transactionList.length,
        hasMore: false,
        limit: queryParams.limit,
        offset: queryParams.offset,
        data: transactionList,
      });
    });

    it('should throw BadRequestException when createdAtStart is after createdAtEnd', async () => {
      // Arrange
      const invalidParams: ListTransactionParamsDto = {
        ...queryParams,
        createdAtStart: new Date('2023-07-31T00:00:00'),
        createdAtEnd: new Date('2023-07-01T00:00:00'),
      };

      // Act and Assert
      await expect(
        listTransactionService.execute(invalidParams),
      ).rejects.toThrowError(BadRequestException);
    });
  });
});
