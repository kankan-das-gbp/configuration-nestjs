import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MagentoCoreConfigData } from './entities/magento-core-config-data.entity';
import { MagentoCoreConfigDatabaseService } from './magento-core-config-data.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MagentoCoreConfigData]),
  ],
  providers: [MagentoCoreConfigDatabaseService],
  exports: [MagentoCoreConfigDatabaseService],
})
export class MagentoDatabaseModule {}
