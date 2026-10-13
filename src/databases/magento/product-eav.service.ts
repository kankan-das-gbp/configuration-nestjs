import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { CatalogProductEntityData } from "./entities/product.entity";
import { DataSource, Repository } from "typeorm";
import { ProductValueVarChar } from "./entities/product-value-varchar.entity";

@Injectable()
export class ProductEAVService {
    constructor(
        @InjectRepository(CatalogProductEntityData)
        private readonly catalogueProductEntityData : Repository<CatalogProductEntityData>,

        @InjectRepository(ProductValueVarChar)
        private readonly productValueVarChar : Repository<ProductValueVarChar>,

        @InjectDataSource()
        private readonly dataSource: DataSource
    ) {}

    /**
     * Fetches a product and transforms its sparse EAV rows into a flat JSON object.
     */
    async getProductById(entityId: number): Promise<Record<string, unknown> | null> {
        const product = await this.catalogueProductEntityData.createQueryBuilder('cpe')
            .leftJoinAndSelect('cpe.varcharValues', 'cpev')
            .leftJoinAndSelect('cpev.attribute', 'eavc')
            .leftJoinAndSelect('cpe.intValues', 'cpei')
            .leftJoinAndSelect('cpei.attribute', 'eai')
            .where('cpe.entity_id = :entityId', { entityId })
            .getOne();

        if (!product) {
            return null;
        }

        // Flatten EAV structures into flat data attributes.
        // A left join leaves attribute null when the attribute row is missing.
        const attributes: Record<string, unknown> = {};
        for (const value of product.varcharValues ?? []) {
            const code = value.attribute?.attribute_code;
            if (code) {
                attributes[code] = value.value;
            }
        }
        for (const value of product.intValues ?? []) {
            const code = value.attribute?.attribute_code;
            if (code) {
                attributes[code] = value.value;
            }
        }

        return {
            "pageType": "product",
            "data": {
                "entity_id": product.entity_id,
                "sku": product.sku,
                ...attributes,
            }
        };
    }

    /**
   * Resolves the matching entity_id from product varchar using Store Scope -> Default Scope fallback
   */
    private async findEntityIdByUrlKey(urlKey: string, storeId: number){
        const query = `
            SELECT cpev.entity_id
            FROM catalog_product_entity_varchar as cpev
            INNER JOIN eav_attribute as ea
                ON cpev.attribute_id = ea.attribute_id 
                AND ea.entity_type_id = 4
                AND ea.attribute_code = "url_key"
            WHERE cpev.value = ?
                AND cpev.store_id IN (?,0)
            ORDER BY cpev.store_id DESC 
            LIMIT 1
        `
        const result = await this.dataSource.query(query, [urlKey, storeId])
        return result?.[0]?.entity_id || null;
    }

    /**
     * Fetches a product data via url_key and pass Id to getProductById
     */
    async getProductByUrlKey(urlKey: string): Promise<Record<string, unknown> | null>{
        const entityId = await this.findEntityIdByUrlKey(urlKey, 11);
        if (!entityId) {
            throw new NotFoundException(`Product with url_key "${urlKey}" not found.`);
        }
        return  await this.getProductById(entityId);
    }
}