import {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  BaseInteraction,
  ChannelType,
} from 'discord.js';
import { inspect } from 'util';
import ConfigPage from '../../interfaces/ISettings.js';
import { url, color } from '../../config/EmbedConfig.js';
import { GuildModel } from '../../Database/GuildSchema.js';
import logger from '../../utils/logger.js';

const AnnouncePage = async (interaction: BaseInteraction, uuid: string) => {
  const guildData = await GuildModel.findOne({ id: interaction.guild!.id });

  logger.info(inspect(guildData, true, 10, true));

  let announcechannel: string | undefined;

  if (guildData?.announcechannel) {
    const querychannel = await interaction.guild!.channels.fetch(
      guildData?.announcechannel,
    );
    if (
      querychannel &&
      (querychannel?.type === ChannelType.GuildText ||
        querychannel?.type === ChannelType.GuildAnnouncement)
    ) {
      announcechannel = querychannel.id;
    }
  }

  const page: ConfigPage = {
    name: 'announce',
    embed: new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: '시덱이', iconURL: url })
      .setTitle('공지 설정')
      .setDescription('공지 설정 목록입니다.')
      .addFields({
        name: '공지 전송 채널 설정',
        value: announcechannel ? `<#${announcechannel}>` : '미정',
      }),
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('공지 전송 채널 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.execute.announcechconfig`),
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

export default AnnouncePage;
