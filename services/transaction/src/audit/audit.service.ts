import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Audit, AuditDocument } from './schemas/audit.schema';
import { Model } from 'mongoose';
import { CreateAuditDto } from './dto/create-audit.dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectModel(Audit.name) private auditModel: Model<AuditDocument>,
  ) {}

  async create(createAuditDto: CreateAuditDto): Promise<Audit> {
    const createdAudit = await this.auditModel.create(createAuditDto);
    return await createdAudit.save();
  }

  async find(filters?: any): Promise<Audit[]> {
    const data = await this.auditModel
      .find(filters)
      .sort({ createdAt: 1 })
      .exec();
    return data;
  }
}
