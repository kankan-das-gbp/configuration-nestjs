# Magento Config Nest Service

NestJS service that reads a Magento 2 codebase and exposes its admin configuration structure.

- `system.xml` files under `app/code/*/*/etc/adminhtml/` become section, group, and field metadata.
- `config.xml` files supply default config values.
- `core_config_data` is read from the Magento MySQL database.

Parsed XML is cached under `docs/` so later startups skip a full rescan.

## Requirements

- Node.js 22+
- A Magento 2 root (`app/code`, and so on)
- MySQL credentials for that Magento database

## Setup

```bash
npm install
cp .env.example .env
```

`MAGENTO_ROOT` must be an absolute path to the Magento project root. `MAGENTO_DB_PASSWORD` may be empty. `MAGENTO_DB_TABLE_PREFIX` is empty unless the Magento install uses a table prefix.

## Scripts


| Command               | Purpose                               |
| --------------------- | ------------------------------------- |
| `npm run start:dev`   | Compile and run with watch            |
| `npm run start:debug` | Same, with the inspector on port 9229 |
| `npm run build`       | Compile to `dist/`                    |
| `npm test`            | Run Jest                              |


The service listens at `http://localhost:3000/v1`. Swagger is at `http://localhost:3000/docs`.

## API


| Method | Path                            | Response                                 |
| ------ | ------------------------------- | ---------------------------------------- |
| GET    | `/v1/system-data/sections`      | Section ids from `system.xml`            |
| GET    | `/v1/system-data/sections/:id`  | One section, including groups and fields |
| GET    | `/v1/config-data/configs`       | Default values parsed from `config.xml`  |
| GET    | `/v1/config-data/configs/:path` | One config path                          |




## Cache

The first start parses every matching XML file and writes `docs/`. Later starts read that JSON when `MAGENTO_ROOT` still matches the cache.

Set `SYSTEM_DATA_REGENERATE=true` for one restart after Magento XML changes, or delete the JSON files under `docs/`.