import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { EmailService } from "./email.service.js";
import { UserModule } from "../users/user.module.js";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [
        UserModule,
        JwtModule.register({})
    ],
    controllers: [AuthController],
    providers: [AuthService, EmailService],
    exports: [AuthService, EmailService],
})

export class AuthModule { }