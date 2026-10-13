import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductValueVarChar } from "./product-value-varchar.entity";
import { ProductValueInt } from "./product-value-int.entity";

@Entity("catalog_product_entity")
export class CatalogueProductEntityData {
    @PrimaryGeneratedColumn({name: "entity_id"})
    entity_id!: number;

    @Column({ name: "sku", unique: true })
    sku!: string;

    // Relations to value tables
    @OneToMany(() => ProductValueVarChar, (value) => value.product)
    varcharValues!: ProductValueVarChar[];

    @OneToMany(() => ProductValueInt, (value) => value.product)
    intValues!: ProductValueInt[];
}