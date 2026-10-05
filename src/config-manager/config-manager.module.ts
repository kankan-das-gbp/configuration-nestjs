import { Module } from '@nestjs/common';
import { MagentoDatabaseModule } from 'src/databases/magento/magento-database.module';
import { ConfigDataModule } from 'src/magento-config-data/config-data.module';
import { ConfigManagerController } from './config-manager.controller';
import { ConfigManagerService } from './config-manager.service';

@Module({
  imports: [MagentoDatabaseModule, ConfigDataModule],
  controllers: [ConfigManagerController],
  providers: [ConfigManagerService],
})
export class ConfigManagerModule {}
