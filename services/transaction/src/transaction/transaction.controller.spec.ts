import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { ListTransactionService } from './services/list-transaction.service';
import { GetTransactionService } from './services/get-transaction.service';
import { CancelTransactionService } from './services/cancel-transaction.service';
import { ReverseTransactionService } from './services/reverse-transaction.service';
import { ListTransactionParamsDto } from './dto/list-transaction-query-params.dto';
import { Transaction } from './entities/transaction.entity';
import { TransactionType } from './enums/transaction-type.enum';
import { TransactionStatus } from './enums/transaction-status.enum';
import { SortType } from './enums/sort-type.enum';

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

describe('TransactionController', () => {
  let transactionController: TransactionController;
  let listTransactionService: ListTransactionService;
  let getTransactionService: GetTransactionService;
  let cancelTransactionService: CancelTransactionService;
  let reverseTransactionService: ReverseTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: ListTransactionService,
          useValue: {
            execute: jest.fn().mockResolvedValue(transactionList),
          },
        },
        {
          provide: GetTransactionService,
          useValue: {
            execute: jest.fn().mockResolvedValue(someTransaction),
          },
        },
        {
          provide: CancelTransactionService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ReverseTransactionService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    transactionController = module.get<TransactionController>(
      TransactionController,
    );
    listTransactionService = module.get<ListTransactionService>(
      ListTransactionService,
    );
    getTransactionService = module.get<GetTransactionService>(
      GetTransactionService,
    );
    cancelTransactionService = module.get<CancelTransactionService>(
      CancelTransactionService,
    );
    reverseTransactionService = module.get<ReverseTransactionService>(
      ReverseTransactionService,
    );
  });

  it('should be defined', () => {
    expect(transactionController).toBeDefined();
    expect(listTransactionService).toBeDefined();
    expect(getTransactionService).toBeDefined();
    expect(cancelTransactionService).toBeDefined();
    expect(reverseTransactionService).toBeDefined();
  });

  describe('index', () => {
    it('should list transactions', async () => {
      // Arrange
      const queryParams: ListTransactionParamsDto = {
        walletId: '1',
        createdAtStart: new Date('2023-07-011T00:00:00'),
        createdAtEnd: new Date('2023-07-311T00:00:00'),
        offset: 0,
        limit: 10,
        sort: SortType.ASC,
      };

      // Act
      const result = await transactionController.index(queryParams);

      // Assert
      expect(result).toBe(transactionList);
      expect(listTransactionService.execute).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('findOne', () => {
    it('should show transaction data by id', async () => {
      // Act
      const result = await transactionController.findOne({ id: '1' });

      // Assert
      expect(result).toBe(someTransaction);
      expect(getTransactionService.execute).toHaveBeenCalledWith('1');
    });

    it('should throw an exception if transaction does not exists', async () => {
      // Arrange
      jest.spyOn(getTransactionService, 'execute').mockResolvedValue(undefined);

      // Act
      const result = await transactionController.findOne({ id: '2' });

      // Assert
      expect(result).toBeUndefined();
    });
  });

  describe('cancelTransaction', () => {
    it('should cancel a transaction', async () => {
      // Act
      await transactionController.cancelTransaction({ id: '1' });

      // Assert
      expect(cancelTransactionService.execute).toHaveBeenCalledWith('1');
    });
  });

  describe('reverseTransaction', () => {
    it('should reverse a transaction', async () => {
      // Act
      await transactionController.reverseTransaction({ id: '1' });

      // Assert
      expect(reverseTransactionService.execute).toHaveBeenCalledWith('1');
    });
  });
});
