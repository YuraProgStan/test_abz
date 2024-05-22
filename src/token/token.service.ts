import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  private readonly TOKEN_SECRET: string;
  private readonly TOKEN_EXPIRATION: string;

  constructor(
    private readonly configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.TOKEN_SECRET = this.configService.get<string>('jwt.TOKEN_SECRET');
    this.TOKEN_EXPIRATION = this.configService.get<string>(
      'jwt.TOKEN_EXPIRATION',
    );
  }
  generateToken() {
    const expirationInSeconds = this.parseTimeToSeconds(this.TOKEN_EXPIRATION);
    const expirationTimestamp =
      Math.floor(Date.now() / 1000) + expirationInSeconds;
    const payload = {
      id: this.generateUniqueId(),
      exp: expirationTimestamp,
      used: false,
    };

    return {
      success: true,
      token: this.jwtService.sign(payload, { secret: this.TOKEN_SECRET }),
    };
  }

  validateToken(token: string): { valid: boolean; message?: string } {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.TOKEN_SECRET,
      });

      // Check if token has expired
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return { valid: false, message: 'Token has expired' };
      }

      // If verification succeeds and token is not expired, it's valid
      return { valid: true };
    } catch (error) {
      // If verification fails, the token is invalid
      return { valid: false, message: 'Invalid token' };
    }
  }

  private generateUniqueId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private parseTimeToSeconds(timeString: string): number {
    const value = parseInt(timeString); // Extract the numeric value
    const unit = timeString.slice(-1); // Extract the unit ('m' for minutes in this case)

    switch (unit) {
      case 's':
        return value; // seconds
      case 'm':
        return value * 60; // minutes to seconds
      case 'h':
        return value * 3600; // hours to seconds
      default:
        throw new Error('Invalid time unit');
    }
  }
}
