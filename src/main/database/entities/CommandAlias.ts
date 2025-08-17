import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('command_alias')
export class CommandAlias {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50 })
  alias: string;

  @Column({ type: 'varchar', length: 20 })
  actionType: 'launch-app' | 'run-command' | 'execute-script';

  @Column({ type: 'text' })
  target: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;
}
