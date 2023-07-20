import { Injectable, NotFoundException } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GetTransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async execute(id: string) {
    try {
      return await this.transactionRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Transaction does not exist');
    }
  }
}
