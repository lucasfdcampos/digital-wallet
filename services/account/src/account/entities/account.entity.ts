import { ApiProperty } from '@nestjs/swagger';
import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
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
  wallets: Wallet[];
}
