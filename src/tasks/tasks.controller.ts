import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import type { CreateTaskDto } from './dto/create-task.dto.js';
import type { User } from '../db/schema.js';
import { CurrentUser } from '../common/decorator/current-user-decorator.js';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';



@Controller('tasks')
@ApiTags('tasks')
export class TasksController {

    constructor(private tasksService: TasksService) {

    }


    @Get()
    @ApiOperation({ summary: 'Get all tasks for the logged-in user' })
    @ApiBearerAuth()
    findAll(@CurrentUser() user: User) {
        return this.tasksService.findAllForUser(user.id);
    }
    @Post()
    @ApiOperation({ summary: 'Create a new task for the logged-in user' })
    @ApiBearerAuth()
    create(@CurrentUser() user: User, @Body() dto: CreateTaskDto) {
        return this.tasksService.create(user.id, dto);
    }
    @Patch(':id')
    @ApiOperation({ summary: 'Update a task for the logged-in user' })
    @ApiBearerAuth()
    update(@CurrentUser() user: User, @Param('id') id: string, @Body() dto: Partial<CreateTaskDto>) {
        return this.tasksService.update(user.id, id, dto);
    }
    @Delete(':id')
    @ApiOperation({ summary: 'Delete a task for the logged-in user' })
    @ApiBearerAuth()
    delete(@CurrentUser() user: User, @Param('id') id: string) {
        return this.tasksService.delete(user.id, id);
    }


}



