import { randomUUID } from 'crypto';
import {
  Message,
  CommandInteraction,
  SlashCommandBuilder,
  PermissionsBitField,
  ModalBuilder,
  ActionRowBuilder,
  Client,
  CollectedInteraction,
  InteractionCollector,
  InteractionType,
  ModalActionRowComponentBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  MessageComponentInteraction,
  TextChannel,
} from 'discord.js';
import { url } from '../config/EmbedConfig.js';
import CustomClient from '../core/client.js';
import { AnnounceClass, AnnounceModel } from '../Database/AnnounceSchema.js';
import { GuildModel } from '../Database/GuildSchema.js';
import ICommand from '../interfaces/ICommand.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('공지')
    .setDescription('공지 채널에 공지를 보내요!'),
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    // check if guild or channel is null
    if (!interaction.guild || !interaction.channel) return;

    // check interaction issued user has permission to execute
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

    // get guild data
    try {
      const guildData = await GuildModel.findOne({ id: interaction.guild.id });

      if (!guildData) {
        interaction.reply({
          content:
            '이 길드는 시덱이 서비스에 등록되어있지 않아요! 관리자에게 요청해보세요!',
          ephemeral: true,
        });

        return;
      }

      const announceChannelID = guildData.announcechannel;

      if (!announceChannelID) {
        interaction.reply({
          content:
            "This guild's announcement channel is not defined, please define at server settings.",
          ephemeral: true,
        });

        return;
      }

      // find channel
      const channel = await interaction.guild?.channels.fetch(
        announceChannelID,
      );

      if (!channel || channel?.type !== 0) {
        interaction.reply({
          content:
            "This guild's designated announcement channel is invalid, please define at server settings.",
          ephemeral: true,
        });

        return;
      }

      // summon modal window & collect
      const uuid = `${randomUUID()}`;

      // modal 생성
      const modal = new ModalBuilder()
        .setCustomId(`canoucemodal.${uuid}`)
        .setTitle('공지');

      const input1 = new TextInputBuilder()
        .setMaxLength(256)
        .setCustomId(`canoucemodal.${uuid}.title`)
        .setLabel('제목')
        .setStyle(TextInputStyle.Short);

      const input2 = new TextInputBuilder()
        .setMaxLength(4000)
        .setCustomId(`canoucemodal.${uuid}.ctnt`)
        .setLabel('내용')
        .setValue('새 공지에요!')
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

      // create modal input window
      interaction.showModal(modal);

      // collector
      const collector = new InteractionCollector(client as Client, {
        guild: interaction.guild!,
        interactionType: InteractionType.ModalSubmit,
      });

      collector.filter = (i: CollectedInteraction) =>
        i.user.id === interaction.user.id &&
        i.customId === `canoucemodal.${uuid}`;

      // when modal returned
      collector.on('collect', async (i: ModalSubmitInteraction) => {
        const title = i.fields.getTextInputValue(`canoucemodal.${uuid}.title`);
        const ctnt = i.fields.getTextInputValue(`canoucemodal.${uuid}.ctnt`);

        collector.stop();

        const embed = new EmbedBuilder()
          .setColor('#ad1456')
          .setAuthor({ name: 'CdecBot', iconURL: url })
          .setTitle(title)
          .setDescription(ctnt)
          .setFooter({ text: '0 User Read | Press 👍 To Mark as Read' });

        const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setCustomId(`cdanunce.${uuid}_proceed`)
            .setLabel('✔️')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`cdanunce.${uuid}_cancel`)
            .setLabel('❌')
            .setStyle(ButtonStyle.Danger),
        );

        const msg = await i.reply({
          content: `Press ✅ to post announcement at channel <#${channel.id}>, or press ❌ to cancel.`,
          embeds: [embed],
          components: [buttons],
          fetchReply: true,
        });

        const filter = (i2: MessageComponentInteraction) => {
          return (
            i2.customId.startsWith(`cdanunce.${uuid}`) &&
            i2.user.id === interaction.user.id
          );
        };

        const confirmation = await msg.awaitMessageComponent({
          filter,
          time: 180_000,
        });

        if (confirmation.customId === `cdanunce.${uuid}_proceed`) {
          await msg.delete();

          const checkbutton =
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(`cdanunce.${uuid}_read`)
                .setLabel('👍')
                .setStyle(ButtonStyle.Success),
            );

          await (channel as TextChannel).send({
            embeds: [embed],
            components: [checkbutton],
          });

          await confirmation.reply({
            content: 'Announcement successfully posted',
            ephemeral: true,
          });

          await AnnounceModel.create({
            id: uuid,
            title,
            content: ctnt || null,
            msgid: msg.id,
            guild: interaction.guild?.id,
            channel: interaction.channel?.id,
            read: 0,
            userread: new Array<string>(),
            maker: interaction.user.id,
            makername: `${interaction.user.username}#${interaction.user.discriminator}`,
          });
        } else if (confirmation.customId === `cdanunce.${uuid}_cancel`) {
          await msg.delete();
          await confirmation.reply({
            content: 'Announcement cancelled',
            ephemeral: true,
          });
        }
      });
    } catch (e) {
      client.getLogger().error(e);
    }
  },
};

export default command;
