const { AuthGuard } = require('@nestjs/passport');

export class JwtGuard extends AuthGuard('jwt') {}
