import { Interaction } from 'discord.js';
import InterAcCommand from './InterAcCommand.js';
import InterAcButton from './InterAcButton.js';
import CustomClient from '../core/client.js';

async function interactionCreate(
  client: CustomClient,
  interaction: Interaction,
) {
  if (interaction.isCommand()) {
    InterAcCommand(client, interaction);
  }
  if (interaction.isButton()) {
    InterAcButton(interaction);
  }
}

export default interactionCreate;
