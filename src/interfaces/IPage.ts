import { ActionRowBuilder, APIEmbedFooter, BaseInteraction } from 'discord.js';
import ConfigPage from './ISettings.js';
import IParagraph from './IParagraph.js';

export default interface IPage {
  /**
   * UUID is defined automatically, used for components collector
   */
  uuid: string;
  /**
   * Assetcode is to reference pages
   */
  assetcode: string;
  title?: string;
  description?: string;
  author?: { name: string; url?: string; iconurl?: string };
  paragraphs?: IParagraph[];
  color?: number;
  footer?: APIEmbedFooter;
  image?: string; // url
  thumbnail?: string; // url
  timestamp?: Date;
  url?: string;
  actionRows?: ActionRowBuilder[];
}

/**
 * example: class ExamplePage extends Page {
 *  name: "example",
 *  execute: (interaction: BaseInteraction, uuid: string): Promise<ConfigPage> => {
 *  // code
 * };
 * }
 */
export abstract class Page {
  abstract pageName: string;

  abstract execute(
    interaction: BaseInteraction,
    uuid: string,
  ): Promise<ConfigPage>;
}
