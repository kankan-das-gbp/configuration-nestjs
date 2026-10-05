
export type ConfigDataJson = Record<string, unknown>;

export interface ConfigDataCacheFile {
    magentoRoot: string;
    generatedAt: string;
    configCount: number;
    data: ConfigDataJson;
}
