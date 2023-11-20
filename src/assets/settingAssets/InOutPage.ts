import {
  BaseInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  Role,
  ButtonStyle,
  TextChannel,
  ChannelType,
} from 'discord.js';
import { inspect } from 'util';
import { color, url } from '../../config/EmbedConfig.js';
import { GuildModel } from '../../Database/GuildSchema.js';
import ConfigPage from '../../interfaces/ISettings.js';
import logger from '../../utils/logger.js';

const InOutPage = async (interaction: BaseInteraction, uuid: string) => {
  // eslint-disable-next-line one-var
  let userrole, botrole: Role | null | undefined;
  let inmsg = '미정';
  let outmsg = '미정';
  let sendchannel: string | undefined;

  const guildData = await GuildModel.findOne({ id: interaction.guild!.id });
  const userautorole = guildData?.userautorole;
  const botautorole = guildData?.botautorole;

  // 역할 불러오기
  if (userautorole) {
    userrole = await interaction.guild?.roles.fetch(userautorole);
  }

  if (botautorole) {
    botrole = await interaction.guild?.roles.fetch(botautorole);
  }

  inmsg =
    guildData?.inmsg![0] === undefined || guildData?.inmsg![0] === null
      ? '미정'
      : `\`${guildData?.inmsg![0].substring(0, 7)}\``.concat('...');

  outmsg =
    guildData?.outmsg![0] === undefined || guildData?.outmsg![0] === null
      ? '미정'
      : `\`${guildData?.outmsg![0].substring(0, 7)}\``.concat('...');

  // 채널 구하기

  if (guildData?.inoutmsgchannel) {
    await interaction
      .guild!.channels.fetch(guildData?.inoutmsgchannel)
      .then(querychannel => {
        // 없으면
        if (!querychannel) {
          if (interaction.guild?.systemChannel)
            sendchannel = interaction.guild?.systemChannel.id;
          else {
            // 채널 가져오기
            interaction.guild!.channels.fetch().then(channels => {
              if (channels.size !== 0) {
                let isended = false;

                channels.forEach(channel => {
                  if (!isended && channel!.type === ChannelType.GuildText) {
                    isended = true;
                    sendchannel = channel!.id;
                  }
                });
              }
            });
          }
        } else {
          sendchannel = querychannel.id;
        }
      });
  } else if (interaction.guild?.systemChannel)
    sendchannel = interaction.guild?.systemChannel.id;
  else {
    // 채널 가져오기
    await interaction.guild!.channels.fetch().then(channels => {
      if (channels.size !== 0) {
        let isended = false;

        channels.forEach(channel => {
          if (!isended && channel!.type === ChannelType.GuildText) {
            isended = true;
            sendchannel = channel!.id;
          }
        });
      }
    });
  }

  const page: ConfigPage = {
    name: 'inout',
    embed: new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: '시덱이', iconURL: url })
      .setTitle('입/퇴장 설정')
      .setDescription('입/퇴장 관련 설정 목록입니다.')
      .addFields(
        {
          name: '유저 자동 역할',
          value: userrole ? `<@&${userrole?.id}>` : '미정',
        },
        {
          name: '봇 자동 역할',
          value: botrole ? `<@&${botrole?.id}>` : '미정',
        },
        {
          name: '입/퇴장 메세지 전송 채널',
          value: sendchannel !== undefined ? `<#${sendchannel}>` : '미정',
        },
        {
          name: '입장 메세지',
          value: inmsg,
        },
        {
          name: '퇴장 메세지',
          value: outmsg,
        },
      ),
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('유저 자동 역할 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.execute.userroleconfig`),
        new ButtonBuilder()
          .setLabel('봇 자동 역할 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.execute.botroleconfig`),
        new ButtonBuilder()
          .setLabel('입/퇴장 메세지 전송 채널 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.execute.inoutmsgchannelconfig`),
        new ButtonBuilder()
          .setLabel('입장 메세지 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.execute.inmsgconfig`),
        new ButtonBuilder()
          .setLabel('퇴장 메세지 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.execute.outmsgconfig`),
      ),

      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('뒤로가기')
          .setStyle(ButtonStyle.Danger)
          .setCustomId(`cdec.${uuid}.config.main`),
      ),
    ],
  };

  return page;
};

export default InOutPage;
