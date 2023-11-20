import {
  Message,
  CommandInteraction,
  CommandInteractionOptionResolver,
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import CustomClient from '../core/client.js';
import ICommand from '../interfaces/ICommand.js';
import logger from '../utils/logger.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('추방')
    .setDescription('사용자를 추방합니다.')
    .addUserOption(option =>
      option
        .setName('사용자')
        .setDescription('추방할 사용자')
        .setRequired(true),
    )
    .addStringOption(option =>
      option.setName('사유').setDescription('유저를 추방할 사유'),
    ) as SlashCommandBuilder,
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    // 권한 구하기
    const perm = interaction.member?.permissions;

    // 관리자 권한 확인
    if (!(perm as PermissionsBitField).toArray().includes('KickMembers')) {
      interaction.reply({
        content: '이 명령어를 실행하려면 멤버 추방하기 권한이 필요해요!',
        ephemeral: true,
      });

      return;
    }

    const target = await interaction.options.getUser('사용자');
    const reason = await (
      interaction.options as CommandInteractionOptionResolver
    ).getString('사유');

    interaction.guild?.members
      .fetch(target!.id)
      .then(async member => {
        // 사유 없는 경우
        if (reason === null) {
          member
            .kick()
            .then(async () => {
              const newembed = new EmbedBuilder()
                .setColor('#CB7ACF')
                .setTitle(
                  `${member.user.username}#${member.user.discriminator}님을 추방했습니다`,
                )
                .setDescription('유저가 추방되었습니다.')
                .addFields([
                  {
                    name: '사유',
                    value: '없읍',
                  },
                ])
                .setTimestamp();

              await interaction.reply({ embeds: [newembed] });
            })
            .catch(() => {
              interaction.reply({
                content: '실행중에 에러가 발생했어요! 저런...',
                ephemeral: true,
              });
            });
        } else {
          // 사유 있는경우
          member
            .kick()
            .then(async () => {
              const newembed = new EmbedBuilder()
                .setColor('#CB7ACF')
                .setTitle(
                  `${member.user.username}#${member.user.discriminator}님을 추방했습니다`,
                )
                .setDescription('유저가 추방되었습니다.')
                .addFields([
                  {
                    name: '사유',
                    value: `\`\`\`${reason}\`\`\``,
                  },
                ])
                .setTimestamp();

              await interaction.reply({ embeds: [newembed] });
            })
            .catch(() => {
              interaction.reply({
                content: '실행중에 에러가 발생했어요! 저런...',
                ephemeral: true,
              });
            });
        }
      })
      .catch(err => {
        interaction.reply({
          content: `Unvaild User Provided, Error: ${err}`,
          ephemeral: true,
        });
      });
  },
};

export default command;
