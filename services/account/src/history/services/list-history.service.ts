import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ListHistoryParamsDto } from '../dto/list-history-query-params.dto';
import { History } from '../entities/history.entity';
import { Wallet } from '@wallet/entities/wallet.entity';

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

    const [data, totalCount] = await this.historyRepository.findAndCount({
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

  private hasMore(totalCount: number, limit: number, offset: number): boolean {
    return totalCount > Number(limit) + Number(offset) ? true : false;
  }
}
