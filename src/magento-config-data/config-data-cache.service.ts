import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import { CONFIG_DATA_CACHE_FILE, CONFIG_DATA_DOCS_DIR } from './config-data.constant';
import { ConfigDataCacheFile, ConfigDataJson } from './config-data.types';

@Injectable()
export class ConfigDataCacheService {
    private readonly logger = new Logger(ConfigDataCacheService.name);

    /**
     * Loads docs/config-data.json when it was generated for this Magento root.
     * @param magentoRoot Absolute path to the Magento project root. A cache written for a different root is ignored.
     * @returns Parsed config.xml defaults, or null when the file is missing, invalid, or for another Magento root.
     */
    read(magentoRoot: string): ConfigDataJson | null {
        if (!fs.existsSync(CONFIG_DATA_CACHE_FILE)) {
            return null;
        }

        try {
            const raw = fs.readFileSync(CONFIG_DATA_CACHE_FILE, 'utf8');
            const parsed = JSON.parse(raw) as ConfigDataCacheFile;

            if (parsed.magentoRoot !== magentoRoot) {
                this.logger.log(
                    `Cache magentoRoot mismatch; will regenerate from config.xml files.`,
                );
                return null;
            }

            if (!parsed.data || typeof parsed.data !== 'object') {
                this.logger.warn(`Invalid cache at ${CONFIG_DATA_CACHE_FILE}; regenerating.`);
                return null;
            }

            return parsed.data;
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.warn(`Could not read cache (${message}); regenerating.`);
            return null;
        }
    }

    /**
     * Writes the parsed config.xml defaults to docs/config-data.json.
     * @param magentoRoot Absolute path to the Magento project root stored with the cache so a later read can detect a path change.
     * @param data Defaults keyed by scope: default, websites, and stores.
     */
    write(magentoRoot: string, data: ConfigDataJson): void {
        fs.mkdirSync(CONFIG_DATA_DOCS_DIR, { recursive: true });

        const payload: ConfigDataCacheFile = {
            magentoRoot,
            generatedAt: new Date().toISOString(),
            configCount: Object.keys(data).length,
            data,
        };

        fs.writeFileSync(CONFIG_DATA_CACHE_FILE, JSON.stringify(payload, null, 2), 'utf8');
        this.logger.log(`Wrote system metadata cache to ${CONFIG_DATA_CACHE_FILE}.`);
    }
}
