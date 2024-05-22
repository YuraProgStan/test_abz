import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TokenService } from '../../token/token.service';

@Injectable()
export class TokenValidationInterceptor implements NestInterceptor {
  constructor(private readonly tokenService: TokenService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException({ message: 'user is not auth' });
    }
    const bearer = authHeader.split(' ')[0];
    const token = authHeader.split(' ')[1];
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException({ message: 'user is not auth' });
    }

    if (!token) {
      throw new UnauthorizedException('Missing authorization token');
    }

    const tokenValidationResult = this.tokenService.validateToken(token);
    console.log('tokenValidationResult');
    console.log(tokenValidationResult);

    if (!tokenValidationResult.valid) {
      if (tokenValidationResult.message === 'Token has expired') {
        throw new UnauthorizedException('The token expired');
      } else {
        throw new UnauthorizedException(
          tokenValidationResult.message || 'Invalid authorization token',
        );
      }
    }

    return next.handle().pipe(
      catchError((error) => {
        throw error;
      }),
    );
  }
}
