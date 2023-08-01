import { Test, TestingModule } from '@nestjs/testing';
import { CreateAccountService } from './create-account.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Account } from '@account/entities/account.entity';
import { CreateAccountDto } from '@account/dto/create-account.dto';
import { UnprocessableEntityException } from '@nestjs/common';

const newAccount = new Account({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@wallet.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe('CreateAccountService', () => {
  let createAccountService: CreateAccountService;
  let accountRepository: Repository<Account>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAccountService,
        {
          provide: getRepositoryToken(Account),
          useValue: {
            create: jest.fn().mockResolvedValue(newAccount),
            findOne: jest.fn().mockResolvedValue(undefined),
            save: jest.fn().mockResolvedValue(newAccount),
          },
        },
      ],
    }).compile();

    createAccountService =
      module.get<CreateAccountService>(CreateAccountService);
    accountRepository = module.get<Repository<Account>>(
      getRepositoryToken(Account),
    );
  });

  it('should be defined', () => {
    expect(createAccountService).toBeDefined();
    expect(accountRepository).toBeDefined();
  });

  describe('execute', () => {
    it('should create a new account', async () => {
      // Arrange
      const data: CreateAccountDto = {
        name: 'John Doe',
        email: 'john.doe@wallet.com',
      };

      jest.spyOn(accountRepository, 'findOne').mockResolvedValueOnce(undefined);
      jest.spyOn(accountRepository, 'create').mockReturnValueOnce(data as any);
      jest.spyOn(accountRepository, 'save').mockResolvedValueOnce(newAccount);

      // Act
      const result = await createAccountService.execute(data);

      // Assert
      expect(result).toEqual(newAccount);
      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { email: data.email },
      });
      expect(accountRepository.create).toHaveBeenCalledWith(data);
      expect(accountRepository.save).toHaveBeenCalledWith(data);
    });

    it('should throw UnProcessableEntityException if account with the same email already exists', async () => {
      // Arrange
      const data: CreateAccountDto = {
        name: 'John Doe',
        email: 'john.doe@wallet.com',
      };

      const existingAccount: Account = {
        id: '1',
        name: 'Existing Account',
        email: 'john.doe@wallet.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      jest
        .spyOn(accountRepository, 'findOne')
        .mockResolvedValueOnce(existingAccount);

      // Act
      await expect(createAccountService.execute(data)).rejects.toThrowError(
        UnprocessableEntityException,
      );
      expect(accountRepository.findOne).toHaveBeenCalledWith({
        where: { email: data.email },
      });
      expect(accountRepository.create).not.toHaveBeenCalled();
      expect(accountRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an exception', () => {
      // Arrange
      const data: CreateAccountDto = {
        name: 'John Doe',
        email: 'john.doe@wallet.com',
      };

      jest.spyOn(accountRepository, 'save').mockRejectedValueOnce(new Error());

      // Assert
      expect(createAccountService.execute(data)).rejects.toThrowError();
    });
  });
});
