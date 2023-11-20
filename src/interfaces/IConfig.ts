import {
  BitFieldResolvable,
  CacheWithLimitsOptions,
  GatewayIntentsString,
} from 'discord.js';

export default interface IConfig {
  client: {
    id: string;
    token: string;
    testmode?: {
      enabled: boolean;
      id?: string;
      token?: string;
    };
    intents?: Array<BitFieldResolvable<GatewayIntentsString, number>>;
    partials?: string[];
    caches?: CacheWithLimitsOptions;
  };
  commands?: {
    enableMessageCommand?: boolean;
  };
  database: {
    mongoURL: string;
  };
}
