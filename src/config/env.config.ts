import { z } from 'zod';

export const envValidationSchema = z
  .object({
    PORT: z.coerce.number().default(3000),
    MAGENTO_ROOT: z.string().min(1),
    SYSTEM_DATA_REGENERATE: z.enum(['true', 'false']).optional(),
    MAGENTO_DB_HOST: z.string().min(1),
    MAGENTO_DB_PORT: z.coerce.number().default(8889),
    MAGENTO_DB_NAME: z.string().min(1),
    MAGENTO_DB_USER: z.string().min(1),
    MAGENTO_DB_PASSWORD: z.string(),
    MAGENTO_DB_TABLE_PREFIX: z.string().default(''),
    API_KEY: z.string(),
  })
  .passthrough();

export function validateEnv(config: Record<string, unknown>) {
  return envValidationSchema.parse(config);
}
