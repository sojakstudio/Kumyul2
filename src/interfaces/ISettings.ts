import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  EmbedBuilder,
} from 'discord.js';
import CustomClient from '../core/client.js';
import { Page } from './types.js';

export default interface ConfigPage {
  name: string;
  embed: EmbedBuilder;
  components: ActionRowBuilder<ButtonBuilder>[];
}

export class ConfigWindow {
  name: string;

  execute: (
    interaction: BaseInteraction,
    uuid: string,
    client: CustomClient,
  ) => Promise<Page>;

  constructor(
    name: string,
    execute: (
      interaction: BaseInteraction,
      uuid: string,
      client: CustomClient,
    ) => Promise<Page>,
  ) {
    this.name = name;
    this.execute = execute;
  }
}
