import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/**
 * AppConfig stores global Spaceboot configuration.
 */
@Entity('app_config')
export class AppConfig {
  /**
   * Unique identifier for the config entry.
   */
  @PrimaryGeneratedColumn()
  id!: number;

  /**
   * Configurable prefix key to activate Spaceboot (default: 'Space').
   */
  @Column({ type: 'varchar', length: 20, default: 'Space' })
  prefixKey!: string;

  /**
   * Delay in milliseconds before showing the dialog while holding the prefix key.
   */
  @Column({ type: 'int', default: 500 })
  activationDelay!: number;

  /**
   * UI theme preference ('light' | 'dark').
   */
  @Column({ type: 'varchar', default: 'dark' })
  uiTheme!: 'light' | 'dark';
}
