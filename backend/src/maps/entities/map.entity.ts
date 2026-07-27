import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import type {
  BaseTileType,
  BaseTileOverride,
  MapObject,
} from '../../game/types';

@Entity('maps')
export class GameMap {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  width!: number;

  @Column()
  height!: number;

  @Column()
  baseTile!: BaseTileType;

  @Column({ type: 'jsonb' })
  baseOverrides!: BaseTileOverride[];

  @Column({ type: 'jsonb' })
  objects!: MapObject[];

  @Column()
  creator!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
