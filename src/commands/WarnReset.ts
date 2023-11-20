import {
  Message,
  CommandInteraction,
  PermissionsBitField,
  SlashCommandBuilder,
} from 'discord.js';
import ICommand from '../interfaces/ICommand.js';
import logger from '../utils/logger.js';
import { GuildModel } from '../Database/GuildSchema.js';
import { embedtemp } from '../config/EmbedConfig.js';
import CustomClient from '../core/client.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('경고초기화')
    .setDescription('사용자의 경고를 초기화합니다 (기본: 자기자신)')
    .addUserOption(option =>
      option.setName('대상').setDescription('경고를 초기화할 유저'),
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
          object[i].warn = 0;
        }
      }

      if (!found) {
        object.push({ id: target!.id, warn: 0 });
      }

      // String 으로 변환
      const string = JSON.stringify(object);

      await GuildModel.updateOne(
        { id: interaction.guild!.id },
        { userwarns: string },
      );

      const embed = embedtemp
        .setTitle('✅ 경고가 초기화됨')
        .setDescription(`<@${target!.id}>의 경고를 초기화함`);

      interaction.reply({ embeds: [embed] });
    } catch (err) {
      client.getLogger().error(err);
    }
  },
};

export default command;
