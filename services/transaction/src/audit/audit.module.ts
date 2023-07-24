import { Module } from '@nestjs/common';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Audit, AuditSchema } from './schemas/audit.schema';
import { KafkaModule } from '@kafka/kafka.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Audit.name, schema: AuditSchema }]),
    KafkaModule,
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}
