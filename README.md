# Magento Config Nest Service

NestJS service that reads a Magento 2 codebase and exposes its configuration.

- `system.xml` files under `app/code/*/*/etc/adminhtml/` become section, group, and field metadata.
- `config.xml` files supply default values for the `default`, `websites`, and `stores` scopes.
- `core_config_data` is read from the Magento MariaDB database when that database is reachable.

Parsed XML is cached under `docs/` so later startups skip a full rescan. If the database is down, the process still starts. Config lookups then use the `config.xml` defaults until the database can be reached again.

## Requirements

- Node.js 22+
- A Magento 2 root (`app/code`, and so on)
- MariaDB or MySQL credentials for that Magento database



## Setup

```bash
npm install
cp .env.example .env
```

`MAGENTO_ROOT` must be an absolute path to the Magento project root. `MAGENTO_DB_PASSWORD` may be empty. `MAGENTO_DB_TABLE_PREFIX` is empty unless the Magento install uses a table prefix.


| Variable                 | Purpose                                             |
| ------------------------ | --------------------------------------------------- |
| `PORT`                   | HTTP port. `.env.example` uses `3333`.              |
| `API_KEY`                | Value callers send in the `x-api-key` header.       |
| `MAGENTO_ROOT`           | Absolute path to the Magento project.               |
| `MAGENTO_DB_HOST`        | Database host.                                      |
| `MAGENTO_DB_PORT`        | Database port.                                      |
| `MAGENTO_DB_NAME`        | Database name.                                      |
| `MAGENTO_DB_USER`        | Database user.                                      |
| `MAGENTO_DB_PASSWORD`    | Database password.                                  |
|                          |                                                     |
| `SYSTEM_DATA_REGENERATE` | `true` rebuilds `docs/system-data.json` on startup. |
| `CONFIG_DATA_REGENERATE` | `true` rebuilds `docs/config-data.json` on startup. |




## Scripts


| Command               | Purpose                               |
| --------------------- | ------------------------------------- |
| `npm run start:dev`   | Compile and run with watch            |
| `npm run start:debug` | Same, with the inspector on port 9229 |
| `npm run build`       | Compile to `dist/`                    |
| `npm run start:prod`  | Run the compiled app                  |


With the example env file, the service listens at `http://localhost:3333/v1`. Swagger is at `http://localhost:3333/docs`.

## API

Every route below requires the header `x-api-key: <API_KEY>`.


| Method | Path                               | Response                                 |
| ------ | ---------------------------------- | ---------------------------------------- |
| GET    | `/v1/api/system-xml/sections`      | Section ids from `system.xml`            |
| GET    | `/v1/api/system-xml/sections/:id`  | One section, including groups and fields |
| GET    | `/v1/api/config-xml/configs`       | Defaults parsed from `config.xml`        |
| GET    | `/v1/api/config-xml/configs/:path` | One `config.xml` path                    |
| GET    | `/v1/api/config/value`             | Resolved value for a path                |


`/v1/api/config/value` query parameters:


| Query      | Purpose                                             |
| ---------- | --------------------------------------------------- |
| `path`     | Magento config path, such as `section/group/field`  |
| `scope`    | `default`, `websites`, or `stores`                  |
| `scope_id` | Website or store id. Use `0` for the default scope. |


The resolved value comes from `core_config_data` when the database has a row. Otherwise it comes from `config.xml`.

## Cache

The first start parses every matching XML file and writes:

- `docs/system-data.json`
- `docs/config-data.json`

Later starts read that JSON when `MAGENTO_ROOT` still matches the cache. Set `SYSTEM_DATA_REGENERATE=true` or `CONFIG_DATA_REGENERATE=true` for one restart after Magento XML changes, or delete the JSON file.

## Docker

From the project root:

```bash
docker-compose --env-file .env -f deployment/docker-compose.yml up --build -d
```

The image listens on port `3333` and mounts `MAGENTO_ROOT` at `/magento` inside the container. Compose overrides `MAGENTO_ROOT` to that mount path.

`127.0.0.1` inside the container is the container itself. To reach a database on the host, set `MAGENTO_DB_HOST=host.docker.internal`.