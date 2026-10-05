import { Module } from "@nestjs/common";
import { SystemDataController } from "./system-data.controller";
import { SystemXmlLoader } from "./system-xml-loader.service";
import { SystemDataCacheService } from "./system-data-cache.service";

@Module({
    controllers: [SystemDataController],
    providers: [SystemDataCacheService, SystemXmlLoader],
    exports: [SystemXmlLoader],
})

export class SystemDataModule{}