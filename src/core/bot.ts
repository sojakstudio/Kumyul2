import {
  ActivityOptions,
  ActivityType,
  Events,
  Guild,
  GuildMember,
  Interaction,
  Message,
  PartialGuildMember,
} from 'discord.js';
import { inspect } from 'util';
import {
  guildCreate,
  guildMemberAdd,
  guildMemberRemove,
  interactionCreate,
  messageCreate,
} from '../eventHandlers/index.js';
import CustomClient from './client.js';
import { IConfig } from '../interfaces/index.js';
import mongoConnect from '../Database/DBManager.js';

export default class Bot {
  private ready = true;

  constructor(
    private config: IConfig,
    private client: CustomClient,
    private isDev: boolean,
  ) {
    this.config = config;
    this.client = client;
    this.isDev = isDev;
  }

  /**
   * Bot Starting Function
   */
  public async start(): Promise<void> {
    this.registerEvents();

    // login with test token if testmode is enabled
    await this.login(
      this.config.client.testmode?.enabled === true &&
        this.config.client.testmode?.token
        ? this.config.client.testmode.token
        : this.config.client.token,
    );

    // connect to mongoDB
    await mongoConnect(this.config);
  }

  /**
   * Register Events
   */
  private async registerEvents(): Promise<void> {
    this.client.on(Events.ClientReady, () => this.onReady());
    this.client.on(Events.MessageCreate, (message: Message) => {
      this.onMessageCreate(message);
    });
    this.client.on(Events.InteractionCreate, (interaction: Interaction) => {
      this.onInteraction(interaction);
    });
    this.client.on(Events.GuildCreate, (guild: Guild) =>
      this.onGuildCreate(guild),
    );
    this.client.on(Events.GuildMemberAdd, (member: GuildMember) => {
      this.onGuildMemberAdd(member);
    });
    this.client.on(
      Events.GuildMemberRemove,
      (member: GuildMember | PartialGuildMember) => {
        this.onGuildMemberDelete(member);
      },
    );
  }

  /**
   * Log bot in to discord
   * @param token Discord app token
   */
  private async login(token: string): Promise<void> {
    try {
      await this.client.login(token);
    } catch (e) {
      this.client
        .getLogger()
        .error(
          `An Error Occured while the client was logging in. ${inspect(
            e,
            true,
            5,
            true,
          )}`,
        );
    }
  }

  /**
   * on Client Ready Event
   */
  private async onReady(): Promise<void> {
    this.client
      .getLogger()
      .info(`\n${this.client.user?.tag} (검열봇 시덱이) 이 준비되었습니다!`);

    this.client
      .getLogger()
      .info(`현재 연결된 클라이언트의 핑은 ${this.client.ws.ping}ms 입니다.`);

    // 5 sec interval of activity renewal
    setInterval(() => {
      // activity list
      const activitylist: ActivityOptions[] = [
        { name: '/도움말 | Sojak Studio!', type: ActivityType.Playing },
        { name: '/도움말 | 관리봇 시덱이!', type: ActivityType.Listening },
        {
          name: `${this.client.guilds.cache.size}개의 서버와 함께`,
          type: ActivityType.Playing,
        },
        {
          name: `${this.client.guilds.cache.reduce(
            (a, g) => a + g.memberCount,
            0,
          )}명과 함께`,
          type: ActivityType.Playing,
        },
      ];

      // pick one activity from the list
      const activitiy: ActivityOptions =
        activitylist[Math.floor(Math.random() * activitylist.length)];

      // renew the activity
      this.client.setActivity(activitiy);
    }, 5000);
  }

  /**
   * on Message Create Event
   */
  private async onMessageCreate(msg: Message): Promise<void> {
    messageCreate(this.client, msg);
  }

  /**
   * on Interaction Received Event
   * @param interaction Interaction object
   */
  private async onInteraction(interaction: Interaction): Promise<void> {
    interactionCreate(this.client, interaction);
  }

  /**
   * on Guild Create Event
   * @param guild Guild object
   */
  private async onGuildCreate(guild: Guild): Promise<void> {
    guildCreate(guild);
  }

  /**
   * on Guild Member Add Event
   * @param member Added Guild Member object
   */
  private async onGuildMemberAdd(member: GuildMember): Promise<void> {
    guildMemberAdd(member);
  }

  /**
   * on Guild Member Delete Event
   * @param member Deleted Guild Member object
   */
  private async onGuildMemberDelete(
    member: GuildMember | PartialGuildMember,
  ): Promise<void> {
    guildMemberRemove(member);
  }
}
