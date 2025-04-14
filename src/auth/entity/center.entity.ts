import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RefreshTokenEntity } from './refreshToken.entity';
import { RecruitmentEntity } from 'src/recruitment/entity/recruitment.entity';
import { AuthorityEntity } from './authority.entity';

@Entity({ name: 'center' })
export class CenterEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Column({ type: 'varchar', name: 'signId', nullable: false, unique: true })
  signId: string;

  @Column({ type: 'varchar', name: 'password', nullable: false })
  password: string;

  @Column({
    type: 'varchar',
    name: 'centerName',
    nullable: false,
  })
  centerName: string;

  @Column({ type: 'varchar', name: 'ceoName', nullable: false })
  ceoName: string;

  @Column({
    type: 'varchar',
    name: 'businessId',
    unique: true,
    nullable: false,
  })
  businessId: string;

  @Column({ type: 'varchar', name: 'phone', nullable: false })
  phone: string;

  @Column({ type: 'varchar', name: 'email', nullable: false, unique: true })
  email: string;

  @Column({ type: 'varchar', name: 'address', nullable: false })
  address: string;

  @ManyToOne(() => AuthorityEntity, (authority) => authority.role, {
    eager: true,
    nullable: false,
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
  })
  authority: AuthorityEntity;

  @OneToMany(() => RefreshTokenEntity, (refreshToken) => refreshToken.center, {
    nullable: true,
    cascade: true,
  })
  refreshTokens: RefreshTokenEntity[];

  @OneToMany(() => RecruitmentEntity, (recruitment) => recruitment.center, {
    nullable: true,
    cascade: true,
  })
  recruitments: RecruitmentEntity[];
}
