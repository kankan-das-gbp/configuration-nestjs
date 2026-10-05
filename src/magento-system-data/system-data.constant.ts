import * as path from 'path';

export const SYSTEM_DATA_DOCS_DIR = path.join(process.cwd(), 'docs');
export const SYSTEM_DATA_CACHE_FILE = path.join(
    SYSTEM_DATA_DOCS_DIR,
    'system-data.json',
);
