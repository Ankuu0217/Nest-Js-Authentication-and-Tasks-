import {
    Injectable,
    ExecutionContext,
    HttpException,
    HttpStatus,
    CanActivate,
    UnauthorizedException

} from "@nestjs/common"

import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../../users/user.service.js";
import { IS_PUBLIC_KEY } from "../decorator/public.decorator.js";
import { Observable } from "rxjs";

@Injectable()

export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) { }


    async canActivate(context: ExecutionContext): Promise<boolean> {

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true

        const request = context.switchToHttp().getRequest<Request & { user: any }>();
        const token = this.extractTokenFromHeader(request)

        if (!token) throw new UnauthorizedException("No token provided")

        let payload: { sub?: string; email?: string };
        try {
            payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get("JWT_ACCESS_SECRET")
            })
        }
        catch (err) {
            throw new UnauthorizedException("Invalid Token")
        }

        const user = await this.userService.findById(payload.sub!)

        if (!user) throw new UnauthorizedException("User not found")


        request.user = user
        return true
    }

    private extractTokenFromHeader(request: Request | undefined) {
        const [type, token] = (request?.headers as any)?.authorization?.split(" ") ?? [];

        return type === "Bearer" ? token : undefined;
    }
}