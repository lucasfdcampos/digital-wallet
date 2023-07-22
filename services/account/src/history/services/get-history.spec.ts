import { Test, TestingModule } from '@nestjs/testing';
import { GetHistoryService } from './get-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { History } from '../entities/history.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Account } from '@account/entities/account.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { HistoryType } from '@common/enums/history-type.enum';

const someAccount = new Account({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@picpay.com',
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

describe('GetHistoryService', () => {
  let getHistoryService: GetHistoryService;
  let historyRepository: Repository<History>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetHistoryService,
        {
          provide: getRepositoryToken(History),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue(someHistory),
          },
        },
      ],
    }).compile();

    getHistoryService = module.get<GetHistoryService>(GetHistoryService);
    historyRepository = module.get<Repository<History>>(
      getRepositoryToken(History),
    );
  });

  it('should be defined', () => {
    expect(getHistoryService).toBeDefined();
    expect(historyRepository).toBeDefined();
  });

  it('should get a history by id', async () => {
    // Act
    const result = await getHistoryService.execute('1');

    // Assert
    expect(result).toEqual(someHistory);
    expect(historyRepository.findOneOrFail).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('should throw NotFoundException if history with history id does not exist', async () => {
    // Arrange
    jest
      .spyOn(historyRepository, 'findOneOrFail')
      .mockRejectedValueOnce(new NotFoundException());

    // Act and Assert
    await expect(getHistoryService.execute('1')).rejects.toThrowError(
      NotFoundException,
    );
  });
});
