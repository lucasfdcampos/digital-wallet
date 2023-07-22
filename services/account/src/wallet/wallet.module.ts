import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { CreateWalletService } from './services/create-wallet.service';
import { GetWalletService } from './services/get-wallet.service';
import { SendTransactionsService } from './services/send-transactions.service';
import { UpdateWalletAmountHandler } from './handler/update-wallet-amount.handler';

@Module({
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
