import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EAVAttributeData } from "./eav-attribute.entity";
import { CatalogueProductEntityData } from "./product.entity";

@Entity("catalog_product_entity_varchar")
export class ProductValueVarChar {
    @PrimaryGeneratedColumn({ name: "value_id" })
    value_id!: number;

    @Column({ name: "value", type: "varchar" })
    value!: string;

    @ManyToOne(() => CatalogueProductEntityData, (product) => product.varcharValues, { onDelete: "CASCADE" })
    @JoinColumn({ name: "entity_id", referencedColumnName: "entity_id" })
    product!: CatalogueProductEntityData;

    @ManyToOne(() => EAVAttributeData, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "attribute_id", referencedColumnName: "attribute_id" })
    attribute!: EAVAttributeData;
}
