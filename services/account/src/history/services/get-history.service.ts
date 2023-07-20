import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { History } from '../entities/history.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GetHistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  async execute(id: string) {
    try {
      return await this.historyRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('History does not exist');
    }
  }
}
