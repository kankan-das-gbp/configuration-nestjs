import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SystemDataModule } from 'src/magento-system-data/system-data.module';
import { validateEnv } from 'src/config/env.config';
import { ConfigDataModule } from 'src/magento-config-data/config-data.module';
import { MagentoDatabaseModule } from 'src/databases/magento/magento-database.module';
import { ConfigManagerModule } from 'src/config-manager/config-manager.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MagentoCoreConfigData } from 'src/databases/magento/entities/magento-core-config-data.entity';
import { CatalogProductEntityData } from 'src/databases/magento/entities/product.entity';
import { ProductValueVarChar } from 'src/databases/magento/entities/product-value-varchar.entity';
import { ProductValueInt } from 'src/databases/magento/entities/product-value-int.entity';
import { EAVAttributeData } from 'src/databases/magento/entities/eav-attribute.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mariadb' as const,
        host: config.getOrThrow<string>('MAGENTO_DB_HOST') ?? "127.0.0.1",
        port: Number(config.get('MAGENTO_DB_PORT') ?? 8889),
        username: config.getOrThrow<string>('MAGENTO_DB_USER') ?? 'root',
        password: config.get<string>('MAGENTO_DB_PASSWORD') ?? 'root',
        database: config.getOrThrow<string>('MAGENTO_DB_NAME') ?? "cov_uat_db",
        entityPrefix: config.get<string>('MAGENTO_DB_TABLE_PREFIX') ?? '',
        entities: [
          MagentoCoreConfigData,
          CatalogProductEntityData,
          ProductValueVarChar,
          ProductValueInt,
          EAVAttributeData,
        ],
        synchronize: false,
        // Do not connect during bootstrap. A down database must not stop the app.
        manualInitialization: true,
        retryAttempts: 0,
      }),
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
