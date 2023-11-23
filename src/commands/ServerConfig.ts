/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  Message,
  CommandInteraction,
  MessageComponentInteraction,
  SlashCommandBuilder,
  ButtonStyle,
  ComponentType,
  ActionRowBuilder,
  ButtonBuilder,
  EmbedBuilder,
  InteractionResponse,
  BaseInteraction,
  PermissionsBitField,
} from 'discord.js';
import { inspect } from 'util';
import { randomUUID } from 'crypto';
import ICommand from '../interfaces/ICommand.js';
import { color, url } from '../config/EmbedConfig.js';
import { GuildModel } from '../Database/GuildSchema.js';
import ConfigPage, { ConfigWindow } from '../interfaces/ISettings.js';
import {
  InOutPage,
  MainPage,
  OrdinaryPage,
  SysChConfig,
  AnnouncePage,
  UserAutoRoleConfig,
  BotAutoRoleConfig,
  InOutMsgChannelConfig,
  InMsgConfig,
  OutMsgConfig,
  AnnounceChConfig,
} from '../assets/settingAssets/index.js';
import CustomClient from '../core/client.js';

// #region Pages
const PageTemplate = (interaction: BaseInteraction, uuid: string) => {
  const page: ConfigPage = {
    name: 'main',
    embed: new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: '시덱이', iconURL: url })
      .setTitle(`${interaction.guild!.name}의 서버 설정`)
      .setDescription('바꾸고 싶은 설정 창을 열어주세요.')
      .addFields(
        { name: '일반 설정', value: '기본적인 관리 설정' },
        { name: '입/퇴장 설정', value: '입/퇴장 메세지 설정' },
        { name: '경고 설정', value: '경고 관련 설정' },
        { name: '공지 설정', value: '공지 관련 설정' },
        { name: '레벨링 설정', value: '레벨링 시스템 설정' },
        { name: '티켓 설정', value: '티켓 관련 설정' },
        { name: '멤버 설정', value: '멤버 관리 설정' },
      ),
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
          .setCustomId(`cdec.${uuid}.config.notice`),
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

// const PageList: ((
//   interaction: CommandInteraction,
//   guildData: GuildClass,
//   uuid: string,
// ) => Promise<ConfigPage>)[] = [MainPage, OrdinaryPage, InOutPage];

const PageList = new Map<
  string,
  (interaction: BaseInteraction, uuid: string) => Promise<ConfigPage>
>();
PageList.set('main', MainPage);
PageList.set('ordinary', OrdinaryPage);
PageList.set('inout', InOutPage);
PageList.set('announce', AnnouncePage);

const ExecuteList = new Array<ConfigWindow>();
// ExecuteList.set('syschconfig', SysChConfig);
// ExecuteList.set('userroleconfig', UserAutoRoleConfig);
// ExecuteList.set('botroleconfig', BotAutoRoleConfig);
// ExecuteList.set('inmsgconfig', InMsgConfig);
// ExecuteList.set('outmsgconfig', OutMsgConfig);
// ExecuteList.set('inoutmsgchannelconfig', InOutMsgChannelConfig);
ExecuteList.push(
  SysChConfig,
  UserAutoRoleConfig,
  BotAutoRoleConfig,
  InMsgConfig,
  OutMsgConfig,
  InOutMsgChannelConfig,
  AnnounceChConfig,
);

export { PageList, ExecuteList };

// #endregion

// ⚠️ 열지마라 이거
const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('서버설정')
    .setDescription('서버의 설정을 변경합니다.'),
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    const channel = interaction.channel;
    const guild = interaction.guild;

    if (!guild) return;
    if (!channel) return;

    if (
      !(interaction.member?.permissions as PermissionsBitField)
        .toArray()
        .includes('ManageGuild') &&
      !(interaction.member?.permissions as PermissionsBitField)
        .toArray()
        .includes('Administrator')
    ) {
      interaction.reply({
        content: '이 명령어를 실행하려면 서버 관리하기 권한이 필요해요!',
        ephemeral: true,
      });

      return;
    }

    const uuid = randomUUID();

    try {
      const guilddata = await GuildModel.findOne({ id: guild!.id });

      // not registered
      if (!guilddata) {
        interaction.reply({
          content:
            '이 길드는 시덱이 서비스에 등록되어있지 않아요! 관리자에게 요청해보세요!',
          ephemeral: true,
        });

        return;
      }

      // get mainpage
      const pagename = 'main';

      const page = PageList.get(pagename);

      if (!page) client.getLogger().info('MAIN_PAGE_NOT_FOUND');

      let replyinteraction: InteractionResponse<boolean> | undefined;

      // send page
      let replymsg = await interaction.reply({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        embeds: [(await page!(interaction, uuid)).embed],
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        components: (await page!(interaction, uuid)).components,
        fetchReply: true,
      });

      const prefix = `cdec.${uuid}.config.`;

      // button collector filter
      const filter = (i: MessageComponentInteraction) => {
        return (
          i.customId.startsWith(prefix) && i.user.id === interaction.user.id
        );
      };

      // create button collector
      const collector = channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        // 60 min
        time: 3600_000,
        max: 1000,
        maxComponents: 1000,
      });

      // detect idle time
      let sec = 0;
      const idleInterval = setInterval(async () => {
        sec++;

        client.getLogger().info(`Idle timer ${sec}sec`);
        // if idle timer over 5m
        if (sec >= 30) {
          collector.stop();
          // change final reply msg
          if (replymsg) {
            await replymsg.delete();
            await channel.send({
              content: 'Idle for 5 minutes! Closing the Server Settings!',
            });
          }

          clearInterval(idleInterval);
        }
      }, 1000);

      collector.on('collect', async i => {
        // reset idle timer
        sec = 0;

        const executecode = i.customId.substring(prefix.length);

        client.getLogger().info(`Execute Code ${i.customId}`);

        // if it is a execute command
        if (executecode.startsWith('execute')) {
          const assetName = executecode.substring(8);

          if (!ExecuteList.filter(object => object.name === assetName)) {
            client.getLogger().info('Page Not Found 404');
            return;
          }

          const result = ExecuteList.find(object => object.name === assetName);

          if (result) {
            if (replymsg) await replymsg.delete();

            // execute page
            const returnpage = await result.execute(i, uuid, client);

            replymsg = await channel.send({
              embeds: [(await returnpage(i, uuid)).embed],
              components: (await returnpage(i, uuid)).components,
            });
          }
        } // or find a page
        else {
          const executepage = PageList.get(executecode);

          // 메인페이지 전송
          if (executepage) {
            if (replymsg) await replymsg.delete();

            replymsg = await i.reply({
              embeds: [(await executepage(i, uuid)).embed],
              components: (await executepage(i, uuid)).components,
              fetchReply: true,
            });
          } else {
            client.getLogger().info('Page Not Found 404');
          }
        }
      });

      collector.on('dispose', async i => {
        client.getLogger().info(`Collector ${uuid} disposed`);
      });

      collector.on('end', async i => {
        client.getLogger().info(`Collector ${uuid} ended`);
      });
    } catch (e) {
      client.getLogger().error(inspect(e, true, 5, true));
    }
  },
};

export default command;
