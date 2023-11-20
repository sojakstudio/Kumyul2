import { Client, ActivityOptions } from 'discord.js';
import { Logger } from 'winston';
import logger from '../utils/logger.js';

export default class CustomClient extends Client {
  public getLogger(): Logger {
    /* eslint-disable-next-line deprecation/deprecation */
    return logger;
  }

  public setActivity(option: ActivityOptions) {
    return this.user?.setActivity(option);
  }
}
