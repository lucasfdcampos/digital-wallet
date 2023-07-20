import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormConfig from './orm.config';
import { join } from 'path';
import { CommonModule } from './common/common.module';
import { AccountModule } from './account/account.module';
import { WalletModule } from './wallet/wallet.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...ormConfig,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
      autoLoadEntities: true,
    }),
    CommonModule,
    AccountModule,
    WalletModule,
    HistoryModule,
  ],
})
export class AppModule {}
