/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as admin from 'firebase-admin';
import {Context, Telegraf} from 'telegraf';
import {Update} from 'telegraf/typings/core/types/typegram';

export const adminCommands =
  (bot: Telegraf<Context<Update>>,
      password: string,
      database: admin.database.Database): void => {
    /* command: /setAdmin <Password>
     *
     * purpose: Set messager as superAdmin.
     */
    bot.command('/setAdmin', async (ctx) => {
      const msg = ctx.message.text;
      const pass = msg.substring(msg.indexOf(' ') + 1);
      if (pass === password) {
        const dataFromDb = await database.ref('admin').once('value');
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
      } else {
        ctx.reply('Wrong password.');
      }
    });

    /* command: /setAdminRoom <RoomName>
     *
     * purpose: Set current chat as admin chat
     */
    bot.command('/setAdminRoom', async (ctx) => {
      const admin = await database.ref('admin').once('value');
      const superAdminArr: number[] | null = admin.child('superAdminList')
          .val();
      const messager: number = ctx.message.from.id;
      if (superAdminArr && superAdminArr.includes(messager)) {
        const chatId: number = ctx.chat.id;
        database.ref('admin').update({adminRoom: chatId});
        // if (!admin.child('adminRoomList').exists()) {
        //   database.ref('admin').child('adminRoomList').set({
        //     [roomName]: chatId,
        //   });
        // } else {
        //   const adminRoomList: {[x: string]: number} = admin
        //       .child('adminRoomList').val();
        //   if (adminRoomList[roomName] !== chatId) {
        //     adminRoomList[roomName] = chatId;
        //     database.ref('admin').child('adminRoomList')
        //        .update(adminRoomList);
        //   }
        // }
        ctx.reply('Set this chat as admin chat.');
      } else {
        ctx.reply('ERROR: Not a superadmin!');
      }
    });
    /* command: /setMemberRoom <RoomName>
     *
     * purpose: Set current chat as admin chat
     */
    bot.command('/setMemberRoom', async (ctx) => {
      const admin = await database.ref('admin').once('value');
      const superAdminArr: number[] | null = admin.child('superAdminList')
          .val();
      const messager: number = ctx.message.from.id;
      if (superAdminArr && superAdminArr.includes(messager)) {
        const chatId: number = ctx.chat.id;
        database.ref('admin').update({memberRoom: chatId});
        ctx.reply('Set this chat as member chat.');
      } else {
        ctx.reply('ERROR: Not a superadmin!');
      }
    });
  };
