import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { CreateAccountService } from './services/create-account.service';
import { GetAccountService } from './services/get-account.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Wallet } from '@wallet/entities/wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Wallet])],
  controllers: [AccountController],
  providers: [CreateAccountService, GetAccountService],
})
export class AccountModule {}
