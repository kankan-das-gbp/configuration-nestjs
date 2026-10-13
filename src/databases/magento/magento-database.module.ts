import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MagentoCoreConfigData } from './entities/magento-core-config-data.entity';
import { MagentoCoreConfigDatabaseService } from './magento-core-config-data.service';
import { CatalogueProductEntityData } from './entities/product.entity';
import { EAVAttributeData } from './entities/eav-attribute.entity';
import { ProductEAVService } from './product-eav.service';
import { ProductEavController } from './product-eav.controller';
import { ProductValueVarChar } from './entities/product-value-varchar.entity';
import { ProductValueInt } from './entities/product-value-int.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MagentoCoreConfigData, 
      CatalogueProductEntityData, 
      EAVAttributeData, 
      ProductValueVarChar, 
      ProductValueInt
    ]),
  ],
  controllers:[ProductEavController],
  providers: [MagentoCoreConfigDatabaseService, ProductEAVService],
  exports: [MagentoCoreConfigDatabaseService],
})
export class MagentoDatabaseModule {}
