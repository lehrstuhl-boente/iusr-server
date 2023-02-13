import { CanActivate, ExecutionContext } from '@nestjs/common';

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Express.Request = context.switchToHttp().getRequest();
    if ('user' in request) {
      return request.user['isAdmin'];
    }
    return false;
  }
}
