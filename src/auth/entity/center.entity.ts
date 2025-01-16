import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'center' })
export class CenterEntity {
    @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
    id: number;

    @Column({ type: 'varchar', name: 'centerName' })
    centerName: string;

    @Column({ type: 'varchar', name: 'password' })
    password: string;

    @Column({ type: 'varchar', name: 'ceoName' })
    ceoName: string;

    @Column({ type: 'int', name: 'businessId' })
    businessId: number;

    @Column({ type: 'varchar', name: 'phone' })
    phone: string;

    @Column({ type: 'varchar', name: 'email', unique: true })
    email: string;

    @Column({ type: 'varchar', name: 'address' })
    address: string;
}