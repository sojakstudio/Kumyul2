import { ChannelType, BaseInteraction, Message, CacheType } from 'discord.js';
import CustomClient from '../../core/client.js';
import { GuildModel } from '../../Database/GuildSchema.js';
import { ConfigWindow } from '../../interfaces/ISettings.js';
import { Page } from '../../interfaces/types.js';
import { AnnouncePage } from './index.js';

const AnnounceChConfig = new ConfigWindow(
  'announcechconfig',
  (
    interaction: BaseInteraction<CacheType>,
    uuid: string,
    client: CustomClient,
  ) =>
    new Promise<Page>(async (resolve, reject) => {
      const parentPage = AnnouncePage;

      const filter = (msg: Message) => msg.author.id === interaction.user.id;

      const collector = interaction.channel?.createMessageCollector({
        filter,
        time: 60000,
      });

      const infoMsg = await interaction.channel?.send(
        "> Please mention the channel you want to set as the server's announcement channel in 60 seconds. To cancel, type >cancel on this channel.",
      );

      // detect idle time
      let sec = 0;
      const idleInterval = setInterval(async () => {
        sec++;
        // if idle timer over idleTime limit
        if (sec >= 60) {
          collector?.stop();

          // delete final reply msg
          if (infoMsg) await infoMsg.delete();

          await interaction.channel?.send(
            '> No input received during 60 seconds. Returning to the setting page.',
          );

          clearInterval(idleInterval);

          resolve(parentPage);
        }
      }, 1000);

      collector!.on('collect', async (msg: Message) => {
        if (msg.content === '>cancel') {
          // delete message
          if (infoMsg) await infoMsg.delete();

          // stop collector
          collector?.stop();

          // return parentPage
          resolve(parentPage);
        } else if (msg.content.startsWith('<#')) {
          const channelId = msg.content.substring(2, msg.content.length - 1);

          const channel = await msg.guild?.channels.fetch(channelId);

          if (!channel) msg.channel.send('Invalid channel! Please try again.');
          else if (
            !(
              channel?.type === ChannelType.GuildText ||
              channel?.type === ChannelType.GuildAnnouncement
            )
          )
            msg.channel.send("Please mention your guild's text channel!");
          else {
            await GuildModel.updateOne(
              { id: msg.guild!.id },
              { sysnoticechannel: channelId },
            );

            if (infoMsg) await infoMsg.delete();

            await msg.channel.send(
              `> Server's announcement channel is successfully changed into <#${channel.id}>`,
            );

            collector?.stop();

            // return parent page
            resolve(parentPage);
          }
        } else {
          msg.channel.send('Wrong Input!');
        }
      });
    }),
);

export default AnnounceChConfig;
