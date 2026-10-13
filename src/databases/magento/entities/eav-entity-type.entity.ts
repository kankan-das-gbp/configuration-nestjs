import { Column, Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity({name: "eav_entity_type"})
export class EAVEntityTypeData {
    @PrimaryGeneratedColumn({ name: 'entity_type_id', type: 'int' })
    entity_type_id!: number;

    @Column({name: 'entity_type_code', type: 'string' })
    entity_type_code!: string

    @Column({name: "entity_table" , type: "string"})
    entity_table!: string

    @Column({name: "additional_attribute_table " , type: "string"})
    additional_attribute_table!: string
}