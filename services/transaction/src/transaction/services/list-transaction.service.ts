import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { ListTransactionParamsDto } from '../dto/list-transaction-query-params.dto';

@Injectable()
export class ListTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly TransactionRepository: Repository<Transaction>,
  ) {}

  async execute(query: ListTransactionParamsDto) {
    this.validatePeriod(query);

    const queryBuilder = this.createQueryBuilder(query);
    this.queryDateIfAvailable(query, queryBuilder, 'createdAt', 'created_at');
    return this.list(queryBuilder, query);
  }

  private validatePeriod(query: ListTransactionParamsDto) {
    const startDate = new Date(query.createdAtStart);
    const endDate = new Date(query.createdAtEnd);

    if (startDate.getTime() > endDate.getTime())
      throw new BadRequestException(
        "'startDate' should not be after 'endDate'",
      );
  }

  private createQueryBuilder(query: ListTransactionParamsDto) {
    return this.TransactionRepository.createQueryBuilder('transaction')
      .offset(query.offset)
      .limit(query.limit)
      .where('wallet_id = :walledId', { walledId: query.walletId })
      .orderBy('created_at', query.sort);
  }

  private queryDateIfAvailable(
    params: ListTransactionParamsDto,
    queryBuilder: SelectQueryBuilder<any>,
    paramBase: string,
    column: string,
  ) {
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
    params: ListTransactionParamsDto,
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
    query: ListTransactionParamsDto,
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
