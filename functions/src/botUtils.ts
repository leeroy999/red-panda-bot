/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import * as admin from 'firebase-admin';
import moment = require('moment');
import { Context } from 'telegraf/typings/context';
import { Update, User } from 'telegraf/typings/core/types/typegram';
import { ADMINLIST, LOGROOM, USERS } from './constants';

export const isValidBday = (bday: string): boolean => {
  const re = /^[0-9]{2}[/]{1}[0-9]{2}[/]{1}[0-9]{4}$/g;
  return re.test(bday);
};

export const initialiseMember = async (
    messagerId: number,
    user: User,
    database: admin.database.Database): Promise<void> => {
  await database.ref(USERS + messagerId).once('value')
      .then((dataFromDb) => {
        if (!dataFromDb.exists()) {
          database.ref(USERS + messagerId).set({
            name: `${user.first_name ?? ''} ${user.last_name ?? ''}`,
            username: user.username,
          });
        } else {
          database.ref(USERS + messagerId).update({
            name: `${user.first_name ?? ''} ${user.last_name ?? ''}`,
            username: user.username,
          });
        }
      });
};

export const removeBdayMember = async (
    bday: moment.Moment,
    database: admin.database.Database,
    messagerId: number,
): Promise<void> => {
  const month = getMonth(bday);
  const date = getDate(bday);
  await database.ref('bday').child(month)
      .child(date).once('value').then((data) => {
        const bdayArr: number[] | null = data.val();
        const newBdayArr = bdayArr &&
          bdayArr.filter((id: number) => id !== messagerId);
        if (newBdayArr && newBdayArr.length !== 0) {
          database.ref('bday/' + month).child(date).set(newBdayArr);
        } else {
          database.ref('bday/' + month).child(date).remove();
        }
      })
      .catch((e) => {
        throw e;
      });
};

export const removeMember = async (
    messagerId: number,
    database: admin.database.Database,
    ctx: Context<Update>): Promise<void> => {
  await database.ref(USERS + messagerId)
      .once('value').then(async (dataFromDb) => {
        if (dataFromDb.exists()) {
          // remove bday
          if (dataFromDb.child('birthday').exists()) {
            const bday = moment(dataFromDb.child('birthday').val(),
                'DD/MM/YYYY');
            await removeBdayMember(bday, database, messagerId).then(() => {
              database.ref(USERS + messagerId).remove()
                  .catch((error) => {
                    ctx.reply(`${error}`);
                  });
            });
          } else {
            database.ref(USERS + messagerId).remove()
                .catch((error) => {
                  ctx.reply(`${error}`);
                });
          }
        }
      });
};

export const isMember = async (
    database: admin.database.Database,
    ctx: Context<Update>,
    user: User): Promise<boolean> => {
  const messagerId: number | undefined = user.id;
  const chatId: number | null = (await database.ref('admin')
      .child('memberRoom').once('value')).val();
  if (messagerId) {
    const status = !!chatId && await ctx.telegram
        .getChatMember(chatId.toString(), messagerId);
    return status && (status.status === 'creator' ||
        status.status === 'administrator' ||
        status.status === 'member' ||
        status.status === 'restricted');
  } else {
    return false;
  }
};

export const isAdmin = async (
    database: admin.database.Database,
    ctx: Context<Update>,
    user: User): Promise<boolean> => {
  const adminList = await getData(database, ADMINLIST);
  if (adminList.exists() && adminList.val()) {
    return adminList.val().includes(user.id);
  } else {
    return false;
  }
};

export const isSameDayAndMonth = (str1: string, str2: string): boolean => {
  return moment(str1).date() === moment(str2).date() &&
      moment(str1).month() === moment(str2).month();
};

export const getMonth = (m: moment.Moment): string => {
  return m.format('MMMM').toUpperCase();
};

export const getDate = (m: moment.Moment): string => {
  return m.format('DD-MM');
};

export const getData =
  async (database: admin.database.Database, ref: string):
  Promise<admin.database.DataSnapshot> => {
    return await database.ref(ref).once('value');
  };

export const setData =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async (database: admin.database.Database, ref: string, value: any):
  Promise<void> => {
    database.ref(ref).set(value);
  };

export const log = async (
    ctx: Context<Update>,
    database: admin.database.Database,
    msg: string): Promise<void> => {
  const logChatId = await getData(database, LOGROOM);
  const user = ctx.from?.username;
  const chatId = ctx.chat?.id;
  if (logChatId.exists()) {
    ctx.telegram.sendMessage(logChatId.val(), `[${chatId}] ${user}: ${msg}`);
  }
};
