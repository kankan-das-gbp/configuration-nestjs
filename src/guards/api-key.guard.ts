import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private allowedKey: string;

  constructor(private configService: ConfigService) {
    this.allowedKey = this.configService.get<string>('API_KEY') || '';
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];

    if (!apiKey || !this.allowedKey === apiKey) {
      throw new UnauthorizedException('Missing, corrupted or invalid operational verification authentication token structural signature payload.');
    }
    return true;
  }
}
