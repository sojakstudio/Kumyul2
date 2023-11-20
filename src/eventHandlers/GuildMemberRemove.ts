import {
  GuildMember,
  EmbedBuilder,
  TextChannel,
  ChannelType,
  PartialGuildMember,
} from 'discord.js';
import { inspect } from 'util';
import { GuildModel } from '../Database/GuildSchema.js';
import { Values, parseContent } from '../utils/parseContent.js';
import logger from '../utils/logger.js';
import { color, url } from '../config/EmbedConfig.js';

export default function GuildMemberRemove(
  member: GuildMember | PartialGuildMember,
) {
  GuildModel.findOne({
    id: member.guild.id,
  })
    .then(guildData => {
      // 가입해 닝겐
      if (!guildData) {
        return;
      }

      if (!guildData.outmsg) {
        return;
      }

      logger.info(inspect(guildData));

      // 입장메세지가 있다면
      if (guildData?.outmsg) {
        // 컨텐츠 파싱
        const option: Values = {
          usertag: member.user.discriminator,
          username: member.user.username,
          userid: member.user.id,
          guildname: `${member.guild.name}`,
          guildid: `${member.guild.id}`,
          membercount: `${member.guild.memberCount}`,
        };

        const titlectx = parseContent(guildData?.outmsg[0], option);

        let descctx = parseContent(guildData?.outmsg[1], option);

        descctx = descctx.replace(
          /(usermention|\${usermention})/gm,
          `<@${member.user.id}>`,
        );

        const embed = new EmbedBuilder()
          .setColor(color)
          .setAuthor({ name: '시덱이', iconURL: url })
          .setTitle(titlectx)
          .setDescription(descctx);

        // 채널 구하기
        let sendchannel: TextChannel | null = null;

        // 1. 길드 데이터에 등록된 채널
        if (guildData.inoutmsgchannel) {
          logger.info('guilddata');
          member.guild.channels
            .fetch(guildData.inoutmsgchannel)
            .then(channel => {
              if (channel)
                if (channel!.type === ChannelType.GuildText)
                  sendchannel = channel;
                else if (member.guild.systemChannel)
                  sendchannel = member.guild.systemChannel;
                // 3. 맨 먼저 채널
                else {
                  member.guild.channels.fetch().then(channels => {
                    if (channels.size !== 0) {
                      let isended = false;
                      channels.forEach(eachchannel => {
                        if (!isended) {
                          if (eachchannel!.type === ChannelType.GuildText) {
                            isended = true;
                            sendchannel = eachchannel! as TextChannel;
                          }
                        }
                      });
                    }
                  });
                }
            })
            .catch(e => {
              logger.error(`guild channel fetch error: ${e}`);
            });
        }
        // 2. 시스템 채널
        else if (member.guild.systemChannel)
          sendchannel = member.guild.systemChannel;
        // 3. 맨 먼저 채널
        else {
          logger.info('first channel');
          member.guild.channels.fetch().then(channels => {
            if (channels.size !== 0) {
              let isended = false;
              channels.forEach(channel => {
                if (!isended) {
                  if (channel!.type === ChannelType.GuildText) {
                    isended = true;
                    sendchannel = channel! as TextChannel;
                  }
                }
              });
            }
          });
        }

        if (sendchannel) sendchannel.send({ embeds: [embed] });
      }
    })
    .catch(e => {
      logger.error(`guild data find error: '${e}'`);
    });
}
