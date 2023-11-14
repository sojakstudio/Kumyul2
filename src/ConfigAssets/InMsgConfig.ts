import {
  ActionRowBuilder,
  CommandInteraction,
  BaseInteraction,
  ButtonInteraction,
  ComponentType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
  InteractionCollector,
  InteractionType,
  MessageComponentInteraction,
  CollectedInteraction,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from 'discord.js';
import { inspect } from 'util';
import ConfigPage from '../Interfaces/IConfigPage.js';
import { InOutPage } from './index.js';
import { client } from '../EventHandler/MainHandler.js';
import logger from '../Utils/Logger.js';
import { color, url } from '../Config/EmbedConfig.js';
import { GuildModel } from '../Database/GuildSchema.js';
import { Values, ParseInOutMsg } from '../Utils/ParseString.js';

const InMsgConfig = (
  interaction: BaseInteraction,
  uuid: string,
): Promise<
  (interaction1: BaseInteraction, uuid1: string) => Promise<ConfigPage>
> =>
  new Promise<
    (interaction2: BaseInteraction, uuid2: string) => Promise<ConfigPage>
  >(async (resolve, reject) => {
    const parentPage = InOutPage;

    // Create the modal
    const modal = new ModalBuilder()
      .setCustomId(`cmodal.${uuid}`)
      .setTitle('입장 메시지 설정');

    // Add components to modal

    // Create the text input components
    const input1 = new TextInputBuilder()
      .setCustomId(`cmodal.${uuid}.title`)
      .setLabel('제목')
      .setStyle(TextInputStyle.Short);

    const input2 = new TextInputBuilder()
      .setCustomId(`cmodal.${uuid}.desc`)
      .setLabel('본문')
      .setStyle(TextInputStyle.Paragraph);

    const actionRow1 =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        input1,
      );
    const actionRow2 =
      new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
        input2,
      );

    modal.addComponents(actionRow1, actionRow2);

    (interaction as ButtonInteraction).showModal(modal);

    // collector
    const collector = new InteractionCollector(client, {
      guild: interaction.guild!,
      interactionType: InteractionType.ModalSubmit,
    });

    collector.filter = (i: CollectedInteraction) =>
      i.user.id === interaction.user.id;

    collector.on('collect', async (i: ModalSubmitInteraction) => {
      if (i.customId === `cmodal.${uuid}`) {
        const title = i.fields.getTextInputValue(`cmodal.${uuid}.title`);
        const desc = i.fields.getTextInputValue(`cmodal.${uuid}.desc`);

        collector.stop();

        // 컨텐츠 파싱
        const option: Values = {
          usertag: i.user.discriminator,
          username: i.user.username,
          userid: i.user.id,
          guildname: `${i.guild?.name}`,
          guildid: `${i.guild?.id}`,
          membercount: `${i.guild?.memberCount}`,
        };

        const titlectx = ParseInOutMsg(title, option);

        let descctx = ParseInOutMsg(desc, option);

        descctx = descctx.replace(
          /(usermention|\${usermention})/gm,
          `<@${i.user.id}>`,
        );

        const prefix = `cdecmodalinputconfirm.${uuid}`;

        // 콜렉터 필터
        const filter = (int: MessageComponentInteraction) => {
          return (
            int.customId.startsWith(prefix) &&
            int.user.id === interaction.user.id
          );
        };

        // 컴포넌트 콜렉터 생성
        const buttoncollector =
          interaction.channel?.createMessageComponentCollector({
            filter,
            componentType: ComponentType.Button,
          });

        const button = new ButtonBuilder()
          .setLabel('확인')
          .setStyle(ButtonStyle.Success)
          .setCustomId(`${prefix}.true`);
        const button2 = new ButtonBuilder()
          .setLabel('취소')
          .setStyle(ButtonStyle.Danger)
          .setCustomId(`${prefix}.false`);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          button,
          button2,
        );

        const embed = new EmbedBuilder()
          .setColor(color)
          .setAuthor({ name: '시덱이', iconURL: url })
          .setTitle(titlectx)
          .setDescription(descctx);

        const replymsg = await i.reply({
          content:
            '> :pushpin: 입장 메시지 예시 화면이에요! 진행하고 싶으면 `확인`, 취소하고 싶으면 `취소`를 눌러주세요!',
          embeds: [embed],
          components: [row],
          fetchReply: true,
        });

        buttoncollector!.on('collect', async buttoni => {
          const result = buttoni.customId.substring(prefix.length + 1);

          collector.stop();

          try {
            await replymsg.delete();

            if (result === 'true') {
              await GuildModel.updateOne(
                { id: i.guild?.id },
                { inmsg: [title, desc] },
              );
              buttoni.reply({
                content: '변경사항을 성공적으로 반영했어요!',
                ephemeral: true,
              });
            } else if (result === 'false')
              buttoni.reply({
                content: '입장 메세지 입력을 취소했어요! 다시 시도해주세요!',
                ephemeral: true,
              });

            resolve(parentPage);
          } catch (e) {
            logger.error(e);
          }
        });
      }
    });
  });

export default InMsgConfig;
