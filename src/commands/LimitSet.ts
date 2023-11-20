import {
  Message,
  CommandInteraction,
  CommandInteractionOptionResolver,
  SlashCommandBuilder,
  PermissionsBitField,
} from 'discord.js';
import ICommand from '../interfaces/ICommand.js';
import logger from '../utils/logger.js';
import { GuildModel } from '../Database/GuildSchema.js';
import CustomClient from '../core/client.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('한도설정')
    .setDescription('이 서버의 한도를 지정합니다.')
    .addIntegerOption(option =>
      option
        .setName('한도')
        .setDescription('이 서버의 바꿀 경고 한도')
        .setRequired(true),
    ) as SlashCommandBuilder,
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    const limit = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger('한도');

    // 경고 한도 0 이하인 경우 체크
    if (limit! <= 0) {
      interaction.reply({
        content:
          '경고 한도를 0 이하로 설정할 수 없어요! 경고기능을 비활성화하려면 /서버설정 명령어를 사용해주세요!',
        ephemeral: true,
      });

      return;
    }

    // 길드 없는경우 리턴
    if (!interaction.guild) return;

    // 권한 잇는지 체크
    if (
      !(interaction.member?.permissions as PermissionsBitField)
        .toArray()
        .includes('ManageGuild')
    ) {
      interaction.reply({
        content: '이 명령어를 실행하려면 서버 관리 기능이 필요해요!',
        ephemeral: true,
      });

      return;
    }

    try {
      // DB 에서 길드 데이터 파인트
      const result = await GuildModel.findOne({ id: interaction.guild?.id });

      // 없으면 리턴
      if (!result) {
        interaction.reply({
          content:
            '이 길드는 시덱이 서비스에 등록되어있지 않아요! 관리자에게 요청해보세요!',
          ephemeral: true,
        });

        return;
      }

      // 있으면 수정
      await GuildModel.updateOne(
        { id: interaction.guild?.id },
        { warnlimit: limit },
      );

      interaction.reply(
        `성공적으로 한도를 변경하였습니다!, 변경된 한도: ${limit}`,
      );
    } catch (err) {
      client.getLogger().error(err);
    }
  },
};

export default command;
