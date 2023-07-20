import { Module } from '@nestjs/common';
import { HistoryController } from './history.controller';
import { ListHistoryService } from './services/list-history.service';
import { GetHistoryService } from './services/get-history.service';

@Module({
  controllers: [HistoryController],
  providers: [ListHistoryService, GetHistoryService],
})
export class HistoryModule {}
