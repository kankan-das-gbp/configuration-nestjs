import { Module } from "@nestjs/common";
import { ConfigDataController } from "./config-data.controller";
import { ConfigXmlLoaderService } from "./config-xml-loader.service";
import { ConfigDataCacheService } from "./config-data-cache.service";

@Module({
    controllers: [ConfigDataController],
    providers: [ConfigDataCacheService, ConfigXmlLoaderService],
    exports: [ConfigXmlLoaderService],
})

export class ConfigDataModule{}