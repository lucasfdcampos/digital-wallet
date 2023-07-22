import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetAccountService } from './get-account.service';
import { Account } from '../entities/account.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

const someAccount = new Account({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@picpay.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe('GetAccountService', () => {
  let getAccountService: GetAccountService;
  let accountRepository: Repository<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAccountService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            findOneOrFail: jest.fn().mockResolvedValue(someAccount),
          },
        },
      ],
    }).compile();

    getAccountService = module.get<GetAccountService>(GetAccountService);
    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
  });

  it('should be defined', () => {
    expect(getAccountService).toBeDefined();
    expect(accountRepository).toBeDefined();
  });

  describe('execute', () => {
    it('should return an account by id', async () => {
      // Act
      const result = await getAccountService.execute('1');

      // Assert
      expect(result).toEqual(someAccount);
      expect(accountRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException if account does not exist', async () => {
      // Arrange
      jest
        .spyOn(accountRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      // Act and Assert
      await expect(getAccountService.execute('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });
});
