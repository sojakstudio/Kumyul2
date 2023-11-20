import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import * as dotenv from 'dotenv';
import CommandBundle from './commands/CommandBundle.js';
import logger from './utils/logger.js';

dotenv.config();

const commandArray = new Array<SlashCommandBuilder>();

CommandBundle.forEach(value => {
  commandArray.push(value.Builder);
});

logger.info(process.env.NODE_ENV!);

if (
  process.env.NODE_ENV !== 'production'
    ? process.env.TESTTOKEN !== undefined &&
      process.env.TESTCLIENTID !== undefined
    : process.env.TOKEN !== undefined && process.env.CLIENTID !== undefined
) {
  const finalTOKEN =
    process.env.NODE_ENV === 'production'
      ? process.env.TOKEN
      : process.env.TESTTOKEN;
  const finalCLIENTID =
    process.env.NODE_ENV === 'production'
      ? process.env.CLIENTID
      : process.env.TESTCLIENTID;

  logger.info(`TOKEN: ${finalTOKEN}, CLIENTID: ${finalCLIENTID}`);

  const rest = new REST({ version: '10' }).setToken(finalTOKEN!);

  rest
    .put(Routes.applicationCommands(finalCLIENTID!), {
      body: commandArray,
    })
    .then(() =>
      logger.info(
        `Successfully registered application commands. : ${commandArray}`,
      ),
    )
    .catch(err => logger.error(err));
} else {
  logger.error('Env Value undefined');
}
