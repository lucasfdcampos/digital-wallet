import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { CreateWalletService } from './services/create-wallet.service';
import { GetWalletService } from './services/get-wallet.service';
import { SendTransactionsService } from './services/send-transactions.service';

@Module({
  controllers: [WalletController],
  providers: [CreateWalletService, GetWalletService, SendTransactionsService],
})
export class WalletModule {}
