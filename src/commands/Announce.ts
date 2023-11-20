import { Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import CustomClient from '../core/client.js';
import ICommand from '../interfaces/ICommand.js';
import logger from '../utils/logger.js';

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
    client.getLogger().info('SlashExecute');
  },
};

export default command;
