import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class KeyBinding {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  sequence: string;

  @Column({ type: 'varchar', length: 20 })
  actionType: 'launch-app' | 'run-command' | 'execute-script';

  @Column({ type: 'text' })
  target: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;
}
