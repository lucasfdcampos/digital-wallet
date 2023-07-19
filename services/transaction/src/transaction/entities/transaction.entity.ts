import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity } from 'typeorm';
import { TransactionType } from '../enums/transaction-type.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

@Entity({ name: 'transaction' })
export class Transaction extends AbstractEntity {
  @Column({ name: 'wallet_id' })
  walletId: string;

  @Column({ type: 'decimal' })
  value: number;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'enum', enum: TransactionStatus })
  status: TransactionStatus;

  @Column({ name: 'original_transaction_id' })
  originalTransactionId: string;
}
