/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as admin from 'firebase-admin';
import { Moment } from 'moment';
import moment = require('moment');
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { getData, getDate, getMonth, initialiseMember, isMember,
  removeBdayMember,
  setData } from './botUtils';
import { ADMINROOM, BDAY, MEMBERROOM, USERS } from './constants';
import { invalidDate, invalidMonth, noBday,
  noParam, noPersonBday, notInGroup } from './text';

export const memberCommands =
  (bot: Telegraf<Context<Update>>,
      database: admin.database.Database): void => {
    /* command: /bday DD/MM/YYYY
     *
     * purpose: Set birthday in DD/MM/YYYY
     */
    bot.command('/bday', async (ctx) => {
      const msg = ctx.message.text;
      const bday = msg.substring(msg.indexOf(' ') + 1);
      // check if messager is member
      const member = await isMember(database, ctx, ctx.from);
      if (member === true) {
        try {
          const bdayMoment: Moment = moment(bday, 'DD/MM/YYYY');
          if (bdayMoment.isValid()) {
            const month: string = getMonth(bdayMoment);
            const date: string = getDate(bdayMoment);
            const messagerId: number = ctx.message.from.id;
            const bdayObj = await getData(database, `${BDAY}${month}/${date}`);
            // add bday to bday list
            if (bdayObj.exists()) {
              const bdayIdArr: number[] = bdayObj.val();
              const newArr: number[] = bdayIdArr.includes(messagerId) ?
                  bdayIdArr : [...bdayIdArr, messagerId];
              setData(database, `${BDAY}${month}/${date}`, newArr);
            } else {
              setData(database, `${BDAY}${month}/${date}`, [messagerId]);
            }
            initialiseMember(messagerId, ctx.message.from, database)
                .then(async () => {
                  await database.ref(USERS + messagerId)
                      .child('birthday').once('value')
                      .then((data) => {
                        const oldBday: string | null = data.val();
                        const oldBdayMoment = moment(oldBday,
                            'DD/MM/YYYY');
                        if (oldBday &&
                            !oldBdayMoment.isSame(bdayMoment)) {
                          Promise.all([
                            removeBdayMember(oldBdayMoment, database,
                                messagerId),
                            database.ref(USERS + messagerId).update({
                              birthday: bdayMoment.format('DD/MM/YYYY'),
                            }),
                          ]);
                        } else {
                          database.ref(USERS + messagerId).update({
                            birthday: bdayMoment.format('DD/MM/YYYY'),
                          });
                        }
                      });
                }).catch((e) => {
                  throw e;
                });
            ctx.reply(
                `You have set birthday to ${bdayMoment.format('DD/MM/YYYY')}`);
          } else if (msg.indexOf(' ') === -1) {
            const userData = await getData(database,
                `${USERS}${ctx.message.from.id}/birthday`);
            if (userData.exists()) {
              ctx.reply(`Current birthday set: ${userData.val()}`);
            } else {
              ctx.replyWithHTML(noBday);
            }
          } else {
            ctx.reply(invalidDate);
          }
        } catch (err) {
          ctx.reply('Error: ' + err);
        }
      } else {
        ctx.reply(notInGroup);
      }
    });

    /* command: /bdaymonth <month>
     *
     * purpose: send other residential issues procedures
     */
    bot.command('/bdaymonth', async (ctx) => {
      const msg = ctx.message.text;
      // check if messager is member
      const member = await isMember(database, ctx, ctx.from);
      if (!member) {
        ctx.reply(notInGroup);
      } else {
        let month: Moment = moment();
        if (msg.indexOf(' ') !== -1) {
          const str = msg.substring(msg.indexOf(' ') + 1);
          month = moment(str, 'MMMM');
        }
        if (month.isValid()) {
          const monthStr = getMonth(month);
          const data = await getData(database, `${BDAY}/${monthStr}`);
          if (data.exists()) {
            const bdayList: {[date: string]: number[] | null} = data.val();
            ctx.reply(`Birthdays for ${monthStr}:`),
            Object.keys(bdayList).forEach(async (date: string) => {
              const idArr = bdayList[date];
              const memberRoom = await getData(database, MEMBERROOM);
              if (idArr && memberRoom.exists()) {
                idArr.forEach(async (id: number) => {
                  const user = (await ctx.telegram
                      .getChatMember(memberRoom.val(), id)).user;
                  ctx.reply(`${date}: @${user.username}\n`);
                });
              } else {
                ctx.reply(noPersonBday + monthStr);
              }
            });
          } else {
            ctx.reply(noPersonBday + monthStr);
          }
        } else {
          ctx.reply(invalidMonth);
        }
      }
    });

    /* command: /anonmsg <message>
     *
     * purpose: Send an anonymous message to the admins
     */
    bot.command('/anonmsg', async (ctx) => {
      const argIndex = ctx.message.text.indexOf(' ');
      const member = await isMember(database, ctx, ctx.from);
      const adminRm = await getData(database, ADMINROOM);
      if (member !== true) {
        ctx.reply(notInGroup);
      } else if (argIndex === -1) {
        ctx.replyWithHTML(noParam);
      } else if (!adminRm.exists()) {
        ctx.reply('No admin room');
      } else if (ctx.chat.type !== 'private') {
        ctx.reply('Please private message me this command!');
      } else {
        initialiseMember(ctx.message.from.id, ctx.message.from, database);
        const msg = ctx.message.text.substring(argIndex).trim();
        const adminRoom: number = adminRm.val();
        const msgWithName = `[Anonymous]: ${msg}`;
        ctx.reply(`Message sent: ${msgWithName}`);
        ctx.telegram.sendMessage(adminRoom.toString(), msgWithName, {
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Reply Anonymously',
                callback_data: `anonmsg${ctx.chat.id}`,
              }],
              [{
                text: 'Reply With Name',
                callback_data: `msg${ctx.chat.id}`,
              }],
            ],
          },
        });
      }
    });
    /* command: /info <username(optional)>
     *
     * purpose: Get information of username
     */
    bot.command('/info', async (ctx) => {
      const msg = ctx.message.text;
      const argIndex = msg.indexOf(' ');
      const member = await isMember(database, ctx, ctx.from);
      if (member !== true) {
        ctx.reply(notInGroup);
      } else if (argIndex === -1) {
        initialiseMember(ctx.message.from.id, ctx.message.from, database);
        const info = await getData(database, `${USERS}/${ctx.from.id}`);
        if (info.exists()) {
          let str = `@${ctx.from.username} information:\n`;
          const infoObj = info.val();
          Object.keys(infoObj).forEach((key) => {
            str = str + `${key}: ${infoObj[key]}\n`;
          });
          ctx.reply(str);
        } else {
          ctx.reply('ERR: info not found :(');
        }
      } else {
        const re = /\ @?([^\/][^\s]*)\b/g;
        const username = msg.split(re)[1];
        const users = await getData(database, USERS);
        let info = '';
        Object.keys(users.val()).forEach((key) => {
          if (users.val()[key].username === username) {
            info = `@${username} information:\n`;
            const i = users.val()[key];
            Object.keys(i).forEach((k) => {
              info = info + `${k}: ${i[k]}\n`;
            });
          }
        });
        if (info.length > 0) {
          ctx.reply(info);
        } else {
          ctx.reply('Invalid user!');
        }
      }
    });
  };
