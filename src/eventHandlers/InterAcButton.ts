import {
  ButtonInteraction,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} from 'discord.js';
import { url } from '../config/EmbedConfig.js';
import { AnnounceModel } from '../Database/AnnounceSchema.js';
import { VoteModel } from '../Database/VoteSchema.js';
import logger from '../utils/logger.js';

async function InterAcButton(interaction: ButtonInteraction) {
  if (
    !interaction.customId.startsWith('cdvo.') &&
    !interaction.customId.startsWith('cdanunce.')
  )
    return;

  const prefix = interaction.customId.split('.')[0];

  if (prefix === 'cdvo.') {
    const [id, type] = interaction.customId.substring(5).split('_');

    // db 조회
    const res = await VoteModel.findOne({ id });

    if (!res) return;

    // value
    let embed: EmbedBuilder;

    const buttons = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`cdvo.${id}_agree`)
        .setLabel('👍')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`cdvo.${id}_disagree`)
        .setLabel('👎')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`cdvo.${id}_lock`)
        .setLabel('🔒')
        .setStyle(ButtonStyle.Secondary),
    );

    // 락 버튼
    if (type === 'lock') {
      // 유저 체크
      if (
        res.maker !== interaction.user.id &&
        !(interaction.member?.permissions as PermissionsBitField)
          .toArray()
          .includes('Administrator') &&
        !(interaction.member?.permissions as PermissionsBitField)
          .toArray()
          .includes('ManageGuild')
      ) {
        interaction.reply({
          content: '투표의 생성자 혹은 서버 관리자만 투표를 종료할 수 있어요!',
          ephemeral: true,
        });

        return;
      }

      // 투표 데이터베이스에서 삭제
      await VoteModel.deleteOne({ id });

      // 임베드 생성
      embed = new EmbedBuilder()
        .setColor('#5f7b9b')
        .setAuthor({ name: '시덱이', iconURL: url })
        .setTitle(`[종료됨] ${res.topic}`)
        .setDescription(res.description || '새 투표에요!')
        .addFields(
          { name: '찬성', value: `${res.agree}`, inline: true },
          { name: '반대', value: `${res.disagree}`, inline: true },
        )
        .setFooter({
          text: `${res.makername}님이 시작했어요!`,
        });

      // 메세지 쌔벼오기
      await interaction.channel?.messages.fetch(res.msgid).then(async msg => {
        // 메세지 믿장빼기
        await msg.edit({ embeds: [embed], components: [] });

        // 대답하기
        await interaction.reply({
          content: '성공적으로 투표를 반영했어요!',
          ephemeral: true,
        });
      });

      return;
    }

    // #region 이미 투표했는지 확인
    if (res.uservoted.has(interaction.user.id)) {
      const voted = res.uservoted.get(interaction.user.id);

      // agree 눌렀을 경우
      if (voted) res.agree -= 1;
      // disagree 경우
      if (!voted) res.disagree -= 1;
    }

    // #endregion

    // #region 값 변화시키기
    if (type === 'agree') {
      res.agree += 1;

      res.uservoted.set(interaction.user.id, true);
    }
    if (type === 'disagree') {
      res.disagree += 1;

      res.uservoted.set(interaction.user.id, false);
    }

    const color = res.agree >= res.disagree ? '#4caf50' : '#ed2939';

    embed = new EmbedBuilder()
      .setColor(color)
      .setAuthor({ name: '시덱이', iconURL: url })
      .setTitle(res.topic)
      .setDescription(res.description || '새 투표에요!')
      .addFields(
        { name: '찬성', value: `${res.agree}`, inline: true },
        { name: '반대', value: `${res.disagree}`, inline: true },
      )
      .setFooter({
        text: `${res.makername}님이 시작했어요!`,
      });

    // #endregion

    await interaction.channel?.messages.fetch(res.msgid).then(async msg => {
      const editedmsg = await msg.edit({
        embeds: [embed],
        components: [buttons],
      });

      res.msgid = editedmsg.id;

      await res.save();

      await interaction.reply({
        content: '성공적으로 투표를 반영했어요!',
        ephemeral: true,
      });
    });
  } else if (prefix === 'cdanunce.') {
    const [id, type] = interaction.customId.substring(5).split('_');

    // db 조회
    const res = await AnnounceModel.findOne({ id });

    if (!res) return;

    // check if already marked as read
    if (res.userread.includes(interaction.user.id)) {
      interaction.reply({
        content: 'Already marked as read!',
        ephemeral: true,
      });
    } else {
      res.userread.push(interaction.user.id);
      res.read++;
    }

    // fetch message and edit / push db
  }
}

export default InterAcButton;
