import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from '../entities/transaction.entity';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ListTransactionParamsDto } from '../dto/list-transaction-query-params.dto';

@Injectable()
export class ListTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly TransactionRepository: Repository<Transaction>,
  ) {}

  async execute(query: ListTransactionParamsDto) {
    this.validatePeriod(query);

    const { startDate, endDate } = this.getPropertiesFromParams(
      query,
      'createdAt',
    );

    const whereOptions = { walletId: query.walletId };
    if (startDate && endDate) {
      endDate.setHours(23, 59, 59);
      whereOptions['createdAt'] = Between(startDate, endDate);
    } else if (startDate) {
      whereOptions['createdAt'] = MoreThanOrEqual(startDate);
    } else if (endDate) {
      endDate.setHours(23, 59, 59);
      whereOptions['createdAt'] = LessThanOrEqual(endDate);
    }

    const [data, totalCount] = await this.TransactionRepository.findAndCount({
      where: whereOptions,
      skip: query.offset,
      take: query.limit,
      order: {
        createdAt: query.sort,
      },
    });

    return {
      totalCount,
      hasMore: this.hasMore(totalCount, query.limit, query.offset),
      limit: query.limit,
      offset: query.offset,
      data,
    };
  }

  private validatePeriod(query: ListTransactionParamsDto) {
    const startDate = new Date(query.createdAtStart);
    const endDate = new Date(query.createdAtEnd);

    if (startDate.getTime() > endDate.getTime())
      throw new BadRequestException(
        "'startDate' should not be after 'endDate'",
      );
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

  private hasMore(totalCount: number, limit: number, offset: number): boolean {
    return totalCount > Number(limit) + Number(offset) ? true : false;
  }
}
