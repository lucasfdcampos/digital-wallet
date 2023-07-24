import * as dotenv from 'dotenv';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AccountModule } from '../src/account/account.module';
import * as request from 'supertest';
import { CreateAccountDto } from '@account/dto/create-account.dto';
import { Connection, createConnection, Repository } from 'typeorm';
import { Account } from '@account/entities/account.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

dotenv.config();

describe('AccountController (E2E)', () => {
  let app: INestApplication;
  let testConnection: Connection;

  let createdAccountId: string;

  beforeAll(async () => {
    testConnection = await createConnection({
      type: 'postgres',
      host: process.env.DB_TEST_HOST,
      username: process.env.DB_TEST_USER,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_DATABASE,
      port: 5432,
      logging: true,
      entities: [Account, Wallet],
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AccountModule],
    })
      .overrideProvider(getRepositoryToken(Account))
      .useValue(testConnection.getRepository(Account))

      .overrideProvider(getRepositoryToken(Wallet))
      .useValue(testConnection.getRepository(Wallet))

      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    moduleFixture.get<Repository<Account>>(getRepositoryToken(Account));

    moduleFixture.get<Repository<Wallet>>(getRepositoryToken(Wallet));
  });

  afterAll(async () => {
    const johnDoeAccount = await testConnection.getRepository(Account).findOne({
      where: { email: 'john.doe1@picpay.com' },
    });

    if (johnDoeAccount) {
      const johnDoeWallets = await testConnection.getRepository(Wallet).find({
        where: {
          accountId: johnDoeAccount.id,
        },
      });

      await Promise.all(
        johnDoeWallets.map(async (wallet) => {
          await testConnection.query(
            'DELETE FROM history WHERE wallet_id = $1',
            [wallet.id],
          );
        }),
      );

      await testConnection.query('DELETE FROM wallet WHERE account_id = $1', [
        johnDoeAccount.id,
      ]);

      await testConnection.query('DELETE FROM account WHERE id = $1', [
        johnDoeAccount.id,
      ]);
    }

    await app.close();
    await testConnection.close();
  });

  describe('[POST] /v1/account', () => {
    it('should create a new account', async () => {
      const createAccountDto: CreateAccountDto = {
        name: 'John Doe',
        email: 'john.doe1@picpay.com',
      };

      const response = await request(app.getHttpServer())
        .post('/v1/account')
        .send(createAccountDto)
        .expect(HttpStatus.CREATED);

      const createdAccount = response.body;
      expect(createdAccount).toHaveProperty('id');
      expect(createdAccount.name).toBe(createAccountDto.name);
      expect(createdAccount.email).toBe(createAccountDto.email);

      createdAccountId = createdAccount.id;
    });

    it('should return 422 if email already exists', async () => {
      const createAccountDto = {
        name: 'Jane Smith',
        email: 'john.doe1@picpay.com',
      };

      await request(app.getHttpServer())
        .post('/v1/account')
        .send(createAccountDto)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });

  describe('[GET] /v1/account/:id', () => {
    it('should return account data by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/account/${createdAccountId}`)
        .expect(HttpStatus.OK);

      const accountData = response.body;
      expect(accountData).toHaveProperty('id');
      expect(accountData.name).toBe('John Doe');
      expect(accountData.email).toBe('john.doe1@picpay.com');
    });

    it('should return 404 if account does not exist', async () => {
      await request(app.getHttpServer())
        .get('/v1/account/999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
