const { AuthGuard } = require('@nestjs/passport');

export class UserGuard extends AuthGuard('jwt') {}
