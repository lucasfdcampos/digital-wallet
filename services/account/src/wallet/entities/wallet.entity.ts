import { ApiProperty } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { Account } from '@account/entities/account.entity';
import { AbstractEntity } from '@common/entities/abstract.entity';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { v4 } from 'uuid';

@Entity({ name: 'wallet' })
export class Wallet extends AbstractEntity {
  @Column({ name: 'account_id' })
  @ApiProperty()
  accountId: string;

  @Column({ name: 'account_number', type: 'varchar' })
  @ApiProperty()
  accountNumber: string;

  @Column({ type: 'decimal', default: 0 })
  @ApiProperty()
  amount: number;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  @ApiProperty()
  isEnabled: boolean;

  @ManyToOne(() => Account, (account) => account.id)
  @JoinColumn({ name: 'account_id', referencedColumnName: 'id' })
  account: Account;

  @BeforeInsert()
  setDefaultValueForIsEnabled?() {
    this.isEnabled = true;
  }

  @BeforeInsert()
  generateAccountNumber?() {
    const combinedValue = `${v4()}-${this.accountId}-${Date.now()}`;
    const hash = createHash('sha256').update(combinedValue).digest('hex');
    this.accountNumber = hash.replace(/\D/g, '').slice(0, 7);
  }

  constructor(wallet?: Partial<Wallet>) {
    super();
    this.id = wallet?.id;
    this.accountId = wallet?.accountId;
    this.accountNumber = wallet?.accountNumber;
    this.amount = wallet?.amount;
    this.isEnabled = wallet?.isEnabled;
    this.account = wallet?.account;
  }
}
