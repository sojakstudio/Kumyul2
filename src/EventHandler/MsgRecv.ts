import { Message } from 'discord.js';
import logger from '../Utils/Logger.js';
import { GetConfig } from '../Config/ConfigManager.js';
import { ConfigEnum } from '../Enums/Enums.js';
import CommandBundle from '../Commands/CommandBundle.js';
import Parse from '../Debug/CommandParser.js';

const prefix = 'ㅁ';

async function MsgRecv(msg: Message) {
  // 봇이면 리턴
  if (msg.author.bot) {
    return;
  }

  // 메세지 감지
  logger.info(
    `[ ${msg.guild?.name} ] ${msg.member?.user.username}#${msg.member?.user.discriminator} : ${msg.content}`,
  );

  // 커맨드 확인
  if (!msg.content.startsWith('>cdec')) {
    Parse(msg, msg.content.substring(0, 4).trim().split(''));
  }

  // prefix 시작 안하면 리턴
  if (!msg.content.startsWith(prefix)) {
    return;
  }

  // 커맨드 분리
  const args = msg.content.slice(prefix.length).split(/ +/);
  if (args) {
    const command = args.shift()?.toLowerCase();
    logger.info(`Command Detected: ${command}`);

    // 커맨드 번들안에 있으면 execute
    CommandBundle.forEach(async value => {
      logger.info(value.Builder.name);
      if (value.Builder.name === command) {
        // 메세지 커맨드 비활성돼있는지 확인
        const messageenabled = await GetConfig(ConfigEnum.enableMessageCommand);

        if (!messageenabled) {
          msg.reply(
            '봇 서버 관리자가 메세지커맨드를 비활성화했어요! 봇 서버관리자에게 문의해주세요!',
          );
        }
        value.MsgExecute(msg);
      }
    });
  }
}

export default MsgRecv;
