// import BotConfigFile from './Config.js';
// import { ConfigEnum } from '../Enums/Enums.js';
// import IBotConfig from '../Interfaces/IBotConfig.js';

import { readFile } from 'fs/promises';
import logger from '../utils/logger.js';
import { IConfig } from '../interfaces/index.js';

// export class UnvalidBotConfigError extends Error {
//   constructor(msg: string) {
//     super(msg);
//     this.name = 'UnvalidBotConfigError';
//     // Set the prototype explicitly.
//     Object.setPrototypeOf(this, UnvalidBotConfigError.prototype);
//   }
// }

// export class PropertyRequiredError extends UnvalidBotConfigError {
//   public property: string;

//   constructor(property: string) {
//     super(`Property undefined or empty: ${property}`);
//     this.name = 'PropertyRequiredError';
//     this.property = property;
//   }
// }

// // BotConfig.ts 로드
// export const LoadConfig = (): Promise<IBotConfig> =>
//   new Promise<IBotConfig>((resolve, reject) => {
//     if (
//       BotConfigFile.enableMessageCommand === undefined ||
//       BotConfigFile.enableMessageCommand === null
//     ) {
//       reject(new PropertyRequiredError('enableMessageCommand'));
//     }

//     resolve(BotConfigFile);
//   });

// export async function GetConfig(configvalue: ConfigEnum) {
//   const config = await LoadConfig();

//   switch (configvalue) {
//     case 1:
//       return config.enableMessageCommand;
//       break;
//     default:
//       break;
//   }
// }

export default class Config {
  public LoadConfig(configPath?: string): Promise<IConfig> {
    return new Promise<IConfig>(async (resolve, reject) => {
      const filePath = new URL(
        configPath || '../../config/config.json',
        import.meta.url,
      );
      readFile(filePath, { encoding: 'utf-8' })
        .then(fileText => {
          resolve(JSON.parse(fileText) as IConfig);
        })
        .catch(e => {
          logger.error(e);
        });
    });
  }
}
