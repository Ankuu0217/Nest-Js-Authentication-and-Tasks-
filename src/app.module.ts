import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './users/user.module.js';
import { AuthModule } from './auth/auth.module.js';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guards.js';
import { RolesGuard } from './common/guards/roles.guards.js';
import { TasksModule } from './tasks/tasks.module.js';
import { AdminModule } from './admin/admin.module.js';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';


@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      expandVariables: true
    }), UserModule, AuthModule, JwtModule.register({
      global: true,

    }), TasksModule, AdminModule],
  controllers: [AppController],
  providers: [AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    {

      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }, {
      provide: APP_GUARD,
      useClass: RolesGuard
    }],
})
export class AppModule { }
