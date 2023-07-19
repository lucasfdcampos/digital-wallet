import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { HistoryType } from '../enums/history-type.enum';
import { AbstractEntity } from 'src/common/entities/abstract.entity';

@Entity({ name: 'history' })
export class History extends AbstractEntity {
  @Column({ name: 'wallet_id' })
  walletId: string;

  @Column({ name: 'old_amount', type: 'decimal' })
  oldAmount: number;

  @Column({ name: 'new_amount', type: 'decimal' })
  newAmount: number;

  @Column({ type: 'enum', enum: HistoryType })
  type: HistoryType;

  @ManyToOne(() => Wallet, (wallet) => wallet.id)
  @JoinColumn({ name: 'wallet_id', referencedColumnName: 'id' })
  wallet: Wallet;
}
