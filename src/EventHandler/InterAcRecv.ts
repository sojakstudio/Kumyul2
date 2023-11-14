import { Interaction } from 'discord.js';
import InterAcCommand from './InterAcCommand.js';
import InterAcButton from './InterAcButton.js';

async function InterAcRecv(interaction: Interaction) {
  if (interaction.isCommand()) {
    InterAcCommand(interaction);
  }
  if (interaction.isButton()) {
    InterAcButton(interaction);
  }
}

export default InterAcRecv;
