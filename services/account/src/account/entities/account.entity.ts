import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity({ name: 'account' })
export class Account extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  email: string;

  @OneToMany(() => Wallet, (wallet) => wallet.account)
  wallets: Wallet[];
}
