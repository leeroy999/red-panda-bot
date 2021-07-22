/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as admin from 'firebase-admin';
import { Context, Telegraf } from 'telegraf';
import {
  ChatMember,
  Update,
} from 'telegraf/typings/core/types/typegram';
import { getData, initialiseMember, isAdmin, log, setData } from './botUtils';
import { ADMIN, ADMINLIST, MEMBERROOM, SUPERADMINLIST } from './constants';
import { noParam, noReply } from './text';

export const adminCommands =
  (bot: Telegraf<Context<Update>>,
      password: string,
      database: admin.database.Database): void => {
    /* command: /superAdmin <Password>
     *
     * purpose: Set messager as superAdmin.
     */
    bot.command('/superAdmin', async (ctx) => {
      const msg = ctx.message.text;
      const pass = msg.substring(msg.indexOf(' ') + 1);
      if (pass === password) {
        initialiseMember(ctx.from.id, ctx.from, database);
        await database.ref('admin').once('value').then((dataFromDb) => {
          if (!dataFromDb.exists()) {
            database.ref('admin').child('superAdminList')
                .set([ctx.message.from.id]);
          } else {
            const adminArr: number[] = dataFromDb.child('superAdminList').val();
            if (!adminArr.includes(ctx.message.from.id)) {
              adminArr.push(ctx.message.from.id);
            }
            database.ref('admin').child('superAdminList')
                .update(adminArr);
          }
          ctx.reply('You are now a superadmin.');
        });
      } else {
        ctx.reply('Wrong password.');
      }
    });

    /* command: /setAdminRoom
     *
     * purpose: Set current chat as admin chat, and initialise all admins
     * as admins
     */
    bot.command('/setAdminRoom', async (ctx) => {
      await database.ref('admin').once('value').then(async (admin) => {
        const superAdminArr: number[] | null = admin.child('superAdminList')
            .val();
        const messager: number = ctx.message.from.id;
        if (superAdminArr && superAdminArr.includes(messager)) {
          const chatId: number = ctx.chat.id;
          database.ref('admin').update({ adminRoom: chatId });
          await ctx.getChatAdministrators().then((admins: ChatMember[]) => {
            const adminArr: number[] = [];
            admins.forEach((admin: ChatMember) => {
              adminArr.push(admin.user.id);
              initialiseMember(admin.user.id, admin.user, database);
            });
            database.ref(ADMINLIST).set(adminArr);
          });
          ctx.reply('Set this chat as admin chat.');
        } else {
          ctx.reply('ERROR: Not a superadmin!');
        }
      });
      log(ctx, database, ctx.message.text);
    });

    /* command: /setMemberRoom
     *
     * purpose: Set current chat as member chat
     */
    bot.command('/setMemberRoom', async (ctx) => {
      await database.ref('admin').once('value').then((admin) => {
        const superAdminArr: number[] | null = admin.child('superAdminList')
            .val();
        const messager: number = ctx.message.from.id;
        if (superAdminArr && superAdminArr.includes(messager)) {
          const chatId: number = ctx.chat.id;
          database.ref('admin').update({ memberRoom: chatId });
          ctx.reply('Set this chat as member chat.');
        } else {
          ctx.reply('ERROR: Not a superadmin!');
        }
      });
      log(ctx, database, ctx.message.text);
    });

    /* command: /setLogRoom
     *
     * purpose: Set current chat as log chat
     */
    bot.command('/setLogRoom', async (ctx) => {
      await database.ref('admin').once('value').then((admin) => {
        const superAdminArr: number[] | null = admin.child('superAdminList')
            .val();
        const messager: number = ctx.message.from.id;
        if (superAdminArr && superAdminArr.includes(messager)) {
          const chatId: number = ctx.chat.id;
          database.ref('admin').update({ logRoom: chatId });
          ctx.reply('Set this chat as log chat.');
        } else {
          ctx.reply('ERROR: Not a superadmin!');
        }
        log(ctx, database, ctx.message.text);
      });
    });

    /* command: /send <chatId> <message>
     *
     * purpose: Send message to specific chat ID
     */
    bot.command('/send', async (ctx) => {
      const superAdmin = await getData(database, SUPERADMINLIST);
      if (superAdmin.exists() &&
        superAdmin.val().includes(ctx.message.from.id)) {
        const msg = ctx.message.text;
        const firstSpace = msg.indexOf(' ');
        const secondSpace = msg.indexOf(' ', firstSpace + 1);
        const chatId = parseInt(msg.substring(firstSpace + 1, secondSpace));
        if (firstSpace !== -1 && secondSpace !== -1 && !isNaN(chatId)) {
          const message = msg.substring(secondSpace + 1);
          ctx.telegram.sendMessage(chatId, message);
        }
      } else {
        ctx.reply('ERROR: Not a superadmin!');
      }
      log(ctx, database, ctx.message.text);
    });

    /* command: /m <message>
     *
     * purpose: Send message to member chat
     */
    bot.command('/m', async (ctx) => {
      const admin = await isAdmin(database, ctx, ctx.from);
      if (admin === true) {
        const memberChat = await getData(database, MEMBERROOM);
        const msg = ctx.message.text;
        const message = msg.substring(msg.indexOf(' ') + 1);
        if (memberChat.exists() && msg.indexOf(' ') !== -1) {
          const memberChatId: number = memberChat.val();
          ctx.telegram.sendMessage(memberChatId, message);
        }
      } else {
        ctx.reply('ERROR: Not an admin!');
      }
      log(ctx, database, ctx.message.text);
    });

    /* command: /reply <message>
     *
     * purpose: Reply member with message
     */
    bot.command('/reply', async (ctx) => {
      const admin = await isAdmin(database, ctx, ctx.from);
      if (admin === true) {
        const path = `${ADMIN}/${ctx.from.id}/reply`;
        const data = await getData(database, path);
        if (data.exists()) {
          const argIndex = ctx.message.text.indexOf(' ');
          if (argIndex !== -1) {
            const chatId = data.val()[0];
            const isAnon = data.val()[1] === 'anon';
            const msg = ctx.message.text.substring(argIndex);
            const name = `${isAnon ? 'Red Panda' : `${ctx.from.username}`}`;
            ctx.telegram.sendMessage(chatId, `[${name}] ${msg}`).then(() => {
              ctx.reply(`Message sent: [${name}] ${msg}`);
              setData(database, path, null);
            });
          } else {
            ctx.replyWithHTML(noParam);
          }
        } else {
          ctx.reply(noReply);
        }
      } else {
        ctx.reply('NOT ADMIN!');
      }
      log(ctx, database, ctx.message.text);
    });
    /* command: /cancel
     *
     * purpose: Cancel reply to anonymouse message
     */
    bot.command('/cancel', async (ctx) => {
      const admin = await isAdmin(database, ctx, ctx.from);
      if (admin === true) {
        const path = `${ADMIN}/${ctx.from.id}/reply`;
        setData(database, path, null);
        ctx.reply(`@${ctx.from.username} reply cancelled!`);
      } else {
        ctx.reply('NOT ADMIN');
      }
    });
  };
