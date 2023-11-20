import { Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import ICommand from '../interfaces/ICommand.js';
import logger from '../utils/logger.js';
import { GuildModel } from '../Database/GuildSchema.js';
import { embedtemp } from '../config/EmbedConfig.js';
import CustomClient from '../core/client.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('경고확인')
    .setDescription('사용자의 경고를 확인합니다. (기본: 자기자신)')
    .addUserOption(option =>
      option.setName('대상').setDescription('경고를 확인할 대상'),
    ) as SlashCommandBuilder,
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    const target = interaction.options.getUser('대상') || interaction.user;

    // 길드 없는지 체크
    if (!interaction.guild) {
      return;
    }

    try {
      // 등록 안돼있는지 췍췤췤췤ㅊ퀰
      const result = await GuildModel.findOne({ id: interaction.guild!.id });

      if (!result) {
        interaction.reply({
          content:
            '이 길드는 시덱이 서비스에 등록되어있지 않아요! 관리자에게 요청해보세요!',
          ephemeral: true,
        });

        return;
      }

      let targetwarn = 0;

      // JSON 안에 유저가 있는지 확인
      const object: any = JSON.parse(result.userwarns!);
      let found = false;

      for (let i = 0; i < object.length; i++) {
        if (object[i].id === target!.id) {
          found = true;
          targetwarn = object[i].warn;
        }
      }

      const embed = embedtemp
        .setTitle(`@${target.username}#${target.discriminator}의 경고수`)
        .setDescription(`${targetwarn}개`);

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      client.getLogger().error(err);
    }
  },
};

export default command;
