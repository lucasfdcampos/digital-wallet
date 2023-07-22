import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { HistoryType } from 'src/common/enums/history-type.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'history' })
export class History extends AbstractEntity {
  @Column({ name: 'wallet_id' })
  @ApiProperty()
  walletId: string;

  @Column({ name: 'old_amount', type: 'decimal' })
  @ApiProperty()
  oldAmount: number;

  @Column({ name: 'new_amount', type: 'decimal' })
  @ApiProperty()
  newAmount: number;

  @Column({ type: 'enum', enum: HistoryType })
  @ApiProperty()
  type: HistoryType;

  @Column({ name: 'transaction_id' })
  @ApiProperty()
  transactionId: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.id)
  @JoinColumn({ name: 'wallet_id', referencedColumnName: 'id' })
  wallet: Wallet;
}
