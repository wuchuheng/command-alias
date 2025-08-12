import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * KeyBinding entity represents a keyboard sequence binding to an action.
 */
@Entity('key_bindings')
export class KeyBinding {
  /**
   * Unique identifier for the config entry.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Sequence formatted with spaces between keys, e.g. "c o d e".
   */
  @Column({ type: 'varchar', length: 50 })
  sequence!: string;

  /**
   * Type of action to perform when the sequence is completed.
   */
  @Column({ type: 'varchar', length: 20 })
  actionType!: 'launch-app' | 'run-command' | 'execute-script';

  /**
   * Target payload (path or command string).
   */
  @Column({ type: 'text' })
  target!: string;

  /**
   * Optional human-friendly description.
   */
  @Column({ type: 'text', nullable: true })
  comment?: string;
}
