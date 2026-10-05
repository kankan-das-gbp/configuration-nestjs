import { Controller, Get, Param, NotFoundException, UseGuards } from '@nestjs/common';
import { Scope } from 'src/types/scope.types';
import { ConfigXmlLoaderService } from './config-xml-loader.service';
import { ApiKeyGuard } from 'src/guards/api-key.guard';
import { ApiSecurity } from '@nestjs/swagger';

@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller('api/config-xml')
export class ConfigDataController {
  constructor(private configXmlLoaderService: ConfigXmlLoaderService) {}

  @Get('configs')
  getAllConfigs() {
    return this.configXmlLoaderService.getAllConfigs();
  }

  @Get('configs/:path')
  getConfigByPath(@Param('path') path: string, @Param('scope') scope: Scope) {
    const section = this.configXmlLoaderService.getConfigDataByPath(path);
    if (!section) {
      throw new NotFoundException(`Value with Path "${path}" not found in configurations.`);
    }
    return section;
  }
}
