import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from '../entities/wallet.entity';

@Injectable()
export class GetWalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async execute(id: string) {
    try {
      return await this.walletRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Wallet does not exist');
    }
  }
}
