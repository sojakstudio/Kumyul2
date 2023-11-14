import { s, stringEmail } from '@sapphire/shapeshift';
import {
  EmbedBuilder,
  normalizeArray,
  RestOrArray,
  RGBTuple,
  APIEmbedField,
} from 'discord.js';
import { randomUUID } from 'crypto';
import IPage from './IPage.js';
import IParagraph from './IParagraph.js';
import {
  colorPredicate,
  paragraphsArrayPredicate,
  embedFooterPredicate,
  imageURLPredicate,
  timestampPredicate,
  urlPredicate,
  validateFieldLength,
} from './Assertions.js';

export default class PageBuilder {
  data: IPage;
  constructor(assetcode: string) {
    this.data = { assetcode, uuid: randomUUID() };
  }

  /**
   *
   * @param title Length Limit: 256 Characters
   * @returns
   */
  public setTitle(title: string | null): this {
    if (title === null) {
      this.data.title = undefined;
      return this;
    }

    // length predicate
    s.string
      .lengthGreaterThanOrEqual(1)
      .lengthLessThanOrEqual(256)
      .nullable.setValidationEnabled(true)
      .parse(title);

    this.data.title = title;

    return this;
  }

  /**
   *
   * @param description Length Limit: 4096 Characters
   * @returns
   */
  public setDescription(description?: string | null): this {
    if (description === null) {
      this.data.description = undefined;
      return this;
    }

    // length predicate
    s.string
      .lengthGreaterThanOrEqual(1)
      .lengthLessThanOrEqual(4096)
      .nullable.setValidationEnabled(true)
      .parse(description);

    this.data.description = description;

    return this;
  }

  /**
   *
   * @param name Length Limit: 256 Characters
   * @param iconURL Url of icon
   */
  public setAuthor(options: {
    name: string;
    url?: string | undefined;
    iconURL?: string | undefined;
  }): this {
    if (options === null) {
      this.data.author = undefined;
      return this;
    }

    // length predicate
    s.object({
      name: s.string
        .lengthGreaterThanOrEqual(1)
        .lengthLessThanOrEqual(256)
        .nullable.setValidationEnabled(true),
      url: s.string
        .url({
          allowedProtocols: ['http:', 'https:'],
        })
        .nullish.setValidationEnabled(true),
      iconURL: s.string
        .url({
          allowedProtocols: ['http:', 'https:', 'attachment:'],
        })
        .nullish.setValidationEnabled(true),
    })
      .setValidationEnabled(true)
      .parse(options);

    this.data.author = options;

    return this;
  }

  public spliceFields(
    index: number,
    deleteCount: number,
    ...fields: IParagraph[]
  ): this {
    // Ensure adding these fields won't exceed the 25 field limit
    s.number
      .lessThanOrEqual(25)
      .setValidationEnabled(true)
      .parse((this.data.paragraphs?.length ?? 0) + fields.length - deleteCount);

    // Data assertions
    paragraphsArrayPredicate.parse(fields);

    // if paragraph exists
    if (this.data.paragraphs)
      this.data.paragraphs.splice(index, deleteCount, ...fields);
    else this.data.paragraphs = fields;

    return this;
  }

  /**
   *
   * @param paragraphs Variadic Argument or Array of IParagraph
   * @returns
   */
  public setParagraphs(...paragraphs: RestOrArray<IParagraph>): this {
    // make sure that sum of paragraphs does not exceed 25 paragraphs limit
    this.spliceFields(
      0,
      this.data.paragraphs?.length ?? 0,
      ...normalizeArray(paragraphs),
    );
    return this;
  }

  /**
   *
   * @param paragraphs Variadic Argument or Array of IParagraph
   * @returns
   */
  public addParagraphs(...paragraphs: RestOrArray<IParagraph>): this {
    // eslint-disable-next-line no-param-reassign
    paragraphs = normalizeArray(paragraphs);
    // Ensure adding these paragraphs won't exceed the 25 field limit
    validateFieldLength(paragraphs.length, this.data.paragraphs);

    // Data assertions
    paragraphsArrayPredicate.parse(paragraphs);

    if (this.data.paragraphs) this.data.paragraphs.push(...paragraphs);
    else this.data.paragraphs = paragraphs;
    return this;
  }

  /**
   *
   * @param color Accepts RGBTuple / Hex Code
   * @returns
   */
  public setColor(color: RGBTuple | number | null): this {
    // Data assertions
    colorPredicate.parse(color);

    if (Array.isArray(color)) {
      const [red, green, blue] = color;
      // eslint-disable-next-line no-bitwise
      this.data.color = (red << 16) + (green << 8) + blue;
      return this;
    }

    this.data.color = color ?? undefined;
    return this;
  }

  /**
   *
   * @param options Format: {text: string, iconURL(optional): string}
   * @returns
   */
  public setFooter(options: { text: string; iconURL?: string } | null): this {
    if (options === null) {
      this.data.footer = undefined;
      return this;
    }

    // Data assertions
    embedFooterPredicate.parse(options);

    this.data.footer = { text: options.text, icon_url: options.iconURL };
    return this;
  }

  public setImage(url: string | null): this {
    // Data assertions
    imageURLPredicate.parse(url);

    this.data.image = url ?? undefined;
    return this;
  }

  public setThumbnail(url: string | null): this {
    // Data assertions
    imageURLPredicate.parse(url);

    this.data.thumbnail = url ?? undefined;
    return this;
  }

  public setTimestamp(timestamp: Date | number | null = Date.now()): this {
    // Data assertions
    timestampPredicate.parse(timestamp);

    this.data.timestamp = timestamp ? new Date(timestamp) : undefined;
    return this;
  }

  public setURL(url: string | null): this {
    // Data assertions
    urlPredicate.parse(url);

    this.data.url = url ?? undefined;
    return this;
  }

  public toEmbed(): EmbedBuilder {
    // Array<IParagraph> -> Array<APIEmbedField>
    const fields = new Array<APIEmbedField>();

    this.data.paragraphs?.forEach(e => {
      fields.push({ name: e.title, value: e.content, inline: e.inline });
    });

    // embed construction
    const embed = new EmbedBuilder()
      .setTitle(this.data.title ?? null)
      .setDescription(this.data.description ?? null)
      .setAuthor(this.data.author ?? null)
      .setColor(this.data.color ?? null)
      .setFooter(this.data.footer ?? null)
      .setImage(this.data.image ?? null)
      .setThumbnail(this.data.thumbnail ?? null)
      .setURL(this.data.url ?? null)
      .setTimestamp(this.data.timestamp)
      .setFields(fields);

    return embed;
  }
}
