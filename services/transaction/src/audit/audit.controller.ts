import { Controller, Get, Query } from '@nestjs/common';
import { AuditService } from './audit.service';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  async index(@Query() filters?: any) {
    return await this.auditService.find(filters);
  }
}
