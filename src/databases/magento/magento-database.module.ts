import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MagentoCoreConfigData } from './entities/magento-core-config-data.entity';
import { MagentoCoreConfigDatabaseService } from './magento-core-config-data.service';

@Module({
  imports: [
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
        entities: [MagentoCoreConfigData],
        synchronize: false,
        // Do not connect during bootstrap. A down database must not stop the app.
        manualInitialization: true,
        retryAttempts: 0,
      }),
    }),
    TypeOrmModule.forFeature([MagentoCoreConfigData]),
  ],
  providers: [MagentoCoreConfigDatabaseService],
  exports: [MagentoCoreConfigDatabaseService],
})
export class MagentoDatabaseModule {}
