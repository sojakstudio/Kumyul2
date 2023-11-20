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
    .setName('차단')
    .setDescription('사용자를 차단합니다. (기본량: 차단해제 X)')
    .addUserOption(option =>
      option
        .setName('사용자')
        .setDescription('차단할 사용자')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option
        .setName('삭제메세지')
        .setDescription('삭제할 유저의 메세지 기록')
        .setRequired(true)
        .addChoices(
          { name: '삭제하기 않기', value: 0 },
          { name: '최근 24시간', value: 1 },
          { name: '최근 7일', value: 7 },
        ),
    )
    .addStringOption(option =>
      option.setName('사유').setDescription('유저를 차단할 사유'),
    ) as SlashCommandBuilder,
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    if (!interaction.guild) return;
    if (!interaction.member) return;

    // 권한 구하기
    const perm = interaction.member?.permissions;

    // 관리자 권한 확인
    if (!(perm as PermissionsBitField).toArray().includes('BanMembers')) {
      interaction.reply({
        content: '이 명령어를 실행하려면 멤버 차단하기 권한이 필요해요!',
        ephemeral: true,
      });

      return;
    }

    const target = interaction.options.getUser('사용자');

    client.getLogger().info(target);

    const reason = (
      interaction.options as CommandInteractionOptionResolver
    ).getString('사유');
    const date = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger('메세지 삭제');

    interaction.guild?.members // 차단 실행
      .fetch({ user: target! })
      .then(member => {
        // 사유 없는 경우
        if (!reason) {
          member
            .ban({
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              deleteMessageDays: date!,
            })
            .then(async () => {
              const newembed = new EmbedBuilder()
                .setColor('#CB7ACF')
                .setTitle(
                  `${member.user.username}#${member.user.discriminator}님을 차단했습니다`,
                )
                .setDescription('유저가 차단되었습니다.')
                .addFields([
                  {
                    name: '메세지 삭제 기한',
                    value: `${date!}`,
                  },
                ])
                .setTimestamp();

              await interaction.reply({ embeds: [newembed] });
            })
            .catch(() => {
              interaction.reply({
                content: '실행중에 에러가 발생했어요!',
                ephemeral: true,
              });
            });
          // 리턴
          return;
        }
        // 사유가 있으면
        member
          .ban({
            deleteMessageDays: date!,
            reason,
          })
          .then(async () => {
            const newembed = new EmbedBuilder()
              .setColor('#CB7ACF')
              .setTitle(
                `${member.user.username}#${member.user.discriminator}님을 차단했습니다`,
              )
              .setDescription('유저가 차단되었습니다.')
              .addFields([
                {
                  name: '사유',
                  value: `\`\`\`${reason}\`\`\``,
                },
                {
                  name: '메세지 삭제 기한',
                  value: `${date!}`,
                },
              ])
              .setTimestamp();

            await interaction.reply({ embeds: [newembed] });
          })
          .catch(() => {
            interaction.reply({
              content: '실행중에 에러가 발생했어요!',
              ephemeral: true,
            });
          });
        // 리턴
        return;
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
