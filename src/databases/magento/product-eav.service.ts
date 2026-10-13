import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CatalogueProductEntityData } from "./entities/product.entity";
import { Repository } from "typeorm";
import { EAVAttributeData } from "./entities/eav-attribute.entity";

@Injectable()
export class ProductEAVService {
    constructor(
        @InjectRepository(CatalogueProductEntityData)
        private readonly catalogueProductEntityData : Repository<CatalogueProductEntityData>,

        @InjectRepository(EAVAttributeData)
        private readonly eavAttributeData : Repository<EAVAttributeData>
    ) {}

    /**
     * Fetches a product and transforms its sparse EAV rows into a flat JSON object.
     */
    async getProductById(id: number): Promise<Record<string, unknown> | null> {
        const product = await this.catalogueProductEntityData.createQueryBuilder('cpe')
            .leftJoinAndSelect('cpe.varcharValues', 'cpev')
            .leftJoinAndSelect('cpev.attribute', 'eavc')
            .leftJoinAndSelect('cpe.intValues', 'cpei')
            .leftJoinAndSelect('cpei.attribute', 'eai')
            .where('cpe.entity_id = :id', { id })
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
}