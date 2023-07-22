import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { CommonModule } from './common/common.module';
import { AccountModule } from './account/account.module';
import { WalletModule } from './wallet/wallet.module';
import { HistoryModule } from './history/history.module';
import { KafkaModule } from './kafka/kafka.module';
import { Consumer } from './consumer';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      logging: true,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
      autoLoadEntities: true,
    }),
    CommonModule,
    KafkaModule,
    AccountModule,
    WalletModule,
    HistoryModule,
  ],
  providers: [Consumer],
})
export class AppModule {}
