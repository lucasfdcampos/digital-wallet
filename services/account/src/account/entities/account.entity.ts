import { AbstractEntity } from 'src/common/entities/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'account' })
export class Account extends AbstractEntity {
  @Column()
  name: string;

  @Column()
  email: string;
}
