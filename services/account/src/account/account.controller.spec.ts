import { Test, TestingModule } from '@nestjs/testing';
import { AccountController } from './account.controller';
import { CreateAccountService } from './services/create-account.service';
import { GetAccountService } from './services/get-account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';

const newAccount = new Account({
  id: '1',
  name: 'John Doe',
  email: 'john.doe@wallet.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

describe('AccountController', () => {
  let accountController: AccountController;
  let createAccountService: CreateAccountService;
  let getAccountService: GetAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountController],
      providers: [
        {
          provide: CreateAccountService,
          useValue: {
            execute: jest.fn().mockResolvedValue(newAccount),
          },
        },
        {
          provide: GetAccountService,
          useValue: {
            execute: jest.fn().mockResolvedValue(newAccount),
          },
        },
      ],
    }).compile();

    accountController = module.get<AccountController>(AccountController);
    createAccountService =
      module.get<CreateAccountService>(CreateAccountService);
    getAccountService = module.get<GetAccountService>(GetAccountService);
  });

  it('should be defined', () => {
    expect(accountController).toBeDefined();
    expect(createAccountService).toBeDefined();
    expect(getAccountService).toBeDefined();
  });

  describe('create', () => {
    it('should create a new account', async () => {
      // Arrange
      const createAccountDto: CreateAccountDto = {
        name: 'John Doe',
        email: 'john.doe@wallet.com',
      };

      jest.spyOn(createAccountService, 'execute').mockResolvedValue(newAccount);

      // Act
      const result = await accountController.create(createAccountDto);

      // Assert
      expect(result).toBe(newAccount);
      expect(createAccountService.execute).toHaveBeenCalledWith(
        createAccountDto,
      );
    });

    it('should throw an exception', () => {
      // Arrange
      const createAccountDto: CreateAccountDto = {
        name: 'John Doe',
        email: 'john.doe@wallet.com',
      };

      jest
        .spyOn(createAccountService, 'execute')
        .mockRejectedValueOnce(new Error());

      // Assert
      expect(accountController.create(createAccountDto)).rejects.toThrowError();
    });
  });

  describe('findOne', () => {
    it('should return account data by id', async () => {
      // Arrange
      jest.spyOn(getAccountService, 'execute').mockResolvedValue(newAccount);

      // Act
      const result = await accountController.findOne({ id: '1' });

      // Assert
      expect(result).toBe(newAccount);
    });

    it('should throw an exception if account doest not exists', async () => {
      // Arrange
      jest.spyOn(getAccountService, 'execute').mockResolvedValue(undefined);

      // Act
      const result = await accountController.findOne({ id: '2' });

      // Assert
      expect(result).toBeUndefined();
    });
  });
});
