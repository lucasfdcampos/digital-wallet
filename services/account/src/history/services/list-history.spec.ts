import { Test, TestingModule } from '@nestjs/testing';
import { ListHistoryService } from './list-history.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { History } from '../entities/history.entity';
import { Wallet } from '../../wallet/entities/wallet.entity';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ListHistoryParamsDto } from '../dto/list-history-query-params.dto';
import { HistoryType } from '@common/enums/history-type.enum';
import { SortType } from '@history/enums/sort-type.enum';

const someWallet = new Wallet({
  id: '1',
  accountId: '1',
  accountNumber: '1234567',
  amount: 0,
  isEnabled: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
});

const historicList: History[] = [
  new History({
    id: '1',
    walletId: '1',
    oldAmount: 0,
    newAmount: 100,
    type: HistoryType.DEPOSIT,
    transactionId: '1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  new History({
    id: '2',
    walletId: '1',
    oldAmount: 100,
    newAmount: 50,
    type: HistoryType.WITHDRAW,
    transactionId: '2',
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
];

const queryParams: ListHistoryParamsDto = {
  walletId: '1',
  createdAtStart: new Date('2023-07-01T00:00:00'),
  createdAtEnd: new Date('2023-07-31T00:00:00'),
  offset: 0,
  limit: 10,
  sort: SortType.ASC,
};

describe('ListHistoryService', () => {
  let listHistoryService: ListHistoryService;
  let historyRepository: Repository<History>;
  let walletRepository: Repository<Wallet>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListHistoryService,
        {
          provide: getRepositoryToken(History),
          useValue: {
            findAndCount: jest.fn().mockResolvedValue([historicList, 2]),
          },
        },
        {
          provide: getRepositoryToken(Wallet),
          useValue: {
            findOne: jest.fn().mockResolvedValue(someWallet),
          },
        },
      ],
    }).compile();

    listHistoryService = module.get<ListHistoryService>(ListHistoryService);
    historyRepository = module.get<Repository<History>>(
      getRepositoryToken(History),
    );
    walletRepository = module.get<Repository<Wallet>>(
      getRepositoryToken(Wallet),
    );
  });

  it('should be defined', () => {
    expect(listHistoryService).toBeDefined();
    expect(historyRepository).toBeDefined();
    expect(walletRepository).toBeDefined();
  });

  it('should list history with valid query', async () => {
    // Arrange
    jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce({
      id: '1',
      isEnabled: true,
    } as Wallet);

    // Act
    const result = await listHistoryService.execute(queryParams);

    // Assert
    expect(result).toEqual({
      totalCount: historicList.length,
      hasMore: false,
      limit: queryParams.limit,
      offset: queryParams.offset,
      data: historicList,
    });
    expect(walletRepository.findOne).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('should throw NotFoundException if wallet with given walletId does not exist', async () => {
    // Arrange
    jest
      .spyOn(walletRepository, 'findOne')
      .mockRejectedValueOnce(new NotFoundException());

    // Act and Assert
    await expect(listHistoryService.execute(queryParams)).rejects.toThrowError(
      NotFoundException,
    );
  });

  it('should throw UnprocessableEntityException if wallet is not enabled', async () => {
    // Arrange
    const walletData = { ...someWallet, isEnabled: false };
    jest.spyOn(walletRepository, 'findOne').mockResolvedValueOnce(walletData);

    // Act and Assert
    await expect(listHistoryService.execute(queryParams)).rejects.toThrowError(
      UnprocessableEntityException,
    );
  });

  it('should throw BadRequestException if createdAtStart is after createdAtEnd', async () => {
    // Arrange
    const invalidParams: ListHistoryParamsDto = {
      ...queryParams,
      createdAtStart: new Date('2023-07-31T00:00:00'),
      createdAtEnd: new Date('2023-07-01T00:00:00'),
    };

    // Act and Assert
    await expect(
      listHistoryService.execute(invalidParams),
    ).rejects.toThrowError(BadRequestException);
  });
});
