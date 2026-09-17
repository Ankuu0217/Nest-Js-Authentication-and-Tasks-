import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { db } from '../db/index.js';
import { eq, and } from 'drizzle-orm';
import type { CreateTaskDto } from './dto/create-task.dto.js';

import { tasks } from '../db/schema.js';

@Injectable()
export class TasksService {

    async findAllForUser(userId: string) {
        return db.query.tasks.findMany({
            where: eq(tasks.userId, userId),
        })
    }
    async create(userId: string, dto: CreateTaskDto) {
        const [task] = await db.insert(tasks).values({
            userId,
            ...dto,
        }).returning()
        return task
    }
    async update(userId: string, id: string, data: Partial<CreateTaskDto>) {
        const task = await db.query.tasks.findFirst({
            where: eq(tasks.id, id),
        })
        if (!task) {
            throw new NotFoundException("Task not found");
        }
        if (task.userId !== userId) {
            throw new ForbiddenException("You are not authorized to update this task");
        }
        const [updatedTask] = await db.update(tasks).set({ ...data, updatedAt: new Date() }).where(eq(tasks.id, id)).returning()
        return updatedTask
    }
    async delete(userId: string, id: string) {
        const task = await db.query.tasks.findFirst({
            where: eq(tasks.id, id),
        })
        if (!task) {
            throw new NotFoundException("Task not found");
        }
        if (task.userId !== userId) {
            throw new ForbiddenException("You are not authorized to delete this task");
        }
        await db.delete(tasks).where(eq(tasks.id, id))
        return { message: "Task deleted successfully" }
    }

}
