import { IsNotEmpty, IsString } from "class-validator";

export class resetPasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string

    @IsString()
    @IsNotEmpty()
    password: string

}