import { Test, TestingModule } from '@nestjs/testing';
import { UpdateWalletAmountHandler } from './update-wallet-amount.handler';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '@wallet/entities/wallet.entity';
import { History } from '@history/entities/history.entity';
import { WalletAmountUpdated } from '../event/wallet-amount-updated';
import { HistoryType } from '@common/enums/history-type.enum';
import { TransactionStatus } from '@common/enums/transaction-status.enum';
import { Account } from '@account/entities/account.entity';

describe('UpdateWalletAmountHandler', () => {
  let updateWalletAmountHandler: UpdateWalletAmountHandler;
  let walletRepository: Repository<Wallet>;
  let historyRepository: Repository<History>;

  const someAccouint = new Account({
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
    account: someAccouint,
  });

  const someHistory = new History({
    id: '1',
    walletId: '1',
    oldAmount: 0,
    newAmount: 50,
    type: HistoryType.PURCHASE,
    transactionId: '1',
    wallet: someWallet,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateWalletAmountHandler,
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            findOne: jest.fn().mockResolvedValue(undefined),
            save: jest.fn().mockResolvedValue(someWallet),
          },
        },
        {
          provide: getRepositoryToken(History),
          useValue: {
            create: jest.fn().mockResolvedValue(someHistory),
            save: jest.fn().mockResolvedValue(someHistory),
          },
        },
      ],
    }).compile();

    updateWalletAmountHandler = module.get<UpdateWalletAmountHandler>(
      UpdateWalletAmountHandler,
    );
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
    historyRepository = module.get<Repository<History>>(
      getRepositoryToken(History),
    );
  });

  it('should be defined', () => {
    expect(updateWalletAmountHandler).toBeDefined();
    expect(walletRepository).toBeDefined();
    expect(historyRepository).toBeDefined();
  });

  describe('execute', () => {
    it('should call updateWalletAmount and createHistory with the correct parameters for purchase event', async () => {
      // Arrange
      const event: WalletAmountUpdated = {
        walletId: '1',
        type: HistoryType.PURCHASE,
        value: 50,
        status: TransactionStatus.APPROVED,
        transactionId: '1',
      };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(someWallet);

      // Act
      await updateWalletAmountHandler.execute(event);

      // Assert
      expect(walletRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(walletRepository.save).toHaveBeenCalledWith(someWallet);
    });
  });
});
