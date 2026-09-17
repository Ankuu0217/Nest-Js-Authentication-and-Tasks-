import { Controller, Post, Body, HttpCode, Res, Req, HttpStatus, Get, Query } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { RegisterDto } from "./Dto/register.dto.js";
import { LoginDto } from "./Dto/login.dto.js";
import { ApiBearerAuth, ApiTags, ApiCookieAuth, ApiOperation } from "@nestjs/swagger";
import { Public } from "../common/decorator/public.decorator.js";
import { CurrentUser } from "../common/decorator/current-user-decorator.js";
import type { User } from "../db/schema.js";
import type { Request, Response } from 'express'
import { ForgotPasswordDto } from "./Dto/Forgot-password.dto.js";
import { resetPasswordDto } from "./Dto/reset-password.dto.js";
import { ResendVerificationDto } from "./Dto/resend-verification.dto.js";
import { Throttle } from "@nestjs/throttler";

@Controller("auth")
@ApiTags("Authentication")
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @ApiOperation({ summary: "Register a new user" })
    @Post("register")
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Public()
    @ApiOperation({ summary: "Verify email" })
    @Get()
    async verifyEmail(@Query("token") token: string, @Res({ passthrough: true }) res: Response) {
        return this.authService.verifyEmail(token, res);
    }

    @Throttle({ default: { ttl: 60000, limit: 3 } })
    @Public()
    @ApiOperation({ summary: "Resend the verification email" })
    @Post("resend-verification")
    async resendVerification(@Body() dto: ResendVerificationDto) {
        return this.authService.resendVerificationEmail(dto.email);
    }

    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @Public()
    @ApiOperation({ summary: "Login with email and password" })
    @HttpCode(HttpStatus.OK)
    @Post("login")
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
        return this.authService.login(dto, res);
    }


    @Public()
    @ApiOperation({ summary: "Refresh access token" })
    @ApiCookieAuth()
    @HttpCode(HttpStatus.OK)
    @Post("refresh")
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const cookies = req.cookies as Record<string, string>;
        const refreshToken = cookies?.refresh_token;
        return this.authService.refresh(refreshToken, res);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: "Logout" })
    @HttpCode(HttpStatus.OK)
    @Post("logout")
    async logout(@CurrentUser() user: User, @Res({ passthrough: true }) res: Response) {
        return this.authService.logout(user.id, res);
    }


    @Get("me")
    @ApiOperation({ summary: "Get current user" })
    @ApiBearerAuth()
    async me(@CurrentUser() user: User) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,

        };
    }

    @Post("forgot-password")
    @ApiOperation({ summary: "Forgot password" })
    @Public()
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        return this.authService.forgotPassword(dto.email);
    }

    @Public()
    @Post("reset-password")
    @ApiOperation({ summary: "Reset password" })
    @Public()
    async resetPassword(@Body() dto: resetPasswordDto) {
        return this.authService.resetPassword(dto.token, dto.password);
    }


}