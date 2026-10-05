// src/config-data/config-manager.service.ts
import { Injectable } from '@nestjs/common';
import _ from 'lodash';
import { MagentoCoreConfigDatabaseService } from 'src/databases/magento/magento-core-config-data.service';
import { ConfigXmlLoaderService } from 'src/magento-config-data/config-xml-loader.service';
import { Scope } from 'src/types/scope.types';

@Injectable()
export class ConfigManagerService {
  constructor(
    private readonly magentoCoreConfigDBService: MagentoCoreConfigDatabaseService,
    private readonly configXMLLoaderService: ConfigXmlLoaderService,
  ) {}

  async getCompiledConfig(path, scope = Scope.default, scopeId = 0): Promise<any> {
    let dbData = await this.magentoCoreConfigDBService.getConfigValue(
      path, scope, scopeId
    )

    // If we don't find in scope different then default , we try again with default
    if(dbData === null && (scope !== Scope.default || (scope === Scope.default && scopeId != 0))){
      dbData = await this.magentoCoreConfigDBService.getConfigValue(
        path, Scope.default, 0
      )
    }

    if(dbData != null) {
      dbData["source"] = "db"
      return dbData
    }

    // If we haven't find in DB search we will try config defaults
    let configDefaultData;
    const configDefaultValue = this.configXMLLoaderService.getConfigDataByPath(path);

    if(configDefaultValue){
      configDefaultData = {
        source: "config.xml",
        scope: Scope.default,
        path: path,
        value: configDefaultValue
      }
    }

    return configDefaultData;
  }
}
