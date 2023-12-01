import typegoose from '@typegoose/typegoose';

const { prop, getModelForClass } = typegoose;

export class AnnounceClass {
  @prop({ required: true })
  id!: string;

  @prop({ required: true })
  title!: string;

  @prop()
  content!: string;

  @prop({ required: true })
  msgid!: string;

  @prop({ required: true })
  guild!: string;

  @prop({ required: true })
  channel!: string;

  @prop({ required: true, default: 0 })
  read!: number;

  // true => read
  // false => not read
  @prop({ required: true })
  userread!: Array<string>;

  // 투표 생성자 ID
  @prop({ required: true })
  maker!: string;

  @prop({ required: true })
  makername!: string;
}

export const AnnounceModel = getModelForClass(AnnounceClass);
