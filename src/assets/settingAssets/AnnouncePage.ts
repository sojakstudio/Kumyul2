import {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  BaseInteraction,
  ChannelType,
} from 'discord.js';
import ConfigPage from '../../interfaces/ISettings.js';
import { url, color } from '../../config/EmbedConfig.js';
import { GuildModel } from '../../Database/GuildSchema.js';

const AnnouncePage = async (interaction: BaseInteraction, uuid: string) => {
  const guildData = await GuildModel.findOne({ id: interaction.guild!.id });

  let announcechannel: string | undefined;

  if (guildData?.announcechannel) {
    await interaction
      .guild!.channels.fetch(guildData?.announcechannel)
      .then(querychannel => {
        if (querychannel) {
          if (querychannel?.type === ChannelType.GuildText) {
            announcechannel = querychannel.id;
          }
        }
      });
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
    ],
  };

  return page;
};

export default AnnouncePage;
