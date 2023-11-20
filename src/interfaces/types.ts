import { BaseInteraction, CacheType } from 'discord.js';
import ConfigPage from './ISettings.js';

export type Page = (
  interaction: BaseInteraction<CacheType>,
  uuid: string,
) => Promise<ConfigPage>;
