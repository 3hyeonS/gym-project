import { IsNotEmpty, MaxLength } from "class-validator";

export class SignInRequestDto {
    @IsNotEmpty()
    @MaxLength(20)
    password: string;

    @IsNotEmpty()
    @MaxLength(100)
    email: string;
}