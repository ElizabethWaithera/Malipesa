import { EventEmitter } from 'node:events';
import { logger } from '../utils/logger';
import { AgentConfig, AgentResult } from '../utils/types';

/**
 * Base Agent class that all specific agents will inherit from
 * Provides common functionality for all agents
 */
export abstract class BaseAgent extends EventEmitter {
  protected name: string;
  protected version: string;
  protected enabled: boolean;
  protected intervalMs?: number;
  protected settings: Record<string, any>;
  protected running: boolean = false;
  protected interval: NodeJS.Timeout | null = null;

  /**
   * Constructor for BaseAgent
   * @param config Agent configuration object
   */
  constructor(config: AgentConfig) {
    super();
    this.name = config.name;
    this.version = config.version;
    this.enabled = config.enabled;
    this.intervalMs = config.intervalMs;
    this.settings = config.settings;

    logger.info(`Initializing agent: ${this.name} v${this.version}`);
  }

  /**
   * Start the agent's operation
   * If intervalMs is set, it will run on a schedule
   */
  public start(): void {
    if (!this.enabled) {
      logger.warn(`Agent ${this.name} is disabled, not starting`);
      return;
    }

    logger.info(`Starting agent: ${this.name}`);
    this.running = true;

    // Run immediately
    this.executeTask().catch(error => {
      logger.error(`Error during agent ${this.name} execution:`, error);
    });

    // Set up interval if specified
    if (this.intervalMs && this.intervalMs > 0) {
      this.interval = setInterval(async () => {
        if (this.running) {
          try {
            await this.executeTask();
          } catch (error) {
            logger.error(`Error during agent ${this.name} scheduled execution:`, error);
          }
        }
      }, this.intervalMs);
    }
  }

  /**
   * Stop the agent's operation
   */
  public stop(): void {
    logger.info(`Stopping agent: ${this.name}`);
    this.running = false;
    
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    
    super.emit('stopped');
  }

  /**
   * Check if the agent is currently running
   * @returns boolean indicating if the agent is running
   */
  public isRunning(): boolean {
    return this.running;
  }

  /**
   * Update agent settings
   * @param newSettings New settings to apply
   */
  public updateSettings(newSettings: Record<string, any>): void {
    this.settings = { ...this.settings, ...newSettings };
    logger.info(`Updated settings for agent ${this.name}`);
    super.emit('settingsUpdated', this.settings);
  }

  /**
   * Abstract method that must be implemented by all derived agents
   * Contains the main logic for the agent
   */
  protected abstract executeTask(): Promise<AgentResult<any>>;
} 
