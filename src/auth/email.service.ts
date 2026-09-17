import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createTransport, type Transporter } from "nodemailer";
import {
    verificationEmailHtml,
    resetPasswordEmailHtml,
    passwordChangedEmailHtml,
} from "./email-templates.js";

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private readonly transporter: Transporter;
    // Sending through the Gmail account's own SMTP relay rather than a
    // transactional-email provider (Resend, SendGrid, ...) sidesteps their
    // "verify a domain before sending to arbitrary recipients" sandbox
    // restriction entirely — Gmail already trusts its own accounts, so
    // there's nothing to verify. The trade-off is Gmail's own sending
    // limits (~500/day on a free account) and slightly higher spam-filter
    // risk than a dedicated ESP with a verified domain; both are fine at
    // this project's scale.
    private readonly fromAddress: string;

    constructor(private readonly configService: ConfigService) {
        const user = this.configService.get<string>("SMTP_USER");
        const pass = this.configService.get<string>("SMTP_PASSWORD");

        if (!user || !pass) {
            this.logger.warn(
                "SMTP_USER / SMTP_PASSWORD are not set — every email send will fail. " +
                "Generate a Gmail App Password (requires 2-Step Verification enabled) " +
                "and set both in .env.",
            );
        }

        // Gmail requires the envelope "from" address to be the authenticated
        // account itself (or a verified alias) — it silently rewrites or
        // rejects anything else, so this is derived from SMTP_USER rather
        // than left independently configurable, unlike the old EMAIL_FROM.
        this.fromAddress = `"MyTask" <${user}>`;
        this.transporter = createTransport({
            service: "gmail",
            auth: { user, pass },
        });
    }

    async sendVerificationEmail(email: string, token: string) {
        const verificationLink = `${this.configService.get<string>("APP_URL")}/auth/verify?token=${token}`;

        await this.transporter.sendMail({
            from: this.fromAddress,
            to: email,
            subject: "Verify your email address",
            html: verificationEmailHtml(verificationLink),
        });
    }

    async sendResetPasswordEmail(email: string, token: string) {
        const resetLink = `${this.configService.get<string>("APP_URL")}/auth/reset-password?token=${token}`;

        await this.transporter.sendMail({
            from: this.fromAddress,
            to: email,
            subject: "Reset your password",
            html: resetPasswordEmailHtml(resetLink),
        });
    }

    async sendPasswordChangedEmail(email: string) {
        await this.transporter.sendMail({
            from: this.fromAddress,
            to: email,
            subject: "Your password was changed",
            html: passwordChangedEmailHtml(email),
        });
    }
}
