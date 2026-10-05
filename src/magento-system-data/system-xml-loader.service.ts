import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as glob from 'fast-glob';
import { XMLParser } from 'fast-xml-parser';
import fs from 'fs';
import { SystemDataJson } from './system-data.types';
import { SYSTEM_DATA_CACHE_FILE } from './system-data.constant';
import { SystemDataCacheService } from './system-data-cache.service';

@Injectable()
export class SystemXmlLoader implements OnModuleInit {
    private readonly logger = new Logger(SystemXmlLoader.name);
    private systemDataJson: SystemDataJson = {};

    /**
     * @param configService Reads MAGENTO_ROOT and SYSTEM_DATA_REGENERATE.
     * @param systemDataCache Reads and writes the parsed system.xml cache.
     */
    constructor(
        private configService: ConfigService,
        private systemDataCache: SystemDataCacheService,
    ) {}

    /**
     * Loads system.xml metadata when the module starts.
     */
    onModuleInit() {
        this.loadSystemData();
    }

    /**
     * Prefer the cached parse of Magento admin system.xml files.
     * Set SYSTEM_DATA_REGENERATE=true to ignore the cache and rebuild it.
     * A missing cache also falls through to a full parse.
     */
    private loadSystemData() {
        const magentoRoot = this.configService.getOrThrow<string>('MAGENTO_ROOT');
        const regenerate =
            this.configService.get<string>('SYSTEM_DATA_REGENERATE') === 'true';

        if (!regenerate) {
            const cached = this.systemDataCache.read(magentoRoot);
            if (cached) {
                this.systemDataJson = cached;
                this.logger.log(
                    `Loaded system metadata from ${SYSTEM_DATA_CACHE_FILE} (${Object.keys(this.systemDataJson).length} sections).`,
                );
                return;
            }
        }

        this.systemDataJson = this.parseSystemXmls(magentoRoot);
        this.systemDataCache.write(magentoRoot, this.systemDataJson);
    }

    /**
     * Walks every adminhtml/system.xml and builds the section map.
     * @param magentoRoot Absolute path to the Magento project root.
     * @returns Sections keyed by section id.
     */
    private parseSystemXmls(magentoRoot: string): SystemDataJson {
        const systemDataJson: SystemDataJson = {};

        // TODO: after Magento install will add up Vendor also
        // Magento admin config UI lives in Vendor/Module/etc/adminhtml/system.xml.
        const filePatterns = [
            path.join(magentoRoot,'app/code/*/*/etc/adminhtml/system.xml',),
        ];

        const files = glob.sync(filePatterns);

        // Keep XML attributes (id, type, showIn*) and prefix them with @.
        const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@' });

        this.logger.log(`Found ${files.length} system.xml files to parse.`);

        for (const file of files) {
            try {
                const content = fs.readFileSync(file, 'utf8');
                const parsed = parser.parse(content);
                const systemTag = parsed?.config?.system;
                if (!systemTag?.section) {
                    continue;
                }

                // A single <section> parses as an object; several parse as an array.
                const sections = Array.isArray(systemTag.section)
                    ? systemTag.section
                    : [systemTag.section];

                for (const section of sections) {
                    const sectionId = section['@id'];
                    // The same section id can appear in more than one module.
                    // Keep the first definition and merge later groups into it.
                    if (!systemDataJson[sectionId]) {
                        systemDataJson[sectionId] = {
                            id: sectionId,
                            label: section.label,
                            groups: {},
                        };
                    }
                    this.extractGroups(systemDataJson, sectionId, section.group);
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : String(err);
                this.logger.warn(`Could not parse system.xml at ${file}: ${message}`);
            }
        }

        this.logger.log(
            `Metadata parsing complete. Tracked ${Object.keys(systemDataJson).length} root sections.`,
        );

        return systemDataJson;
    }

    /**
     * Adds groups from one section into the accumulated map.
     * @param systemDataJson Section map being built.
     * @param sectionId Id of the parent section.
     * @param groupsTag Parsed <group> node, or a list of them. Absent when the section has no groups.
     */
    private extractGroups(
        systemDataJson: SystemDataJson,
        sectionId: string,
        groupsTag: any,
    ) {
        if (!groupsTag) {
            return;
        }
        const section = systemDataJson[sectionId] as {
            groups: Record<string, unknown>;
        };
        // Same single-node vs list handling as sections.
        const groups = Array.isArray(groupsTag) ? groupsTag : [groupsTag];
        for (const group of groups) {
            const groupId = group['@id'];
            if (!section.groups[groupId]) {
                section.groups[groupId] = {
                    id: groupId,
                    label: group.label,
                    fields: {},
                };
            }
            this.extractFields(systemDataJson, sectionId, groupId, group.field);
        }
    }

    /**
     * Adds fields from one group into the accumulated map.
     * @param systemDataJson Section map being built.
     * @param sectionId Id of the parent section.
     * @param groupId Id of the parent group.
     * @param fieldsTag Parsed <field> node, or a list of them. Absent when the group has no fields.
     */
    private extractFields(
        systemDataJson: SystemDataJson,
        sectionId: string,
        groupId: string,
        fieldsTag: any,
    ) {
        if (!fieldsTag) {
            return;
        }
        const section = systemDataJson[sectionId] as {
            groups: Record<string, { fields: Record<string, unknown> }>;
        };
        const fields = Array.isArray(fieldsTag) ? fieldsTag : [fieldsTag];

        for (const field of fields) {
            const fieldId = field['@id'];

            // config_path overrides the path stored in core_config_data.
            // Without it, Magento uses section/group/field.
            const configPath = field.config_path || `${sectionId}/${groupId}/${fieldId}`;

            section.groups[groupId].fields[fieldId] = {
                id: fieldId,
                label: field.label,
                type: field['@type'] ?? "",
                configPath,
                // Magento shows a field at a scope unless the attribute is "0".
                showInDefault: field['@showInDefault'] ?? '1',
                showInWebsite: field['@showInWebsite'] ?? '1',
                showInStore: field['@showInStore'] ?? '1',
            };
        }
    }

    /**
     * @returns The full section map loaded at startup.
     */
    getSystemData() {
        return this.systemDataJson;
    }

    /**
     * @returns Every section id in the loaded map.
     */
    getAllSectionsId() {
        return Object.keys(this.systemDataJson)
    }

    /**
     * @param id Section id from system.xml, such as "vehicle_cover_section".
     * @returns That section, or undefined when the id is unknown.
     */
    getSystemDataBySectionId(id:string) {
        return this.systemDataJson[id];
    }
}
