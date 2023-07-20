import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ListHistoryParamsDto } from '../dto/list-history-query-params.dto';
import { History } from '../entities/history.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';

@Injectable()
export class ListHistoryService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  async execute(query: ListHistoryParamsDto) {
    this.validatePeriod(query);
    await this.validateWallet(query.walletId);

    const queryBuilder = this.createQueryBuilder(query);
    this.queryDateIfAvailable(query, queryBuilder, 'createdAt', 'created_at');
    return this.list(queryBuilder, query);
  }

  private async validateWallet(walletId: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: {
        id: walletId,
      },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet does not exist');
    }

    if (!wallet.isEnabled) {
      throw new UnprocessableEntityException('Wallet is not enabled');
    }
  }

  private validatePeriod(query: ListHistoryParamsDto): void {
    const startDate = new Date(query.createdAtStart);
    const endDate = new Date(query.createdAtEnd);

    if (startDate.getTime() > endDate.getTime())
      throw new BadRequestException(
        "'startDate' should not be after 'endDate'",
      );
  }

  private createQueryBuilder(
    query: ListHistoryParamsDto,
  ): SelectQueryBuilder<History> {
    return this.historyRepository
      .createQueryBuilder('history')
      .offset(query.offset)
      .limit(query.limit)
      .where('wallet_id = :walledId', { walledId: query.walletId })
      .orderBy('created_at', query.sort);
  }

  private queryDateIfAvailable(
    params: ListHistoryParamsDto,
    queryBuilder: SelectQueryBuilder<any>,
    paramBase: string,
    column: string,
  ): void {
    const { startDate, endDate } = this.getPropertiesFromParams(
      params,
      paramBase,
    );

    if (startDate && endDate) {
      endDate.setHours(23, 59, 59);
      queryBuilder.andWhere(
        `${queryBuilder.alias}.${column} BETWEEN :startDate AND :endDate`,
        {
          startDate,
          endDate,
        },
      );
    } else {
      if (startDate) {
        queryBuilder.andWhere(`${queryBuilder.alias}.${column} >= :startDate`, {
          startDate,
        });
      }

      if (endDate) {
        endDate.setHours(23, 59, 59);
        queryBuilder.andWhere(`${queryBuilder.alias}.${column} <= :endDate`, {
          endDate,
        });
      }
    }
  }

  private getPropertiesFromParams(
    params: ListHistoryParamsDto,
    paramBase: string,
  ) {
    const endDate = params[`${paramBase}End`]
      ? new Date(params[`${paramBase}End`])
      : null;
    const startDate = params[`${paramBase}Start`]
      ? new Date(params[`${paramBase}Start`])
      : null;
    return { startDate, endDate };
  }

  private async list(
    queryBuilder: SelectQueryBuilder<any>,
    query: ListHistoryParamsDto,
  ) {
    const [data, totalCount] = await queryBuilder.getManyAndCount();

    return {
      totalCount,
      hasMore: this.hasMore(totalCount, query.limit, query.offset),
      limit: query.limit,
      offset: query.offset,
      data,
    };
  }

  private hasMore(totalCount: number, limit: number, offset: number): boolean {
    return totalCount > Number(limit) + Number(offset) ? true : false;
  }
}
