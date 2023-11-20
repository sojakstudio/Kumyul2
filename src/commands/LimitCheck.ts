import { Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import ICommand from '../interfaces/ICommand.js';
import { GuildModel } from '../Database/GuildSchema.js';
import CustomClient from '../core/client.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('한도확인')
    .setDescription('이 서버의 경고한도를 출력합니다.'),
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    // #region 지옥같은 널체크 시작
    if (!interaction.guild) {
      interaction.reply({
        content: '어허 길드 안에서만 이 커맨드를 쓸 수 있답니다! 친구!',
        ephemeral: true,
      });
    }

    // #endregion

    try {
      client.getLogger().info('find');
      const result = await GuildModel.findOne({ id: interaction.guild!.id });

      if (!result) {
        interaction.reply({
          content:
            '이 길드는 시덱이 서비스에 등록되어있지 않아요! 관리자에게 요청해보세요!',
          ephemeral: true,
        });

        return;
      }

      interaction.reply(`이 서버의 한도는 ${result.warnlimit}이에요!`);

      return;
    } catch (err) {
      interaction.reply({
        content: '처리중에 오류가 발생했어요! 다시 시도해주세요!',
        ephemeral: true,
      });
    }
  },
};

export default command;
