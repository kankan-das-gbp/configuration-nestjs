import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fs from 'fs';
import * as path from 'path';
import * as glob from 'fast-glob';
import * as _ from 'lodash';
import { XMLParser } from 'fast-xml-parser';
import { ConfigDataJson } from './config-data.types';
import { CONFIG_DATA_CACHE_FILE } from './config-data.constant';
import { ConfigDataCacheService } from './config-data-cache.service';
import { Scope } from 'src/types/scope.types';

@Injectable()
export class ConfigXmlLoaderService implements OnModuleInit {
    private readonly logger = new Logger(ConfigXmlLoaderService.name);
    private configDataJson: ConfigDataJson = {};

    /**
     * @param configService Reads MAGENTO_ROOT and CONFIG_DATA_REGENERATE.
     * @param configDataCache Reads and writes the parsed config.xml cache.
     */
    constructor(
        private configService: ConfigService,
        private configDataCache: ConfigDataCacheService,
    ) {}

    /**
     * Loads config.xml defaults when the module starts.
     */
    onModuleInit() {
        this.loadConfigData();
    }

    /**
     * Prefer the cached parse of Magento config.xml files.
     * Set CONFIG_DATA_REGENERATE=true to ignore the cache and rebuild it.
     * A missing or empty cache also falls through to a full parse.
     */
    private loadConfigData() {
        const magentoRoot = this.configService.getOrThrow<string>('MAGENTO_ROOT');
        const regenerate =
            this.configService.get<string>('CONFIG_DATA_REGENERATE') == 'true';

        if (!regenerate) {
            const cached:ConfigDataJson = this.configDataCache.read(magentoRoot) || {};
            if (cached && Object.keys(cached).length > 0) {
                this.configDataJson = cached;
                this.logger.log(
                    `Loaded config metadata from ${CONFIG_DATA_CACHE_FILE} (${Object.keys(this.configDataJson).length} sections).`,
                );
                return;
            }
        }

        this.configDataJson = this.parseConfigXmls(magentoRoot);
        this.configDataCache.write(magentoRoot, this.configDataJson);
    }

    private parseConfigXmls(magentoRoot: string): ConfigDataJson {
        const configDataJson: ConfigDataJson = {};

        // TODO: after Magento install will add up Vendor also
        // Module defaults live in Vendor/Module/etc/config.xml.
        const filePatterns = [
            path.join(magentoRoot,'app/code/*/*/etc/config.xml')
        ];

        const files = glob.sync(filePatterns);

        const parser = new XMLParser();

        this.logger.log(`Found ${files.length} config.xml files to parse.`);

        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const parsed = parser.parse(content);
                const configTag = parsed?.config

                // Later modules override earlier values for the same path.
                if(configTag?.default) {
                    this.configDataJson.default = _.mergeWith(this.configDataJson.default, this.flattenConfig(configTag?.default), this.mergeCustomizer)
                }
                if(configTag?.websites) {
                    this.configDataJson.websites = _.mergeWith(this.configDataJson.websites, this.flattenConfig(configTag?.websites), this.mergeCustomizer)
                }
                if(configTag?.stores) {
                    this.configDataJson.stores = _.mergeWith(this.configDataJson.stores, this.flattenConfig(configTag?.stores), this.mergeCustomizer)
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                this.logger.warn(`Could not parse config.xml at ${file}: ${message}`);
            }
        }

        this.logger.log(
            `Config Data parsing complete. Tracked ${Object.keys(configDataJson).length} root configs.`,
        );

        return this.configDataJson;
    }

    /**
     * Turns nested config.xml nodes into Magento paths such as section/group/field.
     * @param obj Parsed XML node, or a nested child of one.
     * @param prefix Path built so far. Empty at the root of a scope.
     * @returns Leaf values keyed by slash-separated path.
     */
    private flattenConfig(obj, prefix = '') {
        let result = {};
    
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                // Construct the new path key
                const newKey = prefix ? `${prefix}/${key}` : key;
    
                // Check if the value is a non-null object and not an array
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    // Recursively flatten the deeper object and merge it into the result
                    Object.assign(result, this.flattenConfig(obj[key], newKey));
                } else {
                    // Base case: until the value type is not an object
                    result[newKey] = obj[key];
                }
            }
        }
    
        return result;
    }

    /**
     * Decides how two values for the same path are combined.
     * @param objValue Value already stored.
     * @param srcValue Value from the file currently being parsed.
     * @returns The incoming array when the stored value is an array. Otherwise lodash merges objects as usual.
     */
    private mergeCustomizer(objValue: any, srcValue: any) {
        // If the value is an array, completely overwrite it with the incoming source array
        if (_.isArray(objValue)) {
          return srcValue;
        }
      }

    /**
     * @returns The full scope map loaded at startup.
     */
    getAllConfigs() {
        return this.configDataJson;
    }

    /**
     * Looks up one config.xml default.
     * @param path Magento config path, such as section/group/field.
     * @param scope Which config.xml scope to read. Defaults to the global default scope.
     * @returns The stored value, or null when the path is absent at that scope.
     */
    getConfigDataByPath(path:string, scope: Scope = Scope.default) {
        let value = null;
        if(scope && scope != Scope.default){
            value = this.configDataJson[scope]?.[path]
        } else {
            value = this.configDataJson[Scope.default]?.[path]
        }
        return value;
    }
}
