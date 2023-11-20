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
import { embedtemp } from '../config/EmbedConfig.js';
import CustomClient from '../core/client.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('경고')
    .setDescription('사용자에게 경고를 부여합니다. (기본량: 1)')
    .addUserOption(option =>
      option
        .setName('유저')
        .setDescription('경고를 부여할 유저')
        .setRequired(true),
    )
    .addIntegerOption(option =>
      option.setName('경고수').setDescription('추가할 경고수'),
    ) as SlashCommandBuilder,
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    const target = interaction.options.getUser('유저');
    const amount = (
      interaction.options as CommandInteractionOptionResolver
    ).getInteger('경고수');

    // 널체크
    if (!target) {
      interaction.reply({
        content: '경고를 부여할 유저를 지정해주세요!',
        ephemeral: true,
      });
    }

    // 길드 없는지 체크
    if (!interaction.guild) {
      return;
    }

    // 권한 체크
    if (
      !(interaction.member?.permissions as PermissionsBitField)
        .toArray()
        .includes('BanMembers')
    ) {
      interaction.reply({
        content:
          '이 명령어를 실행하려면 멤버 차단하기/추방하기 권한이 필요해요!',
        ephemeral: true,
      });

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

      // JSON parse
      /* 
        [
          {
            id: 'userid',
            warn: 1
          },
          {
            id: 'user2',
            warn: 10
          }
        ]
      */
      // JSON 안에 유저가 있는지 확인
      const object: any = JSON.parse(result.userwarns!);
      let found = false;

      for (let i = 0; i < object.length; i++) {
        if (object[i].id === target!.id) {
          found = true;
          object[i].warn += amount || 1;
        }
      }

      if (!found) {
        object.push({ id: target!.id, warn: amount || 1 });
      }

      // String 으로 변환
      const string = JSON.stringify(object);

      await GuildModel.updateOne(
        { id: interaction.guild!.id },
        { userwarns: string },
      );

      const embed = embedtemp
        .setTitle('✅ 경고가 부여됨')
        .setDescription(
          `<@${target!.id}>에게 ${amount || 1}만큼의 경고를 부여함`,
        );

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      client.getLogger().error(err);
    }
  },
};

export default command;
