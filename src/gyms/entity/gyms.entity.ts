import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name:'gymsUpdate'})
export class GymEntity{
    @PrimaryGeneratedColumn({type:'int', name:'id'})
    id: number;

    @Column({type:'text', name:'centerName'})
    centerName: string;

    @Column({type:'text', name:'city'})
    city: string;

    @Column({type:'json', name:'location'})
    location: string[];

    @Column({type:'json', name:'subway'})
    subway: string[];

    @Column({type:'json', name:'workType'})
    workType: string[];

    @Column({type:'json', name:'workTime'})
    workTime: string[];

    @Column({type:'json', name:'workDays'})
    workDays: string[];

    @Column({type:'json', name:'weekendDuty'})
    weekendDuty: string[];

    @Column({type:'json', name:'salary'})
    salary: string[];

    @Column({type:'int', name:'maxClassFee'})
    maxClassFee: number;

    @Column({type:'json', name:'gender'})
    gender: string[];

    @Column({type:'json', name:'qualifications'})
    qualifications: string[];

    @Column({type:'json', name:'preference'})
    preference: string[];

    @Column({type:'json', name:'site'})
    site: string[];

    @Column({type:'date', name:'date'})
    date: Date;

    @Column({type:'text', name:'description'})
    description: string;

    @Column({type:'json', name:'image'})
    image: string[];
}