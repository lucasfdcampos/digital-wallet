import { CreateAccountDto } from '@account/dto/create-account.dto';
import { Account } from '@account/entities/account.entity';
import { HistoryType } from '@common/enums/history-type.enum';
import { History } from '@history/entities/history.entity';
import { HistoryModule } from '@history/history.module';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateWalletDto } from '@wallet/dto/create-wallet.dto';
import { Wallet } from '@wallet/entities/wallet.entity';
import * as dotenv from 'dotenv';
import { Connection, Repository, createConnection } from 'typeorm';
import { v4 } from 'uuid';

dotenv.config();

describe('HistoryController (E2E)', () => {
  let app: INestApplication;
  let testConnection: Connection;
  let johnDoeAccountMock: Account;
  let johnDoeWalletMock: Wallet;
  let johnDoeHistoryMock: History;

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

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [HistoryModule],
    })
      .overrideProvider(getRepositoryToken(Wallet))
      .useValue(testConnection.getRepository(Wallet))

      .overrideProvider(getRepositoryToken(History))
      .useValue(testConnection.getRepository(History))

      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    moduleFixture.get<Repository<Wallet>>(getRepositoryToken(Wallet));

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

      const johnDoeWallet = await testConnection
        .getRepository(Wallet)
        .save(createWalletJohnDoe);

      johnDoeWalletMock = johnDoeWallet;
    }

    const createJohnDoeWalletHistory = testConnection
      .getRepository(History)
      .create({
        walletId: johnDoeWalletMock.id,
        oldAmount: 0,
        newAmount: 100,
        type: HistoryType.DEPOSIT,
        transactionId: v4(),
      });

    johnDoeHistoryMock = await testConnection
      .getRepository(History)
      .save(createJohnDoeWalletHistory);
  });

  afterAll(async () => {
    await app.close();
    await testConnection.close();
  });

  describe('[GET] /v1/history/:id', () => {
    it('should return history by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/history/${johnDoeHistoryMock.id}`)
        .expect(HttpStatus.OK);

      const historyData = response.body;
      expect(historyData).toHaveProperty('id');
      expect(historyData.id).toBe(johnDoeHistoryMock.id);
    });

    it('should return 404 if history does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/v1/history/${v4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('[GET] /v1/history', () => {
    it('should return history list successfully', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/history?walletId=${johnDoeWalletMock.id}`)
        .expect(HttpStatus.OK);

      const historyData = response.body;
      expect(historyData).toHaveProperty('data');
      expect(Array.isArray(historyData.data)).toBe(true);
    });
  });
});
