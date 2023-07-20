import { Module } from '@nestjs/common';
import { AccountController } from './account.controller';
import { CreateAccountService } from './services/create-account.service';
import { GetAccountService } from './services/get-account.service';

@Module({
  controllers: [AccountController],
  providers: [CreateAccountService, GetAccountService],
})
export class AccountModule {}
