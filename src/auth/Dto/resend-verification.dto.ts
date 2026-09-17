import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ResendVerificationDto {
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string
}
