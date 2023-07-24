import * as dotenv from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { WalletModule } from '../src/wallet/wallet.module';
import * as request from 'supertest';
import { CreateWalletDto } from '@wallet/dto/create-wallet.dto';
import { Connection, createConnection, Repository } from 'typeorm';
import { Wallet } from '@wallet/entities/wallet.entity';
import { Account } from '@account/entities/account.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateAccountDto } from '@account/dto/create-account.dto';
import { History } from '@history/entities/history.entity';
import { ProducerService } from '@kafka/producer.service';
import { v4 } from 'uuid';
import { SendTransactionDto } from '@wallet/dto/send-transaction.dto';
import { TransactionType } from '@wallet/enums/transaction-type.enum';
import { KafkaTopics } from '@common/enums/kafka-topics.enum';

dotenv.config();

interface MockProducerService {
  execute: jest.Mock<any, any>;
  produce: jest.Mock<any, any>;
}

describe('WalletController (E2E)', () => {
  let app: INestApplication;
  let testConnection: Connection;
  let johnDoeAccountMock: Account;
  let mockProducerService: MockProducerService;

  beforeAll(async () => {
    testConnection = await createConnection({
      type: 'postgres',
      host: process.env.DB_TEST_HOST,
      username: process.env.DB_TEST_USER,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_DATABASE,
      port: 5432,
      logging: true,
      entities: [Account, Wallet, History],
    });

    // Mock do ProducerService
    mockProducerService = {
      execute: jest.fn(),
      produce: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WalletModule],
      providers: [
        {
          provide: ProducerService,
          useValue: mockProducerService,
        },
      ],
    })
      .overrideProvider(ProducerService)
      .useValue(mockProducerService as any)

      .overrideProvider(getRepositoryToken(Wallet))
      .useValue(testConnection.getRepository(Wallet))

      .overrideProvider(getRepositoryToken(Account))
      .useValue(testConnection.getRepository(Account))

      .overrideProvider(getRepositoryToken(History))
      .useValue(testConnection.getRepository(History))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    moduleFixture.get<Repository<Wallet>>(getRepositoryToken(Wallet));

    moduleFixture.get<Repository<Account>>(getRepositoryToken(Account));

    moduleFixture.get<Repository<History>>(getRepositoryToken(History));

    const johnDoeAccount = await testConnection.getRepository(Account).findOne({
      where: { email: 'john.doe@picpay.com' },
    });

    if (johnDoeAccount) {
      johnDoeAccountMock = johnDoeAccount;
    } else {
      const createAccountDto: CreateAccountDto = {
        name: 'John Doe',
        email: 'john.doe@picpay.com',
      };

      const createAccountJohnDoe = testConnection
        .getRepository(Account)
        .create(createAccountDto);

      const johnDoeAccount = await testConnection
        .getRepository(Account)
        .save(createAccountJohnDoe);

      johnDoeAccountMock = johnDoeAccount;
    }
  });

  afterAll(async () => {
    await app.close();
    await testConnection.close();
  });

  describe('[POST] /v1/wallet', () => {
    it('should create a new wallet', async () => {
      const createWalletDto: CreateWalletDto = {
        accountId: johnDoeAccountMock.id,
      };

      const response = await request(app.getHttpServer())
        .post('/v1/wallet')
        .send(createWalletDto)
        .expect(HttpStatus.CREATED);

      const createdWallet = response.body;
      expect(createdWallet).toHaveProperty('id');
      expect(createdWallet.accountId).toBe(createWalletDto.accountId);
    });

    it('should return 404 if account does not exist', async () => {
      const createWalletDto: CreateWalletDto = {
        accountId: v4(),
      };

      await request(app.getHttpServer())
        .post('/v1/wallet')
        .send(createWalletDto)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('[GET] /v1/wallet/:id', () => {
    let johnDoeWalletMock: Wallet;

    beforeEach(async () => {
      const johnDoeWallet = await testConnection.getRepository(Wallet).findOne({
        where: { accountId: johnDoeAccountMock.id },
      });

      if (johnDoeWallet) {
        johnDoeWalletMock = johnDoeWallet;
      } else {
        const createWalletDto: CreateWalletDto = {
          accountId: johnDoeAccountMock.id,
        };

        const createWalletJohnDoe = testConnection
          .getRepository(Wallet)
          .create(createWalletDto);

        johnDoeWalletMock = await testConnection
          .getRepository(Wallet)
          .save(createWalletJohnDoe);
      }
    });

    it('should return wallet data by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/wallet/${johnDoeWalletMock.id}`)
        .expect(HttpStatus.OK);

      const walletData = response.body;
      expect(walletData).toHaveProperty('id');
      expect(walletData.id).toBe(johnDoeWalletMock.id);
      expect(walletData.accountId).toBe(johnDoeWalletMock.accountId);
    });

    it('should return 404 if wallet does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/v1/wallet/${v4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('[POST] /v1/wallet/:id/transactions', () => {
    let johnDoeWalletMock: Wallet;
    let johnDoeDisabledWalletMock: Wallet;

    beforeEach(async () => {
      const johnDoeWallet = await testConnection.getRepository(Wallet).findOne({
        where: { accountId: johnDoeAccountMock.id },
      });

      const createWalletDto: CreateWalletDto = {
        accountId: johnDoeAccountMock.id,
      };

      if (johnDoeWallet) {
        johnDoeWalletMock = johnDoeWallet;
      } else {
        const createWalletJohnDoe = testConnection
          .getRepository(Wallet)
          .create(createWalletDto);

        johnDoeWalletMock = await testConnection
          .getRepository(Wallet)
          .save(createWalletJohnDoe);
      }

      const createDisabledWalletJohnDoe = testConnection
        .getRepository(Wallet)
        .create(createWalletDto);

      johnDoeDisabledWalletMock = await testConnection
        .getRepository(Wallet)
        .save(createDisabledWalletJohnDoe);

      johnDoeDisabledWalletMock.isEnabled = false;
      await testConnection
        .getRepository(Wallet)
        .save(johnDoeDisabledWalletMock);
    });

    it('should send transaction data to Kafka', async () => {
      const sendTransactionDto: SendTransactionDto = {
        type: TransactionType.DEPOSIT,
        value: 100,
      };

      await request(app.getHttpServer())
        .post(`/v1/wallet/${johnDoeWalletMock.id}/transactions`)
        .send(sendTransactionDto)
        .expect(HttpStatus.CREATED);

      const amount = parseFloat(johnDoeWalletMock.amount.toString());

      expect(johnDoeWalletMock.isEnabled).toBe(true);
      expect(amount).toBe(0);

      expect(mockProducerService.produce).toHaveBeenCalledWith({
        topic: KafkaTopics.CREATE_TRANSACTION,
        messages: [
          {
            value: JSON.stringify({
              walletId: johnDoeWalletMock.id,
              type: TransactionType.DEPOSIT,
              value: 100,
            }),
          },
        ],
      });
    });

    it('should return 404 if wallet does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/v1/wallet/${v4()}/transactions`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 422 if have insufficient balance', async () => {
      const sendTransactionDto: SendTransactionDto = {
        type: TransactionType.WITHDRAW,
        value: 100,
      };

      await request(app.getHttpServer())
        .post(`/v1/wallet/${johnDoeWalletMock.id}/transactions`)
        .send(sendTransactionDto)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });

    it('should return 422 if wallet is not enabled', async () => {
      const sendTransactionDto: SendTransactionDto = {
        type: TransactionType.DEPOSIT,
        value: 100,
      };

      await request(app.getHttpServer())
        .post(`/v1/wallet/${johnDoeDisabledWalletMock.id}/transactions`)
        .send(sendTransactionDto)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });
});
