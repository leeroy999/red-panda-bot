/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as admin from 'firebase-admin';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { getData, setData } from './botUtils';
import {
  ADMIN,
  AFTERNOONREMINDER,
  AMREMINDER,
  MORNINGREMINDER,
  PMREMINDER,
  REMOVEREMINDER,
} from './constants';
import { nextReply, replying } from './text';


export const callbackQuery =
  (bot: Telegraf<Context<Update>>,
      database: admin.database.Database): void => {
    bot.action(MORNINGREMINDER, async (ctx) => {
      const amReminder = await getData(database, AMREMINDER);
      if (amReminder.exists()) {
        const arr: number[] = amReminder.val();
        if (ctx.chat && !arr.includes(ctx.chat.id)) {
          arr.push(ctx.chat.id);
        }
        setData(database, AMREMINDER, arr);
      } else {
        ctx.chat && setData(database, AMREMINDER, [ctx.chat.id]);
      }
      ctx.answerCbQuery();
      ctx.reply('Set reminder to 9 AM!');
    });

    bot.action(AFTERNOONREMINDER, async (ctx) => {
      const pmReminder = await getData(database, PMREMINDER);
      if (pmReminder.exists()) {
        const arr: number[] = pmReminder.val();
        if (ctx.chat && !arr.includes(ctx.chat.id)) {
          arr.push(ctx.chat.id);
        }
        setData(database, PMREMINDER, arr);
      } else {
        ctx.chat && setData(database, PMREMINDER, [ctx.chat.id]);
      }
      ctx.answerCbQuery();
      ctx.reply('Set reminder to 1 PM!');
    });

    bot.action(REMOVEREMINDER, async (ctx) => {
      const amReminder = await getData(database, AMREMINDER);
      const pmReminder = await getData(database, PMREMINDER);
      if (amReminder.exists()) {
        let arr: number[] = amReminder.val();
        if (ctx.chat !== undefined) {
          const num = ctx.chat.id;
          arr = arr.filter((id) => id !== num);
        }
        setData(database, AMREMINDER, arr);
      }
      if (pmReminder.exists()) {
        let arr: number[] = pmReminder.val();
        if (ctx.chat !== undefined) {
          const num = ctx.chat.id;
          arr = arr.filter((id) => id !== num);
        }
        setData(database, PMREMINDER, arr);
      }
      ctx.answerCbQuery();
      ctx.reply('Removed all reminders!');
    });

    const regAnon = /\banonmsg(.+)\b/;
    const regMsg = /\bmsg(.+)\b/;
    bot.action(regAnon, async (ctx) => {
      const id = ctx.update.callback_query.data.match(regAnon);
      if (id !== null && ctx.from) {
        const path = `${ADMIN}/${ctx.from.id}/reply`;
        const reply = await getData(database, path);
        if (!reply.exists()) {
          setData(database, path, [id[1], 'anon']);
          ctx.replyWithHTML(`@${ctx.from.username} ${nextReply}`);
        } else {
          ctx.reply(replying);
        }
      }
      ctx.answerCbQuery();
    });
    bot.action(regMsg, async (ctx) => {
      const id = ctx.update.callback_query.data.match(regMsg);
      if (id !== null && ctx.from) {
        const path = `${ADMIN}/${ctx.from.id}/reply`;
        const reply = await getData(database, path);
        if (!reply.exists()) {
          setData(database, path, [id[1], 'msg']);
          ctx.replyWithHTML(`@${ctx.from.username} ${nextReply}`);
        } else {
          ctx.reply(replying);
        }
      }
      ctx.answerCbQuery();
    });
    const regJoke = /\bjoke(.+)\b/;
    bot.action(regJoke, async (ctx) => {
      const punch = ctx.update.callback_query.data.match(regJoke);
      if (punch !== null) {
        ctx.editMessageReplyMarkup({
          inline_keyboard: [
            [{
              text: `Answer: ${punch[1]}`,
              url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            }],
          ],
        });
      }
      ctx.answerCbQuery();
    });
  };
