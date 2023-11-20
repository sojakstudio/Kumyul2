import { Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import CustomClient from '../core/client.js';
import ICommand from '../interfaces/ICommand.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('도움말')
    .setDescription('명령어에 대한 도움말을 출력합니다.'),
  MsgExecute: async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  },
  SlashExecute: async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    client.getLogger().info('SlashExecute');
    interaction.reply('Help Command');
  },
};

export default command;
