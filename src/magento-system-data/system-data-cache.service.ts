import { Injectable, Logger } from '@nestjs/common';
import fs from 'fs';
import { SYSTEM_DATA_CACHE_FILE, SYSTEM_DATA_DOCS_DIR } from './system-data.constant';
import { SystemDataCacheFile, SystemDataJson } from './system-data.types';

@Injectable()
export class SystemDataCacheService {
    private readonly logger = new Logger(SystemDataCacheService.name);

    /**
     * Loads docs/system-data.json when it was generated for this Magento root.
     * @param magentoRoot Absolute path to the Magento project root. A cache written for a different root is ignored.
     * @returns Parsed section map, or null when the file is missing, invalid, or for another Magento root.
     */
    read(magentoRoot: string): SystemDataJson | null {
        if (!fs.existsSync(SYSTEM_DATA_CACHE_FILE)) {
            return null;
        }

        try {
            const raw = fs.readFileSync(SYSTEM_DATA_CACHE_FILE, 'utf8');
            const parsed = JSON.parse(raw) as SystemDataCacheFile;

            if (parsed.magentoRoot !== magentoRoot) {
                this.logger.log(
                    `Cache magentoRoot mismatch; will regenerate from system.xml files.`,
                );
                return null;
            }

            if (!parsed.data || typeof parsed.data !== 'object') {
                this.logger.warn(`Invalid cache at ${SYSTEM_DATA_CACHE_FILE}; regenerating.`);
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
     * Writes the parsed system.xml map to docs/system-data.json.
     * @param magentoRoot Absolute path to the Magento project root stored with the cache so a later read can detect a path change.
     * @param data Sections keyed by section id.
     */
    write(magentoRoot: string, data: SystemDataJson): void {
        fs.mkdirSync(SYSTEM_DATA_DOCS_DIR, { recursive: true });

        const payload: SystemDataCacheFile = {
            magentoRoot,
            generatedAt: new Date().toISOString(),
            sectionCount: Object.keys(data).length,
            data,
        };

        fs.writeFileSync(SYSTEM_DATA_CACHE_FILE, JSON.stringify(payload, null, 2), 'utf8');
        this.logger.log(`Wrote system metadata cache to ${SYSTEM_DATA_CACHE_FILE}.`);
    }
}
