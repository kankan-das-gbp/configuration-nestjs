import { Column, Entity, PrimaryColumn } from "typeorm";

export enum BackendType {
    VARCHAR = 'varchar',
    INT = 'int',
    DECIMAL = 'decimal',
    TEXT = 'text',
    DATETIME = 'datetime',
}

@Entity("eav_attribute")
export class EAVAttributeData{

    @PrimaryColumn({ name: "attribute_id" })
    attribute_id!: number;

    @Column({ name: "attribute_code" })
    attribute_code!: string; // e.g., 'color', 'capacity', 'price'

    @Column({ name: "frontend_label", nullable: true })
    label!: string; // e.g., 'Color', 'Capacity'
}