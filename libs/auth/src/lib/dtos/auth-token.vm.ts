import { ApiProperty } from '@nestjs/swagger';

import type { IAuthToken, IAuthTokenUser } from '../jwt/auth-token.interface';

export class AuthTokenVM implements IAuthToken {
  @ApiProperty({ example: { id: 1, email: 'user@example.com', role: 'USER' } })
  readonly user!: IAuthTokenUser;
}
