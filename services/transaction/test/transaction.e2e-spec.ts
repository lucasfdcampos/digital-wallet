import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { Connection, Repository, createConnection } from 'typeorm';
import { v4 } from 'uuid';
import { Transaction } from '@transaction/entities/transaction.entity';
import { TransactionModule } from '@transaction/transaction.module';
import { ProducerService } from '@kafka/producer.service';
import { TransactionType } from '@transaction/enums/transaction-type.enum';
import { TransactionStatus } from '@transaction/enums/transaction-status.enum';
import { KafkaTopics } from '@common/enums/kafka-topics.enum';

dotenv.config();

interface MockProducerService {
  execute: jest.Mock<any, any>;
  produce: jest.Mock<any, any>;
}

describe('TransactionController (E2E)', () => {
  let app: INestApplication;
  let testConnection: Connection;
  let transactionMock: Transaction;
  let depositTransactionMock: Transaction;
  let mockProducerService: MockProducerService;
  const transactionPurchaseWalletIdMock = v4();
  const transactionDepositWalletIdMock = v4();

  beforeAll(async () => {
    testConnection = await createConnection({
      type: 'postgres',
      host: process.env.DB_TEST_HOST,
      username: process.env.DB_TEST_USER,
      password: process.env.DB_TEST_PASSWORD,
      database: process.env.DB_TEST_DATABASE,
      port: 5433,
      logging: true,
      entities: [Transaction],
    });

    // Mock do ProducerService
    mockProducerService = {
      execute: jest.fn(),
      produce: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TransactionModule],
      providers: [
        {
          provide: ProducerService,
          useValue: mockProducerService,
        },
      ],
    })
      .overrideProvider(ProducerService)
      .useValue(mockProducerService as any)

      .overrideProvider(getRepositoryToken(Transaction))
      .useValue(testConnection.getRepository(Transaction))
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    moduleFixture.get<Repository<Transaction>>(getRepositoryToken(Transaction));

    const createTransaction = testConnection.getRepository(Transaction).create({
      walletId: transactionPurchaseWalletIdMock,
      value: 100,
      type: TransactionType.PURCHASE,
      status: TransactionStatus.APPROVED,
    });

    transactionMock = await testConnection
      .getRepository(Transaction)
      .save(createTransaction);

    const createDepositTransaction = testConnection
      .getRepository(Transaction)
      .create({
        walletId: transactionDepositWalletIdMock,
        value: 100,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.APPROVED,
      });

    depositTransactionMock = await testConnection
      .getRepository(Transaction)
      .save(createDepositTransaction);
  });

  afterAll(async () => {
    await testConnection.query('DELETE FROM transaction WHERE wallet_id = $1', [
      transactionPurchaseWalletIdMock,
    ]);

    await testConnection.query('DELETE FROM transaction WHERE wallet_id = $1', [
      transactionDepositWalletIdMock,
    ]);

    await app.close();
    await testConnection.close();
  });

  describe('[GET] /v1/transaction', () => {
    it('should return transaction list successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/v1/transaction')
        .expect(HttpStatus.OK);

      const transactionData = response.body;
      expect(transactionData).toHaveProperty('data');
      expect(Array.isArray(transactionData.data)).toBe(true);
    });
  });

  describe('[GET] /v1/transaction/:id', () => {
    it('should return transaction by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/v1/transaction/${transactionMock.id}`)
        .expect(HttpStatus.OK);

      const historyData = response.body;
      expect(historyData).toHaveProperty('id');
      expect(historyData.id).toBe(transactionMock.id);
    });

    it('should return 404 if transaction does not exist', async () => {
      await request(app.getHttpServer())
        .get(`/v1/transaction/${v4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('[POST] /v1/transaction/cancel/:id', () => {
    it('should send cancel transaction data to Kafka', async () => {
      await request(app.getHttpServer())
        .post(`/v1/transaction/cancel/${transactionMock.id}`)
        .expect(HttpStatus.CREATED);

      expect(mockProducerService.produce).toHaveBeenCalledWith({
        topic: KafkaTopics.CREATE_TRANSACTION,
        messages: [
          {
            value: JSON.stringify({
              walletId: transactionMock.walletId,
              type: TransactionType.CANCELLATION,
              value: '100.00',
              originalTransactionId: transactionMock.id,
            }),
          },
        ],
      });
    });

    it('should return 404 if transaction does not exist', async () => {
      await request(app.getHttpServer())
        .post(`/v1/transaction/cancel/${v4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 422 if transaction is not purchase type', async () => {
      await request(app.getHttpServer())
        .post(`/v1/transaction/cancel/${depositTransactionMock.id}`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });

  describe('[POST] /v1/transaction/reverse/:id', () => {
    it('should send reverse transaction data to Kafka', async () => {
      await request(app.getHttpServer())
        .post(`/v1/transaction/reverse/${transactionMock.id}`)
        .expect(HttpStatus.CREATED);

      expect(mockProducerService.produce).toHaveBeenCalledWith({
        topic: KafkaTopics.CREATE_TRANSACTION,
        messages: [
          {
            value: JSON.stringify({
              walletId: transactionMock.walletId,
              type: TransactionType.REVERSAL,
              value: '100.00',
              originalTransactionId: transactionMock.id,
            }),
          },
        ],
      });
    });

    it('should return 404 if transaction does not exist', async () => {
      await request(app.getHttpServer())
        .post(`/v1/transaction/reverse/${v4()}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should return 422 if transaction is not purchase type', async () => {
      await request(app.getHttpServer())
        .post(`/v1/transaction/reverse/${depositTransactionMock.id}`)
        .expect(HttpStatus.UNPROCESSABLE_ENTITY);
    });
  });
});
