// 모듈 로드
import {
  Message,
  Interaction,
  Guild,
  GuildMember,
  PartialGuildMember,
} from 'discord.js';
import * as dotenv from 'dotenv';
import {
  client,
  Start,
  MsgRecv,
  InterAcRecv,
  GuildAdd,
  GuildMemberAdd,
  GuildMemberRemove,
} from './EventHandler/index.js';
import { LoadConfig } from './Config/ConfigManager.js';
import { Connect } from './Database/DBManager.js';
import logger from './Utils/Logger.js';

// .env 로딩
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

LoadConfig().then(async () => {
  await Connect();

  client.once('ready', () => Start());

  client.on('messageCreate', (msg: Message) => {
    MsgRecv(msg);
  });

  client.on('interactionCreate', (interaction: Interaction) => {
    InterAcRecv(interaction);
  });

  client.on('guildCreate', (guild: Guild) => {
    GuildAdd(guild);
  });

  client.on('guildMemberAdd', (member: GuildMember) => {
    GuildMemberAdd(member);
  });

  client.on('guildMemberRemove', (member: GuildMember | PartialGuildMember) => {
    logger.info('guild member remove');
    GuildMemberRemove(member);
  });

  client.login(
    process.env.NODE_ENV === 'production'
      ? process.env.TOKEN
      : process.env.TESTTOKEN,
  );
});
