import { Injectable } from "@nestjs/common";
import { db } from "../db/index.js";
import { user } from "../db/schema.js";
import { eq } from "drizzle-orm";
import type { NewUser, User } from "../db/schema.js";

@Injectable()
export class UserService {
    async findByEmail(email: string) {
        return db.query.user.findFirst({
            where: eq(user.email, email),
        });
    }

    async findResetToken(token: string) {
        return db.query.user.findFirst({
            where: eq(user.resetToken, token),
        });
    }

    async findByToken(token: string) {
        return db.query.user.findFirst({
            where: eq(user.verificationToken, token),
        });
    }

    async findById(id: string) {
        return db.query.user.findFirst({
            where: eq(user.id, id),
        });
    }

    async create(data: NewUser) {
        const [User] = await db.insert(user).values(data).returning();
        return User;
    }

    async update(id: string, data: Partial<NewUser>) {
        const [updatedUser] = await db.update(user)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(user.id, id))
            .returning();
        return updatedUser;
    }

    // Only ever called from AdminController — deliberately returns none of
    // passwordHash / refreshTokenHash / verificationToken / resetToken, which
    // .returning() with no column list would otherwise include in full.
    async delete(id: string) {
        const [deletedUser] = await db
            .delete(user)
            .where(eq(user.id, id))
            .returning({
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            });
        return deletedUser;
    }

    // Same reasoning as delete() above — an admin-facing user list must never
    // include password hashes or live session/reset/verification tokens.
    async findAll() {
        return db.query.user.findMany({
            columns: {
                id: true,
                email: true,
                name: true,
                role: true,
                isVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
}