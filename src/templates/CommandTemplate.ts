import { Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import CustomClient from '../core/client.js';
import ICommand from '../interfaces/ICommand.js';

const command: ICommand = {
  Builder: new SlashCommandBuilder()
    .setName('Template')
    .setDescription('Template'),
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

class TemplateCommand implements ICommand {
  public Builder = new SlashCommandBuilder()
    .setName('Template')
    .setDescription('Template');
  public MsgExecute = async (client: CustomClient, msg: Message) => {
    client.getLogger().info('MsgExecute');
  };
  public SlashExecute = async (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => {
    client.getLogger().info('SlashExecute');
  };
}

export default command;
