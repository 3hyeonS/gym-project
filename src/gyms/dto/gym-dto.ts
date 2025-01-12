import { GymEntity } from "../entity/gyms.entity";

export class gymDto implements GymEntity{   
    id: number;
    centerName: string;
    city: string;
    location: string[];
    subway: string[];
    workType: string[];
    workTime: string[];
    workDays: string[]
    weekendDuty: string[];
    salary: string[];
    maxClassFee: number;
    gender: string[];
    qualifications: string[];
    preference: string[];
    site: string[];
    date: Date;
    description: string;
    image: string[];
}