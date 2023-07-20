import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Repository } from 'typeorm';
import { CreateWalletDto } from '../dto/create-wallet.dto';
import { Account } from 'src/account/entities/account.entity';

@Injectable()
export class CreateWalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}

  async execute(data: CreateWalletDto): Promise<Wallet> {
    await this.validateAccountExists(data.accountId);

    const wallet = this.walletRepository.create({ accountId: data.accountId });

    return await this.walletRepository.save(wallet);
  }

  private async validateAccountExists(accountId: string) {
    const account = await this.accountRepository.findOne({
      where: {
        id: accountId,
      },
    });

    if (!account) {
      throw new NotFoundException('Account does not exist');
    }
  }
}
