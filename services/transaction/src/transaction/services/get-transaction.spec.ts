import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetTransactionService } from './get-transaction.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
import { TransactionType } from '@transaction/enums/transaction-type.enum';
import { TransactionStatus } from '@transaction/enums/transaction-status.enum';

const someTransaction = new Transaction({
  id: '1',
  walletId: '1',
  value: 100,
  type: TransactionType.DEPOSIT,
  status: TransactionStatus.APPROVED,
  originalTransactionId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe('GetTransactionService', () => {
  let getTransactionService: GetTransactionService;
  let transactionRepository: Repository<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTransactionService,
        {
          provide: getRepositoryToken(Transaction),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue(someTransaction),
          },
        },
      ],
    }).compile();

    getTransactionService = module.get<GetTransactionService>(
      GetTransactionService,
    );
    transactionRepository = module.get<Repository<Transaction>>(
      getRepositoryToken(Transaction),
    );
  });

  it('should be defined', () => {
    expect(getTransactionService).toBeDefined();
    expect(transactionRepository).toBeDefined();
  });

  describe('execute', () => {
    it('should return a transaction by id', async () => {
      // Act
      const result = await getTransactionService.execute('1');

      // Assert
      expect(result).toEqual(someTransaction);
      expect(transactionRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if transaction does not exist', async () => {
      // Arrange
      jest
        .spyOn(transactionRepository, 'findOneOrFail')
        .mockRejectedValue(new NotFoundException());

      // Act and Assert
      await expect(getTransactionService.execute('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
