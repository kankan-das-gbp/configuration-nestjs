// magento-core-config-data.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Scope } from 'src/types/scope.types';
import { MagentoCoreConfigData } from './entities/magento-core-config-data.entity';

@Injectable()
export class MagentoCoreConfigDatabaseService implements OnModuleInit {
  private readonly logger = new Logger(MagentoCoreConfigDatabaseService.name);
  private connecting: Promise<boolean> | null = null;

  constructor(
    @InjectRepository(MagentoCoreConfigData)
    private readonly configRepository: Repository<MagentoCoreConfigData>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.ensureConnected();
  }

  /**
   * Opens the Magento database when it is reachable.
   * A failed attempt is logged and retried on the next call, without stopping the app.
   */
  private ensureConnected(): Promise<boolean> {
    if (this.dataSource.isInitialized) {
      return Promise.resolve(true);
    }
    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = this.dataSource
      .initialize()
      .then(() => {
        this.logger.log('Connected to the Magento database.');
        return true;
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.warn(
          `Magento database is unavailable. The service will keep running and use config.xml defaults. ${message}`,
        );
        return false;
      })
      .finally(() => {
        this.connecting = null;
      });

    return this.connecting;
  }

  /**
   * Fetches a Magento configuration value with complete scope fallback logic.
   * Returns null when the database cannot be reached.
   */
  async getConfigValue(
    path: string,
    scope: Scope = Scope.default,
    id: number = 0
  ): Promise<Object | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      return null;
    }

    try {
      const config = await this.configRepository.findOne({
        where: { path, scope: scope, scopeId: id },
      });
      return config ?? null;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Magento database query failed for "${path}". ${message}`);
      return null;
    }
  }
}
