import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'test'})
export class GymEntity{
    @PrimaryGeneratedColumn({type:'int', name:'id'})
    id: number;

    @Column({type:'text', name:'centerName'})
    centerName: string;

    @Column({type:'text', name:'city'})
    city: string;

    @Column({type:'json', name:'location'})
    location: JSON;

    @Column({type:'json', name:'subway'})
    subway: JSON;

    @Column({type:'json', name:'workType'})
    workType: JSON;

    @Column({type:'json', name:'workTime'})
    workTime: JSON;

    @Column({type:'json', name:'workDays'})
    workDays: JSON;

    @Column({type:'json', name:'weekendDuty'})
    weekendDuty: JSON;

    @Column({type:'json', name:'salary'})
    salary: JSON;

    @Column({type:'int', name:'maxClassFee'})
    maxClassFee: number;

    @Column({type:'json', name:'gender'})
    gender: JSON;

    @Column({type:'json', name:'qualifications'})
    qualifications: JSON;

    @Column({type:'json', name:'preference'})
    preference: JSON;

    @Column({type:'json', name:'site'})
    site: JSON;

    @Column({type:'date', name:'date'})
    date: Date;

    @Column({type:'text', name:'description'})
    description: string;

    @Column({type:'text', name:'image'})
    image: string;
}