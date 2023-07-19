import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as ormConfig from './orm.config';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...ormConfig,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
    }),
  ],
})
export class AppModule {}
