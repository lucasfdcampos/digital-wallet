import { ApiProperty } from '@nestjs/swagger';
import { createHash } from 'crypto';
import { Account } from 'src/account/entities/account.entity';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { BeforeInsert, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { v4 } from 'uuid';

@Entity({ name: 'wallet' })
export class Wallet extends AbstractEntity {
  @Column({ name: 'account_id' })
  @ApiProperty()
  accountId: string;

  @Column({ type: 'varchar' })
  @ApiProperty()
  account_number: string;

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
