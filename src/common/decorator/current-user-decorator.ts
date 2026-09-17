import { createParamDecorator, ExecutionContext } from "@nestjs/common"

import { Request } from "express"
import { User } from "../../db/schema.js"

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request & { user: User | undefined }>()
    return request.user
})