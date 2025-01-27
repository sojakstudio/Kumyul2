/* eslint-disable deprecation/deprecation */
import {
  GuildMember,
  EmbedBuilder,
  ChannelType,
  TextChannel,
} from 'discord.js';
import { inspect } from 'util';
import { GuildModel } from '../Database/GuildSchema.js';
import { color, url } from '../config/EmbedConfig.js';
import { Values, parseContent } from '../utils/parseContent.js';
import CustomClient from '../core/client.js';

export default async function guildMemberAdd(
  client: CustomClient,
  member: GuildMember,
) {
  try {
    const guildData = await GuildModel.findOne({ id: member.guild.id });

    client.getLogger().info(inspect(guildData, true, 10, true));

    // 채널 구하기
    let sendchannel: TextChannel | null = null;

    // check if guild is not defined or inmsg is not defined
    if (!guildData || !guildData.inmsg) return;

    // content parsing
    const option: Values = {
      usertag: member.user.discriminator,
      username: member.user.username,
      userid: member.user.id,
      guildname: `${member.guild.name}`,
      guildid: `${member.guild.id}`,
      membercount: `${member.guild.memberCount}`,
    };

    const titlectx = parseContent(guildData?.inmsg[0], option);

    const descctx = parseContent(guildData?.inmsg[1], option).replace(
      /(usermention|\${usermention})/gm,
      `<@${member.user.id}>`,
    );

    const embed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: '시덱이', iconURL: url })
      .setTitle(titlectx)
      .setDescription(descctx);

    // find the channel to send
    // 1. 길드 데이터에 등록된 채널
    if (guildData.inoutmsgchannel) {
      client.getLogger().info('guilddata');
      const channel = await member.guild.channels.fetch(
        guildData.inoutmsgchannel,
      );
      if (channel) {
        if (channel!.type === ChannelType.GuildText) sendchannel = channel;
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
      }
      // 2. 시스템 채널
      else if (member.guild.systemChannel) {
        sendchannel = member.guild.systemChannel;
      }
      // 3. 맨 먼저 채널
      else {
        client.getLogger().info('first channel');
        member.guild.channels.fetch().then(channels => {
          if (channels.size !== 0) {
            let isended = false;
            channels.forEach(channel2 => {
              if (!isended) {
                if (channel2!.type === ChannelType.GuildText) {
                  isended = true;
                  sendchannel = channel2! as TextChannel;
                }
              }
            });
          }
        });
      }

      if (sendchannel) sendchannel.send({ embeds: [embed] });
    }
  } catch (e) {
    client.getLogger().error(e);
  }
}
