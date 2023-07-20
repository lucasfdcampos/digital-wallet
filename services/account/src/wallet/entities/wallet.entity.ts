import { createHash } from 'crypto';
import { Account } from 'src/account/entities/account.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { v4 } from 'uuid';

@Entity({ name: 'wallet' })
export class Wallet extends AbstractEntity {
  @Column({ name: 'account_id' })
  accountId: string;

  @Column({ type: 'varchar' })
  account_number: string;

  @Column({ type: 'decimal', default: 0 })
  amount: number;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @ManyToOne(() => Account, (account) => account.id)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;

  @BeforeInsert()
  setDefaultValueForIsEnabled() {
    this.isEnabled = true;
  }

  @BeforeInsert()
  generateAccountNumber() {
    const combinedValue = `${v4()}-${this.accountId}-${Date.now()}`;
    const hash = createHash('sha256').update(combinedValue).digest('hex');
    this.account_number = hash.replace(/\D/g, '').slice(0, 7);
  }
}
