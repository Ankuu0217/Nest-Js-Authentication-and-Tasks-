import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller.js';
import { UserModule } from '../users/user.module.js';

@Module({
  imports: [UserModule],
  controllers: [AdminController]
})
export class AdminModule { }
