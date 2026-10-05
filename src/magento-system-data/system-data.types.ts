
export type SystemDataJson = Record<string, unknown>;

export interface SystemDataCacheFile {
    magentoRoot: string;
    generatedAt: string;
    sectionCount: number;
    data: SystemDataJson;
}
