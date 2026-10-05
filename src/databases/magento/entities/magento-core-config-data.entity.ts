import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'core_config_data' })
export class MagentoCoreConfigData {
  @PrimaryGeneratedColumn({ name: 'config_id', type: 'int' })
  configId!: number;

  @Column({ name: 'scope', type: 'varchar', length: 8 })
  scope!: string;

  @Column({ name: 'scope_id', type: 'int' })
  scopeId!: number;

  @Column({ name: 'path', type: 'varchar', length: 255 })
  path!: string;

  @Column({ name: 'value', type: 'text', nullable: true })
  value!: string | null;
}
