import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Resend } from "resend";
import {
    verificationEmailHtml,
    resetPasswordEmailHtml,
    passwordChangedEmailHtml,
} from "./email-templates.js";

@Injectable()
export class EmailService {
    private readonly resend: Resend;
    // "[EMAIL_ADDRESS]" was a literal placeholder here, never a real
    // sender — Resend rejects it as an invalid address on every call, which
    // silently failed since callers only .catch() and log. onboarding@resend.dev
    // is Resend's own no-setup sender, valid without a verified domain.
    private readonly fromAddress: string;

    constructor(private readonly configService: ConfigService) {
        this.resend = new Resend(configService.get<string>("RESEND_API_KEY"));
        this.fromAddress =
            this.configService.get<string>("EMAIL_FROM") ?? "MyTask <onboarding@resend.dev>";
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationLink = `${this.configService.get<string>("APP_URL")}/auth/verify?token=${token}`;

        await this.resend.emails.send({
            from: this.fromAddress,
            to: email,
            subject: "Verify your email address",
            html: verificationEmailHtml(verificationLink),
        });
    }

    async sendResetPasswordEmail(email: string, token: string) {
        const resetLink = `${this.configService.get<string>("APP_URL")}/auth/reset-password?token=${token}`;

        await this.resend.emails.send({
            from: this.fromAddress,
            to: email,
            subject: "Reset your password",
            html: resetPasswordEmailHtml(resetLink),
        });
    }

    async sendPasswordChangedEmail(email: string) {
        await this.resend.emails.send({
            from: this.fromAddress,
            to: email,
            subject: "Your password was changed",
            html: passwordChangedEmailHtml(email),
        });
    }
}
