import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetWalletService } from './get-wallet.service';
import { Wallet } from '../entities/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '@account/entities/account.entity';

const someAccount = new Account({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@picpay.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

const someWallet: Wallet = {
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

describe('GetWalletService', () => {
  let getWalletService: GetWalletService;
  let walletRepository: Repository<Wallet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetWalletService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue(someWallet),
          },
        },
      ],
    }).compile();

    getWalletService = module.get<GetWalletService>(GetWalletService);
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
  });

  it('should be defined', () => {
    expect(getWalletService).toBeDefined();
    expect(walletRepository).toBeDefined();
  });

  describe('execute', () => {
    it('should return a wallet by id', async () => {
      // Act
      const result = await getWalletService.execute('1');

      // Assert
      expect(result).toEqual(someWallet);
      expect(walletRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if the wallet does not exist', async () => {
      // Arrange
      jest
        .spyOn(walletRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new NotFoundException());

      // Act and Assert
      await expect(getWalletService.execute('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
