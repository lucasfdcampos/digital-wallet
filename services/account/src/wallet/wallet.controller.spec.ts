import { Test, TestingModule } from '@nestjs/testing';
import { WalletController } from './wallet.controller';
import { CreateWalletService } from './services/create-wallet.service';
import { GetWalletService } from './services/get-wallet.service';
import { SendTransactionsService } from './services/send-transactions.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { SendTransactionDto } from './dto/send-transaction.dto';
import { Wallet } from './entities/wallet.entity';
import { Account } from '@account/entities/account.entity';
import { TransactionType } from './enums/transaction-type.enum';

const someAccount = new Account({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@wallet.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

const newWallet: Wallet = {
  id: '1',
  accountId: '1',
  accountNumber: '1234567',
  amount: 0,
  isEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  account: someAccount,
};

describe('WalletController', () => {
  let walletController: WalletController;
  let createWalletService: CreateWalletService;
  let getWalletService: GetWalletService;
  let sendTransactionsService: SendTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: CreateWalletService,
          useValue: {
            execute: jest.fn().mockResolvedValue(newWallet),
          },
        },
        {
          provide: GetWalletService,
          useValue: {
            execute: jest.fn().mockResolvedValue(newWallet),
          },
        },
        {
          provide: SendTransactionsService,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    walletController = module.get<WalletController>(WalletController);
    createWalletService = module.get<CreateWalletService>(CreateWalletService);
    getWalletService = module.get<GetWalletService>(GetWalletService);
    sendTransactionsService = module.get<SendTransactionsService>(
      SendTransactionsService,
    );
  });

  it('should be defined', () => {
    expect(walletController).toBeDefined();
    expect(createWalletService).toBeDefined();
    expect(getWalletService).toBeDefined();
    expect(sendTransactionsService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new wallet', async () => {
      // Arrange
      const createWalletDto: CreateWalletDto = {
        accountId: '1',
      };

      jest.spyOn(createWalletService, 'execute').mockResolvedValue(newWallet);

      // Act
      const result = await walletController.create(createWalletDto);

      // Assert
      expect(result).toBe(newWallet);
      expect(createWalletService.execute).toHaveBeenCalledWith(createWalletDto);
    });

    it('should throw an exception', () => {
      // Arrange
      const createWalletDto: CreateWalletDto = {
        accountId: '1',
      };

      jest
        .spyOn(createWalletService, 'execute')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(walletController.create(createWalletDto)).rejects.toThrowError();
    });
  });

  describe('sendTransactionData', () => {
    it('should send transaction data to Kafka', async () => {
      // Arrange
      const sendTransactionDto: SendTransactionDto = {
        type: TransactionType.DEPOSIT,
        value: 100,
      };

      // Act
      await walletController.sendTransactionData(
        { id: '1' },
        sendTransactionDto,
      );

      // Assert
      expect(sendTransactionsService.execute).toHaveBeenCalledWith(
        '1',
        sendTransactionDto,
      );
    });

    it('should throw an exception if wallet does not exist', async () => {
      // Arrange
      const sendTransactionDto: SendTransactionDto = {
        type: TransactionType.DEPOSIT,
        value: 100,
      };

      jest
        .spyOn(sendTransactionsService, 'execute')
        .mockRejectedValueOnce(new Error());

      // Act and Assert
      await expect(
        walletController.sendTransactionData({ id: '999' }, sendTransactionDto),
      ).rejects.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should return wallet data by id', async () => {
      // Act
      const result = await walletController.findOne({ id: '1' });

      // Assert
      expect(result).toBe(newWallet);
      expect(getWalletService.execute).toHaveBeenCalledWith('1');
    });

    it('should throw an exception if wallet doest not exists', async () => {
      // Arrange
      jest.spyOn(getWalletService, 'execute').mockResolvedValue(undefined);

      // Act
      const result = await walletController.findOne({ id: '2' });

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
