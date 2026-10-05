// src/config-data/config-data.controller.ts
import { Controller, Get, NotFoundException, Query, UseGuards } from '@nestjs/common';
import { ApiQuery, ApiSecurity } from '@nestjs/swagger';
import { ConfigManagerService } from './config-manager.service';
import { Scope } from 'src/types/scope.types';
import { ApiKeyGuard } from 'src/guards/api-key.guard';

@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/config')
export class ConfigManagerController {
  constructor(private readonly configManager: ConfigManagerService) {}

  @ApiQuery({ name: 'scope', enumName: "Scope", enum: Scope, description: "This the scope of the path" })
  @Get("value")
  async getConfig(
    @Query('path') path: string,
    @Query('scope') scope: Scope,
    @Query('scope_id') scopeId: number,
  ) {

    const data = await this.configManager.getCompiledConfig(path, scope, scopeId);
    if (!data) {
        throw new NotFoundException(`Value with Path "${path}" not found in configurations.`);
    }
    return { success: true, data };
  }
}
