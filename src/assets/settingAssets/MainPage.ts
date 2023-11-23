import {
  BaseInteraction,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import { url } from '../../config/EmbedConfig.js';
import ConfigPage from '../../interfaces/ISettings.js';
import PageBuilder from '../../pages/PageBuilder.js';

const MainPage = async (interaction: BaseInteraction, uuid: string) => {
  const page: ConfigPage = {
    name: 'main',
    embed: new PageBuilder('main')
      .setColor(0xffb2d8)
      .setAuthor({ name: '시덱이', iconURL: url })
      .setTitle(`${interaction.guild!.name}의 서버 설정`)
      .setDescription('바꾸고 싶은 설정 창을 열어주세요.')
      .setParagraphs([
        { title: '일반 설정', content: '기본적인 관리 설정' },
        { title: '입/퇴장 설정', content: '입/퇴장 메세지 설정' },
        { title: '경고 설정', content: '경고 관련 설정' },
        { title: '공지 설정', content: '공지 관련 설정' },
        { title: '레벨링 설정', content: '레벨링 시스템 설정' },
        { title: '티켓 설정', content: '티켓 관련 설정' },
        { title: '멤버 설정', content: '멤버 관리 설정' },
      ])
      .setTimestamp()
      .toEmbed(),
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('일반 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.ordinary`),
        new ButtonBuilder()
          .setLabel('입/퇴장 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.inout`),
        new ButtonBuilder()
          .setLabel('경고 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.warn`),
        new ButtonBuilder()
          .setLabel('공지 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.announce`),
        new ButtonBuilder()
          .setLabel('레벨링 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.level`),
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setLabel('티켓 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.ticket`),
        new ButtonBuilder()
          .setLabel('멤버 설정')
          .setStyle(ButtonStyle.Primary)
          .setCustomId(`cdec.${uuid}.config.member`),
      ),
    ],
  };

  return page;
};

export default MainPage;
