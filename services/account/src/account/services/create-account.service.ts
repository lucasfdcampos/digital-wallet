import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../entities/account.entity';
import { CreateAccountDto } from '../dto/create-account.dto';

@Injectable()
export class CreateAccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(data: CreateAccountDto): Promise<Account> {
    await this.validateExistingAccount(data.email);

    return await this.accountRepository.save(
      this.accountRepository.create(data),
    );
  }

  private async validateExistingAccount(email: string): Promise<void> {
    const existingAccount = await this.accountRepository.findOne({
      where: { email: email },
    });

    if (existingAccount) {
      throw new UnprocessableEntityException('Email already exists');
    }
  }
}
