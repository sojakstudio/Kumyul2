import { Message, CommandInteraction, SlashCommandBuilder } from 'discord.js';
import CustomClient from '../core/client';

export default interface ICommand {
  Builder: SlashCommandBuilder;
  MsgExecute: (client: CustomClient, message: Message) => Promise<void>;
  SlashExecute: (
    client: CustomClient,
    interaction: CommandInteraction,
  ) => Promise<void>;
}
