// 모듈 로드
import { Partials, Options } from 'discord.js';
import * as dotenv from 'dotenv';
import { inspect } from 'util';
import Config from './config/index.js';
import Bot from './core/bot.js';
import CustomClient from './core/client.js';

// .env 로딩
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}
const config = await new Config().LoadConfig();

// Bot Entry Point
async function start(): Promise<void> {
  const client: CustomClient = new CustomClient({
    intents: config.client?.intents ?? 0,
    partials: config.client?.partials
      ? config.client.partials.map(
          partials => Partials[partials as keyof typeof Partials],
        )
      : undefined,
    makeCache: Options.cacheWithLimits({
      ...Options.DefaultMakeCacheSettings,
      ...config.client?.caches,
    }),
    sweepers: {
      ...Options.DefaultSweeperSettings,
      messages: {
        interval: 3600, // 1 hours
        lifetime: 1800, // 30 min
      },
      users: {
        interval: 3600, // 1 hour
        filter: () => user => user.bot && user.id !== client.user?.id, // exclude bot
      },
    },
  });

  client.getLogger().info(inspect(config, true, 10, true));

  const bot = new Bot(config, client, process.env.NODE_ENV === 'production');

  await bot.start();
}

start();
