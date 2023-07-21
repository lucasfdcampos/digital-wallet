import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { History } from '../entities/history.entity';
import { CreateHistoryDto } from '../dto/create-history.dto';

@Injectable()
export class CreateHistoryService {
  constructor(
    @InjectRepository(History)
    private readonly historyRepository: Repository<History>,
  ) {}

  async execute(data: CreateHistoryDto): Promise<void> {
    await this.historyRepository.save(this.historyRepository.create(data));
  }
}
