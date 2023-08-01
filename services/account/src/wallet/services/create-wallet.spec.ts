import { Test, TestingModule } from '@nestjs/testing';
import { CreateWalletService } from './create-wallet.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wallet } from '@wallet/entities/wallet.entity';
import { Account } from '@account/entities/account.entity';
import { CreateWalletDto } from '@wallet/dto/create-wallet.dto';
import { NotFoundException } from '@nestjs/common';

const newAccount = new Account({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@wallet.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

const newWallet = new Wallet({
  id: '1',
  accountId: '1',
  accountNumber: '1234567',
  amount: 0,
  isEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  account: newAccount,
});

describe('CreateWalletService', () => {
  let createWalletService: CreateWalletService;
  let walletRepository: Repository<Wallet>;
  let accountRepository: Repository<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateWalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            create: jest.fn().mockResolvedValue(newWallet),
            findOne: jest.fn().mockResolvedValue(undefined),
            save: jest.fn().mockResolvedValue(newWallet),
          },
        },
        {
          provide: getRepositoryToken(Account),
          useValue: {
            findOne: jest.fn().mockResolvedValue(newAccount),
          },
        },
      ],
    }).compile();

    createWalletService = module.get<CreateWalletService>(CreateWalletService);
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
  });

  it('should be defined', () => {
    expect(createWalletService).toBeDefined();
    expect(walletRepository).toBeDefined();
    expect(accountRepository).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new wallet for an existing account', async () => {
      // Arrange
      const data: CreateWalletDto = {
        accountId: '1',
      };

      jest
        .spyOn(accountRepository, 'findOne')
        .mockResolvedValueOnce(newAccount);
      jest.spyOn(walletRepository, 'create').mockReturnValueOnce(data as any);
      jest.spyOn(walletRepository, 'save').mockResolvedValueOnce(newWallet);

      // Act
      const result = await createWalletService.execute(data);

      // Assert
      expect(result).toEqual(newWallet);
      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { id: newAccount.id },
      });
      expect(walletRepository.create).toHaveBeenCalledWith(data);
      expect(walletRepository.save).toHaveBeenCalledWith(data);
    });

    it('should throw NotFoundException if the account does not exist', async () => {
      // Arrange
      const data: CreateWalletDto = {
        accountId: '1',
      };

      jest.spyOn(accountRepository, 'findOne').mockResolvedValueOnce(undefined);

      // Act and Assert
      await expect(createWalletService.execute(data)).rejects.toThrowError(
        NotFoundException,
      );
    });

    it('should throw an exception', () => {
      // Arrange
      const data: CreateWalletDto = {
        accountId: '1',
      };

      jest.spyOn(walletRepository, 'save').mockRejectedValueOnce(new Error());

      // Assert
      expect(createWalletService.execute(data)).rejects.toThrowError();
    });
  });
});
