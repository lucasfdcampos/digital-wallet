import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from '../entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GetAccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(id: string): Promise<Account> {
    try {
      return await this.accountRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Account does not exist');
    }
  }
}
