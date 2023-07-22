import {
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SendTransactionsService } from './send-transactions.service';
import { Wallet } from '../entities/wallet.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SendTransactionDto } from '../dto/send-transaction.dto';
import { KafkaTopics } from '../../common/enums/kafka-topics.enum';
import { ProducerService } from '../../kafka/producer.service';
import { TransactionType } from '../enums/transaction-type.enum';
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

describe('SendTransactionsService', () => {
  let sendTransactionsService: SendTransactionsService;
  let walletRepository: Repository<Wallet>;
  let producerService: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendTransactionsService,
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            findOne: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: ProducerService,
          useValue: {
            produce: jest.fn(),
          },
        },
      ],
    }).compile();

    sendTransactionsService = module.get<SendTransactionsService>(
      SendTransactionsService,
    );
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
    producerService = module.get<ProducerService>(ProducerService);
  });

  it('should be defined', () => {
    expect(sendTransactionsService).toBeDefined();
    expect(walletRepository).toBeDefined();
    expect(producerService).toBeDefined();
  });

  describe('execute', () => {
    it('should send a transaction to Kafka and update the wallet balance', async () => {
      // Arrange
      const data: SendTransactionDto = {
        type: TransactionType.DEPOSIT,
        value: 100,
      };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(someWallet);
      // Act
      await sendTransactionsService.execute('1', data);
      // Assert
      expect(producerService.produce).toHaveBeenCalledWith({
        topic: KafkaTopics.CREATE_TRANSACTION,
        messages: [
          {
            value: JSON.stringify({
              walletId: '1',
              type: data.type,
              value: data.value,
            }),
          },
        ],
      });
    });

    it('should throw NotFoundException if the wallet does not exist', async () => {
      // Arrange
      const data: SendTransactionDto = {
        type: TransactionType.DEPOSIT,
        value: 100,
      };
      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(undefined);

      // Act and Assert
      await expect(
        sendTransactionsService.execute('1', data),
      ).rejects.toThrowError(NotFoundException);
    });

    it('should throw UnprocessableEntityException if the wallet is not enabled', async () => {
      // Arrange
      const data: SendTransactionDto = {
        type: TransactionType.DEPOSIT,
        value: 100,
      };

      const existingAccount: Account = {
        id: '1',
        name: 'Existing Account',
        email: 'john.doe@picpay.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      const wallet: Wallet = {
        id: '1',
        accountId: '1',
        accountNumber: '1234567',
        amount: 0,
        isEnabled: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        account: existingAccount,
      };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(wallet);

      // Act and Assert
      await expect(
        sendTransactionsService.execute(someWallet.id, data),
      ).rejects.toThrowError(UnprocessableEntityException);
    });

    it('should throw UnprocessableEntityException if the wallet has insufficient balance for the withdrawal', async () => {
      // Arrange
      const data: SendTransactionDto = {
        type: TransactionType.WITHDRAW,
        value: 500,
      };

      jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(someWallet);

      // Act and Assert
      await expect(
        sendTransactionsService.execute(someWallet.id, data),
      ).rejects.toThrowError(UnprocessableEntityException);
    });
  });
});
