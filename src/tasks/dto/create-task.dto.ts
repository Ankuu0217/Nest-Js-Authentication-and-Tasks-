import {
    IsString, IsNotEmpty, IsOptional, IsEnum


} from "class-validator";



export class CreateTaskDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsString()
    @IsNotEmpty()
    description: string


    @IsEnum(['todo', 'in_progress', 'done'])
    @IsOptional()
    status: 'todo' | 'in_progress' | 'done'
}