import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Logger,
    UnauthorizedException,
    ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorator/roles.decorator.js";
import { Request } from "express";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest<Request & { user: any }>();


        const hasRole = requiredRoles.includes(user.role);

        if (!hasRole) {
            throw new ForbiddenException("You do not have permission to access this resource");
        }

        return true;
    }
}