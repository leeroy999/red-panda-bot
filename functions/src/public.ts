/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as admin from 'firebase-admin';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { getData, isAdmin, isMember, log } from './botUtils';
import {
  ADMINROOM,
  AFTERNOONREMINDER,
  MEMBERROOM,
  MORNINGREMINDER,
  REMOVEREMINDER,
  SUPERADMINLIST,
} from './constants';
import { adminCmds, bus, greeting, hotlines, issues,
  memberCmds, noParam, pgphandbook, pgphandbookLink, publicCmds,
  redPandaFacts, superAdminCmds } from './text';
import axios from 'axios';


export const publicCommands =
  (bot: Telegraf<Context<Update>>,
      database: admin.database.Database): void => {
    /* command: /commands
     *
     * purpose: Show commands
     */
    bot.command('/commands', async (ctx) => {
      const chatType = ctx.chat.type;
      const chatId = ctx.chat.id;
      const userId = ctx.from.id;
      const memberRoom = await getData(database, MEMBERROOM);
      const adminRoom = await getData(database, ADMINROOM);
      const superAdminList = await getData(database, SUPERADMINLIST);
      const admin = await isAdmin(database, ctx, ctx.from);
      const member = await isMember(database, ctx, ctx.from);
      if (superAdminList.val() &&
        superAdminList.val().includes(userId) && chatType === 'private') {
        ctx.replyWithHTML(superAdminCmds);
      }
      if (adminRoom.val() === chatId ||
        (chatType === 'private' && admin)) {
        ctx.replyWithHTML(adminCmds);
      }
      if (memberRoom.val() === chatId ||
        adminRoom.val() === chatId ||
        (chatType === 'private' && (member || admin))) {
        ctx.replyWithHTML(memberCmds);
      }
      ctx.replyWithHTML(publicCmds);
      log(ctx, database, ctx.message.text);
    });

    /* command: /help
     *
     * purpose: Show greeting message
     */
    bot.command('/help', (ctx) => {
      ctx.reply(greeting());
      log(ctx, database, ctx.message.text);
    });

    /* command: /bus
     *
     * purpose: Check NUS bus website
     */
    bot.command('/bus', async (ctx) => {
      ctx.reply(bus.text, {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'NUS Bus Routes',
              url: bus.link,
            }],
            [{
              text: 'iOS app',
              url: bus.ios,
            }],
            [{
              text: 'Android app',
              url: bus.android,
            }],
          ],
        },
      });
      log(ctx, database, ctx.message.text);
    });

    /* command: /pgphandbook
     *
     * purpose: Show greeting message
     */
    bot.command('/pgphandbook', async (ctx) => {
      ctx.reply(pgphandbook, {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'PGP Handbook',
              url: pgphandbookLink,
            }],
          ],
        },
      });
      log(ctx, database, ctx.message.text);
    });

    /* command: /roll
     *
     * purpose: roll dice
     */
    bot.command('/roll', async (ctx) => {
      ctx.replyWithDice();
      log(ctx, database, ctx.message.text);
    });

    /* command: /rand <lowest: default 0> <highest>
     *
     * purpose: random number from lowest to highest
     */
    bot.command('/rand', async (ctx) => {
      const msg = ctx.message.text;
      const firstSpace = msg.indexOf(' ');
      const secondSpace = msg.indexOf(' ', firstSpace + 1);
      if (secondSpace !== -1) {
        const min = parseInt(msg.substring(firstSpace + 1, secondSpace));
        const max = parseInt(msg.substring(secondSpace + 1));
        if (!isNaN(max) && !isNaN(min)) {
          const rand = Math.floor(Math.random() * (max - min + 1)) + min;
          ctx.reply(`Your Random Number: ${rand}`);
        } else {
          ctx.reply('Not a number!');
        }
      } else if (firstSpace !== -1) {
        const max = parseInt(msg.substring(firstSpace + 1));
        if (!isNaN(max)) {
          const rand = Math.floor(Math.random() * (max + 1));
          ctx.reply(`Your Random Number: ${rand}`);
        } else {
          ctx.reply('Not a number!');
        }
      } else {
        ctx.reply(`Random: ${Math.random()}`);
      }
      log(ctx, database, ctx.message.text);
    });

    /* command: /reminder
     *
     * purpose: set reminder either at 9AM or 1PM or both
     */
    bot.command('/reminder', async (ctx) => {
      if (ctx.chat.type === 'private') {
        ctx.reply('When do you want to set the alarm? You can select multiple',
            {
              'reply_markup': {
                'inline_keyboard': [
                  [
                    {
                      text: '9 AM',
                      callback_data: MORNINGREMINDER,
                    },
                  ],
                  [
                    {
                      text: '1 PM',
                      callback_data: AFTERNOONREMINDER,
                    },
                  ],
                  [
                    {
                      text: 'CANCEL',
                      callback_data: REMOVEREMINDER,
                    },
                  ],
                ],
              },
            });
      } else {
        ctx.reply('Please private message me this command!');
      }
      log(ctx, database, ctx.message.text);
    });

    /* command: /hotline
     *
     * purpose: send important contacts and hotlines
     */
    bot.command('/hotline', async (ctx) => {
      ctx.replyWithHTML(hotlines);
      log(ctx, database, ctx.message.text);
    });

    /* command: /emergency
     *
     * purpose: send important emergency information
     */
    bot.command('/emergency', async (ctx) => {
      ctx.replyWithHTML(issues.emergency, {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'NUS Counselling',
              url: issues.counsellingLink,
            }],
          ],
        },
      });
      log(ctx, database, ctx.message.text);
    });

    /* command: /rules
     *
     * purpose: send housing rules and Demerit Point Structure
     */
    bot.command('/rules', async (ctx) => {
      ctx.replyWithHTML(issues.rules, {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'Demerit Point Structure',
              url: issues.demeritLink,
            }],
          ],
        },
      });
      log(ctx, database, ctx.message.text);
    });

    /* command: /maintenance
     *
     * purpose: send maintenance issues info and procedures
     */
    bot.command('/maintenance', async (ctx) => {
      ctx.replyWithHTML(issues.maintenance, {
        reply_markup: {
          inline_keyboard: [
            [{
              text: 'UHMS',
              url: issues.uhmsLink,
            }],
          ],
        },
      });
      log(ctx, database, ctx.message.text);
    });

    /* command: /others
     *
     * purpose: send other residential issues procedures
     */
    bot.command('/others', async (ctx) => {
      ctx.replyWithHTML(issues.residential);
      log(ctx, database, ctx.message.text);
    });

    /* command: /dyom
     *
     * purpose: send other residential issues procedures
     */
    bot.command('/dyom', async (ctx) => {
      ctx.replyWithChatAction('upload_document');
      ctx.replyWithDocument({
        source: 'src/dyom.pdf',
      }).catch((e) => {
        ctx.reply(`${e}`);
      });
      log(ctx, database, ctx.message.text);
    });

    /* command: /pic
     *
     * purpose: Pictures of red panda!
     */
    bot.command('/pic', async (ctx) => {
      const res = await axios.get('https://unsplash.com/s/photos/red-panda');
      const data = await res.data;
      const urlRegex = /"(https?:\/\/unsplash.com\/photos[^\s].*?)\\/g;
      const arrUrl = JSON.stringify(data).match(urlRegex);
      if (arrUrl !== null) {
        const len = arrUrl.length;
        const rand = Math.floor(Math.random() * (len));
        ctx.replyWithChatAction('upload_photo');
        ctx.replyWithPhoto(arrUrl[rand].slice(1, -1))
            .catch(() => {
              ctx.reply('Unable to fetch image. Try again.');
            });
      }
      log(ctx, database, ctx.message.text);
    });

    /* command: /joke
     *
     * purpose: send other residential issues procedures
     */
    bot.command('/joke', async (ctx) => {
      const res = await axios.get('https://official-joke-api.appspot.com/random_joke');
      const data = await res.data;
      if (data.setup) {
        ctx.reply(data.setup, {
          reply_markup: {
            inline_keyboard: [
              [{
                text: 'Reveal Answer',
                callback_data: `joke${data.punchline}`,
              }],
            ],
          },
        });
      } else {
        ctx.reply('The joker is down :(');
      }
      log(ctx, database, ctx.message.text);
    });

    /* command: /fact
     *
     * purpose: send other residential issues procedures
     */
    bot.command('/fact', async (ctx) => {
      const len = redPandaFacts.length;
      const rand = Math.floor(Math.random() * (len));
      ctx.replyWithHTML(`<b>Did you know?</b> ${redPandaFacts[rand]}`);
      log(ctx, database, ctx.message.text);
    });

    /* command: /8ball <question>
     *
     * purpose: ask 8ball question
     */
    bot.command('/8ball', async (ctx) => {
      const msg = ctx.message.text;
      const firstSpace = msg.indexOf(' ');
      if (firstSpace === -1) {
        ctx.replyWithHTML(noParam);
      } else {
        const question = msg.substring(msg.indexOf(' ') + 1);
        const params = encodeURIComponent(question);
        const res = await axios.get('https://8ball.delegator.com/magic/JSON/' + params);
        const data = await res.data;
        if (data.magic.answer) {
          ctx.reply(data.magic.answer);
        } else {
          ctx.reply('ERROR: 8ball not feeling so good...');
        }
      }
      log(ctx, database, ctx.message.text);
    });
  };
