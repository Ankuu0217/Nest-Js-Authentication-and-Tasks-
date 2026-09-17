import {
    Injectable,
    ConflictException,
    UnauthorizedException,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";

import * as bcrypt from "bcryptjs";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { EmailService } from "./email.service.js";
import { UserService } from "../users/user.service.js";
import type { RegisterDto } from "./Dto/register.dto.js";
import type { LoginDto } from "./Dto/login.dto.js";
import { Response } from "express";
import * as crypto from "crypto";
import type { User } from "../db/schema.js"

@Injectable()

export class AuthService {
    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
        private emailService: EmailService,
        private userService: UserService,
    ) { }

    async register(Dto: RegisterDto) {
        const existingUser = await this.userService.findByEmail(Dto.email);
        if (existingUser) {
            throw new ConflictException("User already exists");
        }

        const passwordHash = await bcrypt.hash(Dto.password, 10);

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const user = await this.userService.create({
            email: Dto.email,
            passwordHash,
            name: Dto.name,
            verificationToken,
            verificationTokenExpiresAt
        });

        void this.emailService.sendVerificationEmail(Dto.email, verificationToken).catch((error: unknown) => {
            console.error("Failed to send verification email:", error);
        });

        return { message: "User registered successfully" };
    }

    async resendVerificationEmail(email: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        if (user.isVerified) {
            throw new BadRequestException("Email is already verified");
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await this.userService.update(user.id, {
            verificationToken,
            verificationTokenExpiresAt,
        });

        void this.emailService.sendVerificationEmail(user.email, verificationToken).catch((error: unknown) => {
            console.error("Failed to send verification email:", error);
        });

        return { message: "Verification email sent successfully" };
    }

    async login(Dto: LoginDto, response: Response) {
        const user = await this.userService.findByEmail(Dto.email);
        if (!user) {
            throw new NotFoundException("User not found");
        }

        const isMatch = await bcrypt.compare(Dto.password, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException("Invalid password");
        }

        if (!user.isVerified) {
            throw new BadRequestException("Please verify your email");
        }

        const token = await this.generateToken(user)
        await this.saveRefreshToken(user.id, token.refreshToken)
        await this.setRefreshTokenCookie(response, token.refreshToken)

        return {
            accessToken: token.accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        };
    }

    async forgotPassword(email: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new NotFoundException("User not found");
        }
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
        await this.userService.update(user.id, {
            resetToken,
            resetTokenExpiresAt
        });
        void this.emailService.sendResetPasswordEmail(user.email, resetToken).catch((error: unknown) => {
            console.error("Failed to send reset-password email:", error);
        });
        return { message: "Forgot password email sent successfully" };
    }

    async resetPassword(token: string, newPassword: string) {
        const user = await this.userService.findResetToken(token);
        if (!user || !user.resetToken) {
            throw new NotFoundException("User not found");
        }
        if (!user.resetTokenExpiresAt || user.resetTokenExpiresAt < new Date()) {
            throw new BadRequestException("Token expired");
        }
        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.userService.update(user.id, {
            passwordHash,
            resetToken: null,
            resetTokenExpiresAt: null,
        });

        void this.emailService.sendPasswordChangedEmail(user.email).catch((error: unknown) => {
            console.error("Failed to send password-changed email:", error);
        });
        return { message: "Password reset successfully" };
    }

    async verifyEmail(token: string, response: Response) {
        const user = await this.userService.findByToken(token);
        if (!user || !user.verificationToken) {
            throw new NotFoundException("User not found");
        }
        if (!user.verificationTokenExpiresAt || user.verificationTokenExpiresAt < new Date()) {
            throw new BadRequestException("Token expired");
        }
        await this.userService.update(user.id, {
            isVerified: true,
            verificationToken: null,
            verificationTokenExpiresAt: null,
        });
        const tokens = await this.generateToken(user);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        await this.setRefreshTokenCookie(response, tokens.refreshToken);

        return {
            accessToken: tokens.accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        };
    }

    async logout(userId: string, response: Response) {
        await this.userService.update(userId, {
            refreshTokenHash: null,
        });
        response.clearCookie("refresh_token");
        return { message: "Logout successful" };
    }

    async refresh(refreshToken: string, response: Response) {
        if (!refreshToken) {
            throw new UnauthorizedException("Refresh token not found");
        }
        let payload: { sub: string; email: string };
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
            });
        } catch (error) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const user = await this.userService.findById(payload.sub);

        if (!user || !user.refreshTokenHash) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!isMatch) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const token = await this.generateToken(user);
        await this.saveRefreshToken(user.id, token.refreshToken);
        await this.setRefreshTokenCookie(response, token.refreshToken);

        return {
            accessToken: token.accessToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        }
    }

    private async generateToken(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>("JWT_ACCESS_SECRET"),
            expiresIn: this.configService.get<string>("JWT_ACCESS_EXPIRES_IN") as any,
        });
        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.configService.get<string>("JWT_REFRESH_SECRET"),
            expiresIn: this.configService.get<string>("JWT_REFRESH_EXPIRES_IN") as any,
        });
        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(userId: string, refreshToken: string) {
        const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
        await this.userService.update(userId, {
            refreshTokenHash,
        });
    }
    private async setRefreshTokenCookie(response: Response, refreshToken: string) {
        response.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: this.configService.get<string>("NODE_ENV") === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });
    }
}