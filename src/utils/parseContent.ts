import unixTimestamp from './unixTimestamp.js';

export interface Values {
  usertag: string;
  username: string;
  userid: string;
  guildname: string;
  guildid: string;
  membercount: string;
}
export function parseContent(string: string, values: Values) {
  let context = string;

  context = context.replace(/(usertag|\${usertag})/gm, values.usertag);
  context = context.replace(/(username|\${username})/gm, values.username);
  context = context.replace(/(userid|\${userid})/gm, values.userid);
  context = context.replace(/(guildname|\${guildname})/gm, values.guildname);
  context = context.replace(/(guildid|\${guildid})/gm, values.guildid);
  context = context.replace(
    /(membercount|\${membercount})/gm,
    values.membercount,
  );
  context = context.replace(
    /(timestamp_t|\${timestamp_t})/gm,
    `<t:${unixTimestamp()}:t>`,
  );
  context = context.replace(
    /(timestamp|\${timestamp})/gm,
    `<t:${unixTimestamp()}:f>`,
  );
  context = context.replace(
    /(timestamp_T|\${timestamp_T})/gm,
    `<t:${unixTimestamp()}:T>`,
  );
  context = context.replace(
    /(timestamp_d|\${timestamp_d})/gm,
    `<t:${unixTimestamp()}:d>`,
  );
  context = context.replace(
    /(timestamp_D|\${timestamp_D})/gm,
    `<t:${unixTimestamp()}:D>`,
  );
  context = context.replace(
    /(timestamp_f|\${timestamp_f})/gm,
    `<t:${unixTimestamp()}:f>`,
  );
  context = context.replace(
    /(timestamp_F|\${timestamp_F})/gm,
    `<t:${unixTimestamp()}:F>`,
  );
  context = context.replace(
    /(timestamp_F|\${timestamp_R})/gm,
    `<t:${unixTimestamp()}:R>`,
  );

  return context;
}
