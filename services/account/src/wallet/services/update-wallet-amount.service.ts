import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Wallet } from '../entities/wallet.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UpdateWalletAmountService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async execute(id: string, amountChange: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { id },
    });

    const oldAmount = parseFloat(wallet.amount.toString());
    const newAmount = oldAmount + parseFloat(amountChange.toString());

    wallet.amount = parseFloat(newAmount.toString());

    return this.walletRepository.save(wallet);
  }
}
