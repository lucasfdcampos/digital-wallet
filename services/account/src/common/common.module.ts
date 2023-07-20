import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from 'src/account/entities/account.entity';
import { History } from 'src/history/entities/history.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Account, Wallet, History])],
  exports: [TypeOrmModule.forFeature([Account, Wallet, History])],
})
export class CommonModule {}
