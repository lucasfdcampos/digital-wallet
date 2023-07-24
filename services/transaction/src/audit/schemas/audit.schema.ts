import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AuditDocument = HydratedDocument<Audit>;

@Schema({ strict: false })
export class Audit {
  @Prop()
  id: string;

  @Prop()
  walletId: string;

  @Prop()
  value: number;

  @Prop()
  type: string;

  @Prop()
  status: string;

  @Prop()
  createdAt: string;

  constructor(audit?: Partial<Audit>) {
    this.id = audit?.id;
    this.walletId = audit?.walletId;
    this.value = audit?.value;
    this.type = audit?.type;
    this.status = audit?.status;
    this.createdAt = audit?.createdAt;
  }
}

export const AuditSchema = SchemaFactory.createForClass(Audit);
