import { Account } from 'src/account/entities/account.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'wallet ' })
export class Wallet extends AbstractEntity {
  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ type: 'varchar', length: 7, nullable: false })
  account_number: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: 'boolean', nullable: false, default: true })
  is_enabled: boolean;

  @ManyToOne(() => Account, (account) => account.id)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;
}
