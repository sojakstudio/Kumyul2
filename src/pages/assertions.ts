import { s } from '@sapphire/shapeshift';
import { ActionRowBuilder } from 'discord.js';
import IParagraph from '../interfaces/IParagraph';

// from https://github.com/discordjs/discord.js/blob/main/packages/builders/src/messages/embed/Assertions.ts

export const paragraphTitlePredicate = s.string
  .lengthGreaterThanOrEqual(1)
  .lengthLessThanOrEqual(256)
  .setValidationEnabled(true);

export const paragraphContentPredicate = s.string
  .lengthGreaterThanOrEqual(1)
  .lengthLessThanOrEqual(1_024)
  .setValidationEnabled(true);

export const paragraphInlinePredicate = s.boolean.optional;

export const paragraphsPredicate = s
  .object({
    title: paragraphTitlePredicate,
    content: paragraphContentPredicate,
    inline: paragraphInlinePredicate,
  })
  .setValidationEnabled(true);

export const paragraphsArrayPredicate =
  paragraphsPredicate.array.setValidationEnabled(true);

export const authorNamePredicate =
  paragraphTitlePredicate.nullable.setValidationEnabled(true);

export const imageURLPredicate = s.string
  .url({
    allowedProtocols: ['http:', 'https:', 'attachment:'],
  })
  .nullish.setValidationEnabled(true);

export const urlPredicate = s.string
  .url({
    allowedProtocols: ['http:', 'https:'],
  })
  .nullish.setValidationEnabled(true);

export const embedAuthorPredicate = s
  .object({
    name: authorNamePredicate,
    iconURL: imageURLPredicate,
    url: urlPredicate,
  })
  .setValidationEnabled(true);

export const RGBPredicate = s.number.int
  .greaterThanOrEqual(0)
  .lessThanOrEqual(255)
  .setValidationEnabled(true);
export const colorPredicate = s.number.int
  .greaterThanOrEqual(0)
  .lessThanOrEqual(0xffffff)
  .or(s.tuple([RGBPredicate, RGBPredicate, RGBPredicate]))
  .nullable.setValidationEnabled(true);

export const fieldLengthPredicate = s.number
  .lessThanOrEqual(25)
  .setValidationEnabled(true);

export function validateFieldLength(
  amountAdding: number,
  fields?: IParagraph[],
): void {
  fieldLengthPredicate.parse((fields?.length ?? 0) + amountAdding);
}

export const ActionRowLengthPredicate = s.number
  .lessThanOrEqual(5)
  .setValidationEnabled(true);

export function validateActionRowLength(
  amountAdding: number,
  actionRows?: ActionRowBuilder[],
): void {
  fieldLengthPredicate.parse((actionRows?.length ?? 0) + amountAdding);
}

export const buttonQuantityPredicate = s.number
  .lessThanOrEqual(5)
  .setValidationEnabled(true);

export const descriptionPredicate = s.string
  .lengthGreaterThanOrEqual(1)
  .lengthLessThanOrEqual(4_096)
  .nullable.setValidationEnabled(true);

export const footerTextPredicate = s.string
  .lengthGreaterThanOrEqual(1)
  .lengthLessThanOrEqual(2_048)
  .nullable.setValidationEnabled(true);

export const embedFooterPredicate = s
  .object({
    text: footerTextPredicate,
    iconURL: imageURLPredicate,
  })
  .setValidationEnabled(true);

export const timestampPredicate = s
  .union(s.number, s.date)
  .nullable.setValidationEnabled(true);

export const titlePredicate =
  paragraphTitlePredicate.nullable.setValidationEnabled(true);
