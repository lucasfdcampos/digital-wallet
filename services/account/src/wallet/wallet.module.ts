import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { CreateWalletService } from './services/create-wallet.service';
import { GetWalletService } from './services/get-wallet.service';
import { SendTransactionsService } from './services/send-transactions.service';
import { UpdateWalletAmountHandler } from './handler/update-wallet-amount.handler';
import { UpdateWalletAmountService } from './services/update-wallet-amount.service';
import { CreateHistoryService } from 'src/history/services/create-history.service';

@Module({
  controllers: [WalletController],
  providers: [
    CreateWalletService,
    GetWalletService,
    SendTransactionsService,
    UpdateWalletAmountHandler,
    UpdateWalletAmountService,
    CreateHistoryService,
  ],
  exports: [UpdateWalletAmountHandler, UpdateWalletAmountService],
})
export class WalletModule {}
