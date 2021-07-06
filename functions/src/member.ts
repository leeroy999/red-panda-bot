/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as admin from 'firebase-admin';
import {Moment} from 'moment';
import moment = require('moment');
import {Context, Telegraf} from 'telegraf';
import {Update} from 'telegraf/typings/core/types/typegram';
import {getDate, getMonth, initialiseMember, isMember} from './botUtils';

export const memberCommands =
  (bot: Telegraf<Context<Update>>,
      database: admin.database.Database): void => {
    /* command: /bday <DD/MM/YYYY>
     *
     * purpose: Set birthday in DD/MM/YYYY
     */
    bot.command('/bday', async (ctx) => {
      const msg = ctx.message.text;
      const bday = msg.substring(msg.indexOf(' ') + 1);
      const messagerId: number = ctx.message.from.id;
      const chatId: number | null = (await database.ref('admin')
          .child('memberRoom').once('value')).val();
      const status = !!chatId && await ctx.telegram
          .getChatMember(chatId.toString(), messagerId);
      // check if messager is member
      if (status && isMember(status)) {
        try {
          const bdayMoment: Moment = moment(bday, 'DD/MM/YYYY');
          if (bdayMoment.isValid()) {
            const month: string = getMonth(bdayMoment);
            const date: string = getDate(bdayMoment);
            const messagerId: number = ctx.message.from.id;
            const bdayObj = await database.ref('bday/' + month)
                .child(date).once('value');
            // add bday to bday list
            if (bdayObj.exists()) {
              const bdayIdArr: number[] = bdayObj.val();
              const newArr: number[] = bdayIdArr.includes(messagerId) ?
                  bdayIdArr : [...bdayIdArr, messagerId];
              database.ref('bday/' + month).set({
                [date]: newArr,
              });
            } else {
              database.ref('bday/' + month).set({
                [date]: [messagerId],
              });
            }
            initialiseMember(messagerId, ctx.message.from, database)
                .then(async () => {
                  const oldBday: string | null =
                  (await database.ref('users/' + messagerId)
                      .child('birthday').once('value')).val();
                  if (oldBday &&
                      !moment(oldBday, 'DD/MM/YYYY').isSame(bdayMoment)) {
                    const oldMonth = getMonth(moment(oldBday, 'DD/MM/YYYY'));
                    const oldDate = getDate(moment(oldBday, 'DD/MM/YYYY'));
                    database.ref('bday/' + oldMonth).child(oldDate).set(null);
                  }
                  database.ref('users/' + messagerId).update({
                    birthday: bday,
                  });
                });

            ctx.reply(`You have set birthday to ${bday}`);
          } else {
            ctx.reply('Invalid date! Use DD/MM/YYYY');
          }
        } catch (err) {
          ctx.reply('Error: ' + err);
        }
      } else {
        ctx.reply('You are not in the group chat!');
      }
    });
  };
