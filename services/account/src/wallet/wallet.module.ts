import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { CreateWalletService } from './services/create-wallet.service';
import { GetWalletService } from './services/get-wallet.service';

@Module({
  controllers: [WalletController],
  providers: [CreateWalletService, GetWalletService],
})
export class WalletModule {}
