import { EmbedBuilder } from 'discord.js';

export const color = '#ffb2d8';
export const url =
  'https://camo.githubusercontent.com/50aa07739a9c9ac136e0ffe79c285cbb482bc435f6e387586d11dfe3a34e4698/68747470733a2f2f63646e2e646973636f72646170702e636f6d2f6174746163686d656e74732f3933383734353536363634373730353639302f3936363436393530323639323930303837342f616239616337616436626531616337332e6a706567';

export const embedtemp = new EmbedBuilder()
  .setColor(color)
  .setAuthor({ name: '시덱이', iconURL: url });
