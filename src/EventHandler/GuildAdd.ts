import { ChannelType, Guild, TextChannel } from 'discord.js';
import { embedtemp } from '../Config/EmbedConfig.js';
import { GuildModel } from '../Database/GuildSchema.js';
import logger from '../Utils/Logger.js';

export default function GuildAdd(guild: Guild) {
  if (!guild.available) return;

  // 채널 가져오기
  guild.channels.fetch().then(channels => {
    if (channels.size === 0) return;

    let isended = false;

    channels.forEach(channel => {
      if (isended) return;
      if (channel!.type === ChannelType.GuildText) {
        const embed = embedtemp;
        embed
          .setTitle('시덱이를 초대해주셔서 감사합니다!')
          .setDescription('No.1 관리봇 시덱이!')
          .setFields(
            {
              name: '시덱이 기능',
              value: '/기능 을 통해 기능을 확인해보세요!',
            },
            {
              name: '도움말',
              value:
                '[도움말](https://sojakstudio.github.io/kumyul/help) 을 확인해보세요!',
            },
            {
              name: '행복한 시덱이 라이프 되세요!',
              value:
                '[디스코드 공식 서버](https://discord.gg/RGYnR3r5XC), [깃허브 이슈](https://github.com/sojakstudio/Kumyul2/issues)',
            },
          );

        (channel as TextChannel).send({ embeds: [embed] });

        // 이미 등록되어있는지 확인

        GuildModel.findOne({ id: guild.id })
          .exec()
          .then(foundguild => {
            logger.info(foundguild);

            // 있으면 리턴
            if (foundguild !== null) return;
            // 없으면 생성
            let sendchannel: TextChannel | null = null;

            if (guild.systemChannel) sendchannel = guild.systemChannel;
            // 3. 맨 먼저 채널
            else {
              sendchannel = channel as TextChannel;
            }

            GuildModel.create({
              id: guild.id,
              warnlimit: 10,
              customdetection: '{}',
              inoutmsgchannel: sendchannel?.id,
            });
          });

        isended = true;
      }
    });
  });
}
