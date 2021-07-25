import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Telegraf } from 'telegraf';
import { User } from 'telegraf/typings/core/types/typegram';
import * as moment from 'moment';

import { adminCommands } from './admin';
import {
  getData,
  getDate,
  getMonth,
  initialiseMember,
  isMember,
  log,
  removeMember,
} from './botUtils';
import { memberCommands } from './member';
import { afternoonTemperature,
  greeting, morningTemperature, notInGroup } from './text';
import { publicCommands } from './public';
import { callbackQuery } from './callbackQuery';
import { AMREMINDER, PMREMINDER } from './constants';
admin.initializeApp();

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

const { key, region, project, password } = functions.config().telegrambot;

const bot = new Telegraf(key, {
  telegram: { webhookReply: true },
});

const externalHost = 'https://selfish-octopus-75.loca.lt'; // Must be HTTPS

const url = process.env.FUNCTIONS_EMULATOR === 'true' ?
  // change to own external localhost website (e.g. using ngrok)
  `${externalHost}/${project}/${region}/bot` :
  `https://${region}-${project}.cloudfunctions.net/bot`;

bot.telegram.setWebhook(
    url
).catch((err) => {
  functions.logger.error('[Bot] Error', err);
});

/* -- Error Handling -- */
bot.catch((err, ctx) => {
  functions.logger.error('[Bot] Error', err);
  log(ctx, admin.database(),
      `Ooops, encountered an error for ${ctx.updateType}, ${err}`);
  ctx.reply(`Ooops, encountered an error for ${ctx.updateType}, ${err}`);
});

/* -- Admin Commands -- */

adminCommands(bot, password, admin.database());

/* -- Member Commands --*/
memberCommands(bot, admin.database());

/* -- Public Commands --*/
publicCommands(bot, admin.database());

/* -- Callback Queries --*/
callbackQuery(bot, admin.database());

// initialize the commands
bot.command('/start', async (ctx) => {
  const member = await isMember(admin.database(), ctx, ctx.from);
  if (member === true) {
    initialiseMember(ctx.message.from.id, ctx.message.from, admin.database())
        .then(() => ctx.reply(greeting()));
  } else {
    ctx.reply(greeting() + notInGroup);
  }
  log(ctx, admin.database(), ctx.message.text);
});

// when chat member joins
bot.on('new_chat_members', (ctx) => {
  ctx.message.new_chat_members.forEach(async (user: User) => {
    await isMember(admin.database(), ctx, user).then(((isMember: boolean) => {
      if (isMember) {
        initialiseMember(user.id, user, admin.database());
      }
    }));
    log(ctx, admin.database(), `New member joined: ${user.username}`);
  });
});

// when chat member leaves
bot.on('left_chat_member', async (ctx) => {
  const user: User = ctx.message.left_chat_member;
  removeMember(user.id, admin.database(), ctx);
  log(ctx, admin.database(), `Member left: ${user.username}`);
});

// default response
bot.on('text', (ctx) => {
  // private message commands
  if (ctx.chat.type === 'private') {
    ctx.reply('WAAAH WRONG COMMANDzzzzz');
    log(ctx, admin.database(), ctx.message.text);
  }

  // im dad joke
  const im = /\b[I,i]'?\s*a?m\s*([^\s]+)\b/;
  const msg = ctx.message.text;
  const arr = msg.match(im);
  if (arr !== null) {
    const rand = Math.random();
    if (rand < 0.02) {
      ctx.reply(`Hi ${arr[1].trim()}, I'm RED PANDA! WAAAAA`);
    }
  }
});

exports.bot = functions
    .region(region)
    .https.onRequest(async (req, res) => {
      functions.logger.log('Incoming message', req.body);
      try {
        await bot.handleUpdate(req.body, res);
      } finally {
        res.status(200).end();
      }
    });

exports.scheduledMorning = functions
    .region(region)
    .pubsub
    .schedule('0 9 * * *')
    .timeZone('Asia/Singapore')
    .onRun(async () => {
      // Birthday
      const month = getMonth(moment());
      const date = getDate(moment());
      const idArrTest = await admin.database().ref('bday/' + month)
          .child(date).once('value');
      const memberChatId = await admin.database().ref('admin')
          .child('memberRoom').once('value');
      if (idArrTest.exists() && memberChatId.exists()) {
        const idArr: number[] = idArrTest.val();
        const nameArr = idArr.map(async (id: number) => {
          const user: User = (await bot.telegram
              .getChatMember(memberChatId.val(), id)).user;
          initialiseMember(user.id, user, admin.database());
          return user.username ? `@${user.username}` : null;
        });
        Promise.all(nameArr).then((arr: (string | null)[]) => {
          const newArr = arr.filter((x) => x);
          bot.telegram.sendMessage(memberChatId.val(),
              `Happy birthday ${newArr.join(' and ')}!`);
        });
      }

      // AM Reminder
      const amReminder = await getData(admin.database(), AMREMINDER);
      if (amReminder.exists()) {
        const arr: number[] = amReminder.val();
        arr.forEach((id: number) => {
          bot.telegram.sendMessage(id, morningTemperature);
        });
      }
    });

exports.scheduledAfternoon = functions
    .region(region)
    .pubsub
    .schedule('0 13 * * *')
    .timeZone('Asia/Singapore')
    .onRun(async () => {
      const pmReminder = await getData(admin.database(), PMREMINDER);
      if (pmReminder.exists()) {
        const arr: number[] = pmReminder.val();
        arr.forEach((id: number) => {
          bot.telegram.sendMessage(id, afternoonTemperature);
        });
      }
    });
