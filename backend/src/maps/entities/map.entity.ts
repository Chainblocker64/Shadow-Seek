import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
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

  @ManyToOne(() => User, { nullable: true })
  creator!: User | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
