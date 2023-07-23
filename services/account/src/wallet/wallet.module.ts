import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { CreateWalletService } from './services/create-wallet.service';
import { GetWalletService } from './services/get-wallet.service';
import { SendTransactionsService } from './services/send-transactions.service';
import { UpdateWalletAmountHandler } from './handler/update-wallet-amount.handler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from '@account/entities/account.entity';
import { Wallet } from './entities/wallet.entity';
import { KafkaModule } from '@kafka/kafka.module';
import { History } from '@history/entities/history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Wallet, History]), KafkaModule],
  controllers: [WalletController],
  providers: [
    CreateWalletService,
    GetWalletService,
    SendTransactionsService,
    UpdateWalletAmountHandler,
  ],
  exports: [UpdateWalletAmountHandler],
})
export class WalletModule {}
