import { Controller, Get, Delete, Param } from '@nestjs/common';

import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from '../common/decorator/roles.decorator.js';
import { UserService } from '../users/user.service.js';

@Controller('admin')
@ApiBearerAuth()
@Roles('admin')
@ApiTags('admin')
export class AdminController {

    constructor(private readonly usersService: UserService) { }

    @Get("users")
    @ApiOperation({ summary: 'Get all users' })
    findAll() {
        return this.usersService.findAll();
    }
    @Delete(":id")
    @ApiOperation({ summary: 'Delete a user' })
    delete(@Param("id") id: string) {
        return this.usersService.delete(id);
    }



}
