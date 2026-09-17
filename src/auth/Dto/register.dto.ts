import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(6)
    password: string;

    @IsString()
    @MinLength(3)
    name: string;

    @IsOptional()
    @IsEnum(['user'])
    role?: string;

}
