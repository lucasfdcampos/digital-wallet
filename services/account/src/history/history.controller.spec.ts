import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from './history.controller';
import { ListHistoryService } from './services/list-history.service';
import { GetHistoryService } from './services/get-history.service';
import { ListHistoryParamsDto } from './dto/list-history-query-params.dto';
import { Account } from '@account/entities/account.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { History } from './entities/history.entity';
import { HistoryType } from '@common/enums/history-type.enum';
import { SortType } from './enums/sort-type.enum';

const someAccount = new Account({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@wallet.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

const someWallet = new Wallet({
  id: '1',
  accountId: '1',
  accountNumber: '1234567',
  amount: 0,
  isEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  account: someAccount,
});

const someHistory = new History({
  id: '1',
  walletId: '1',
  oldAmount: 0,
  newAmount: 100,
  type: HistoryType.DEPOSIT,
  transactionId: '1',
  wallet: someWallet,
});

const historicList: History[] = [
  new History({
    id: '1',
    walletId: '1',
    oldAmount: 0,
    newAmount: 100,
    type: HistoryType.DEPOSIT,
    transactionId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new History({
    id: '2',
    walletId: '1',
    oldAmount: 100,
    newAmount: 50,
    type: HistoryType.WITHDRAW,
    transactionId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
];

describe('HistoryController', () => {
  let historyController: HistoryController;
  let listHistoryService: ListHistoryService;
  let getHistoryService: GetHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoryController],
      providers: [
        {
          provide: ListHistoryService,
          useValue: {
            execute: jest.fn().mockResolvedValue(historicList),
          },
        },
        {
          provide: GetHistoryService,
          useValue: {
            execute: jest.fn().mockResolvedValue(someHistory),
          },
        },
      ],
    }).compile();

    historyController = module.get<HistoryController>(HistoryController);
    listHistoryService = module.get<ListHistoryService>(ListHistoryService);
    getHistoryService = module.get<GetHistoryService>(GetHistoryService);
  });

  it('should be defined', () => {
    expect(historyController).toBeDefined();
    expect(listHistoryService).toBeDefined();
    expect(getHistoryService).toBeDefined();
  });

  describe('index', () => {
    it('should list historic', async () => {
      // Arrange
      const queryParams: ListHistoryParamsDto = {
        walletId: '1',
        createdAtStart: new Date('2023-07-01T00:00:00'),
        createdAtEnd: new Date('2023-07-31T00:00:00'),
        offset: 0,
        limit: 10,
        sort: SortType.ASC,
      };

      // Act
      const result = await historyController.index(queryParams);

      // Assert
      expect(result).toBe(historicList);
      expect(listHistoryService.execute).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('findOne', () => {
    it('should show history data by id', async () => {
      // Act
      const result = await historyController.findOne({ id: '1' });

      // Assert
      expect(result).toBe(someHistory);
      expect(getHistoryService.execute).toHaveBeenCalledWith('1');
    });

    it('should throw an exception if history doest not exists', async () => {
      // Arrange
      jest.spyOn(getHistoryService, 'execute').mockResolvedValue(undefined);

      // Act
      const result = await historyController.findOne({ id: '2' });

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
