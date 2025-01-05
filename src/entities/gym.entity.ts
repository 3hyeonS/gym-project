import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'gyms'})
export class GymEntity{
    @PrimaryGeneratedColumn({type:'int', name:'id'})
    id: number;

    @Column({type:'text', name:'centerName'})
    centerName: string;

    @Column({type:'text', name:'location'})
    location: string;

    @Column({type:'text', name:'subway'})
    subway: string;

    @Column({type:'text', name:'workType'})
    workType: string;

    @Column({type:'text', name:'workTime'})
    workTime: string;

    @Column({type:'text', name:'workDays'})
    workDays: string;

    @Column({type:'text', name:'weekendDuty'})
    weekendDuty: string;

    @Column({type:'text', name:'salary'})
    salary: string;

    @Column({type:'text', name:'maxClassFee'})
    maxClassFee: string;

    @Column({type:'text', name:'gender'})
    gender: string;

    @Column({type:'text', name:'qualifications'})
    qualifications: string;

    @Column({type:'text', name:'preference'})
    preference: string;

    @Column({type:'text', name:'site'})
    site: string;

    @Column({type:'date', name:'date'})
    date: Date;

    @Column({type:'text', name:'description'})
    description: string;

    @Column({type:'text', name:'image'})
    image: string;
}