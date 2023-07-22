import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from '@common/entities/abstract.entity';
import { Wallet } from '@wallet/entities/wallet.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'account' })
export class Account extends AbstractEntity {
  @Column()
  @ApiProperty()
  name: string;

  @Column()
  @ApiProperty()
  email: string;

  @OneToMany(() => Wallet, (wallet) => wallet.account)
  @ApiProperty({ type: () => Wallet, isArray: true })
  wallets?: Wallet[];

  constructor(account?: Partial<Account>) {
    super();
    this.id = account?.id;
    this.name = account?.name;
    this.email = account?.email;
    this.createdAt = account?.createdAt;
    this.updatedAt = account?.updatedAt;
    this.deletedAt = account?.deletedAt;
  }
}
