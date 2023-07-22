import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'transaction' })
export class Transaction {
  @Column()
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ name: 'wallet_id' })
  @ApiProperty()
  walletId: string;

  @Column({ type: 'decimal' })
  @ApiProperty()
  value: number;

  @Column({ type: 'enum', enum: TransactionType })
  @ApiProperty()
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus })
  @ApiProperty()
  status: TransactionStatus;

  @Column({ name: 'original_transaction_id' })
  @ApiProperty()
  originalTransactionId: string;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  @ApiProperty()
  updatedAt: Date;

  @DeleteDateColumn({
    type: 'timestamp with time zone',
    name: 'deleted_at',
  })
  @ApiProperty()
  deletedAt: Date;

  @BeforeUpdate()
  beforeUpdatesActions?() {
    this.updatedAt = new Date();
  }

  @BeforeInsert()
  beforeInsertsActions?() {
    this.createdAt = new Date();
  }

  constructor(transaction?: Partial<Transaction>) {
    this.id = transaction?.id;
    this.walletId = transaction?.walletId;
    this.value = transaction?.value;
    this.type = transaction?.type;
    this.status = transaction?.status;
    this.originalTransactionId = transaction?.originalTransactionId;
    this.createdAt = transaction?.createdAt;
    this.updatedAt = transaction?.updatedAt;
    this.deletedAt = transaction?.deletedAt;
  }
}
