import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SystemDataModule } from 'src/magento-system-data/system-data.module';
import { validateEnv } from 'src/config/env.config';
import { ConfigDataModule } from 'src/magento-config-data/config-data.module';
import { MagentoDatabaseModule } from 'src/databases/magento/magento-database.module';
import { ConfigManagerModule } from 'src/config-manager/config-manager.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    SystemDataModule,
    ConfigDataModule,
    MagentoDatabaseModule,
    ConfigManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
