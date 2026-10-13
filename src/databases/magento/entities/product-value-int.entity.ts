import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { EAVAttributeData } from "./eav-attribute.entity";
import { CatalogProductEntityData } from "./product.entity";

@Entity("catalog_product_entity_int")
export class ProductValueInt {
    @PrimaryGeneratedColumn({ name: "value_id" })
    value_id!: number;

    @Column({ name: "value", type: "int" })
    value!: number;

    @ManyToOne(() => CatalogProductEntityData, (product) => product.intValues, { onDelete: "CASCADE" })
    @JoinColumn({ name: "entity_id", referencedColumnName: "entity_id" })
    product!: CatalogProductEntityData;

    @ManyToOne(() => EAVAttributeData, { onDelete: "RESTRICT" })
    @JoinColumn({ name: "attribute_id", referencedColumnName: "attribute_id" })
    attribute!: EAVAttributeData;
}
