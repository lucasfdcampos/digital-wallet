import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { ListHistoryService } from './services/list-history.service';
import { GetHistoryService } from './services/get-history.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from '@wallet/entities/wallet.entity';
import { History } from './entities/history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, History])],
  controllers: [HistoryController],
  providers: [ListHistoryService, GetHistoryService],
})
export class HistoryModule {}
