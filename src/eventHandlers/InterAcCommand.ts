import { CommandInteraction } from 'discord.js';
import CommandBundle from '../commands/CommandBundle.js';
import CustomClient from '../core/client.js';

async function InterAcCommand(
  client: CustomClient,
  interaction: CommandInteraction,
) {
  // 커맨드번들에서 찾기
  const command = CommandBundle.find(
    value => value.Builder.name === interaction.commandName,
  );

  // 없으면 리턴
  if (!command) {
    // eslint-disable-next-line no-useless-return
    return;
  }

  // 있으면 실행
  command.SlashExecute(client, interaction);
}

export default InterAcCommand;
