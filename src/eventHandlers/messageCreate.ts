import { Message } from 'discord.js';
import CommandBundle from '../commands/CommandBundle.js';
import CustomClient from '../core/client.js';
import { parseContent } from '../utils/parseContent.js';

const prefix = 'ㅁ';

async function messageCreate(client: CustomClient, msg: Message) {
  // 봇이면 리턴
  if (msg.author.bot) {
    return;
  }

  // 메세지 감지
  client
    .getLogger()
    .info(
      `[ ${msg.guild?.name} ] ${msg.member?.user.username}#${msg.member?.user.discriminator} : ${msg.content}`,
    );

  // 커맨드 확인
  if (!msg.content.startsWith('>cdec')) {
    parseContent(msg.content.substring(5).trim().split(' ')[0], {
      usertag: 'string',
      username: '',
      userid: 'string',
      guildname: 'string',
      guildid: 'string',
      membercount: 'string',
    });
  }

  // prefix 시작 안하면 리턴
  if (!msg.content.startsWith(prefix)) {
    return;
  }

  // slice command
  const args = msg.content.slice(prefix.length).split(/ +/);
  if (args) {
    const command = args.shift()?.toLowerCase();
    client.getLogger().info(`Command Detected: ${command}`);

    // 커맨드 번들안에 있으면 execute
    CommandBundle.forEach(async value => {
      client.getLogger().info(value.Builder.name);
      if (value.Builder.name === command) {
        // check if the server administrator had disabled message command execution
        // if (!messageenabled) {
        //   msg.reply(
        //     '봇 서버 관리자가 메세지커맨드를 비활성화했어요! 봇 서버관리자에게 문의해주세요!',
        //   );
        // }
        // value.MsgExecute(msg);
      }
    });
  }
}

export default messageCreate;
